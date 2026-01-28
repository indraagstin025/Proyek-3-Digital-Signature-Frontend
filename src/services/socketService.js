import { io } from "socket.io-client";
import authService from "./authService"; // Import authService

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.MODE === "production" ? "https://api.moodvis.my.id" : "http://localhost:3000");

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let socket;

const groupListeners = new Map();

// ✅ [BARU] Track rooms yang sudah di-join untuk auto-rejoin setelah reconnect
let currentDocumentRoom = null;
let currentGroupRooms = new Set();

// ✅ [BARU] Connection state callbacks
const connectionCallbacks = new Set();

export const socketService = {
  connect: () => {
    if (socket && socket.connected) {
      return socket;
    }

    // Disconnect socket lama jika ada tapi tidak connected
    if (socket) {
      socket.disconnect();
    }

    socket = io(SOCKET_URL, {
      withCredentials: true,
      // ✅ [FIX CRITICAL] Polling dulu untuk ensure cookies terkirim, baru upgrade ke WebSocket
      // WebSocket-first sering gagal kirim cookies di production (browser security)
      transports: ["polling", "websocket"],
      // ✅ [PERBAIKAN] Auto-upgrade ke WebSocket setelah polling berhasil auth
      upgrade: true,
      // ✅ [PERBAIKAN] Unlimited reconnection attempts
      reconnection: true,
      reconnectionAttempts: Infinity,
      // ✅ [PERBAIKAN] Exponential backoff: 1s, 2s, 4s, ... max 30s
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      // ✅ [PERBAIKAN] Timeout settings
      timeout: 20000,
      path: "/socket.io/",
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);

      // ✅ [BARU] Auto-rejoin document room setelah reconnect
      if (currentDocumentRoom) {
        console.log("🔄 Auto-rejoining document room:", currentDocumentRoom);
        socket.emit("join_room", currentDocumentRoom);
      }

      // ✅ [BARU] Auto-rejoin group rooms setelah reconnect
      currentGroupRooms.forEach((groupId) => {
        console.log("🔄 [SocketService] Auto-rejoining group room:", groupId);
        socket.emit("join_group_room", groupId);
      });

      // ✅ [BARU] Notify connection state change
      console.log("[SocketService] Notify connectionCallbacks (Connected)");
      connectionCallbacks.forEach(cb => cb({ connected: true, transport: socket.io.engine.transport.name }));
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [SocketService] Connection error:", err.message, err);

      // ✅ [BARU] Jika WebSocket gagal, akan otomatis fallback ke polling
      if (socket.io.engine) {
        console.log("📡 [SocketService] Current transport:", socket.io.engine.transport?.name);
      }

      // ✅ [FIX] Auto Refresh Token jika Socket Auth Gagal (Throttled)
      if (err.message.includes("Authentication error") || err.message.includes("Invalid or expired") || err.message.includes("Access token missing")) {

        if (socket.isRefreshingToken) {
          console.log("🔒 [SocketService] Refresh already in progress. Skipping duplicate request.");
          return;
        }

        console.warn("🔐 [SocketService] Auth error detected. Attempting to refresh token...");
        socket.isRefreshingToken = true;

        // Panggil getMe() untuk memicu axios interceptor refresh token
        authService.getMe()
          .then(() => {
            console.log("✅ [SocketService] Token refreshed successfully. Reconnecting...");
            // Force reconnect dengan cookie baru
            socket.disconnect();
            socket.connect();
          })
          .catch((refreshErr) => {
            console.error("❌ [SocketService] Token refresh failed:", refreshErr);
            // Jika refresh gagal, kemungkinan session benar-benar habis.
            // Biarkan Socket.io menunggu sebelum retry berikutnya (backoff alami).
          })
          .finally(() => {
            // Reset flag setelah 5 detik agar tidak spam request jika error berlanjut
            setTimeout(() => {
              socket.isRefreshingToken = false;
            }, 5000);
          });
      }

      connectionCallbacks.forEach(cb => cb({ connected: false, error: err.message }));
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔴 [SocketService] Disconnected:", reason);
      connectionCallbacks.forEach(cb => cb({ connected: false, reason }));

      // ✅ [BARU] Jika disconnect karena server, coba reconnect manual
      if (reason === "io server disconnect") {
        // Server memutus koneksi, perlu reconnect manual
        console.log("🔄 Server disconnected, attempting manual reconnect...");
        socket.connect();
      }
      // Untuk alasan lain, Socket.IO akan otomatis reconnect
    });

    // ✅ [BARU] Log ketika reconnecting
    socket.io.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}...`);
    });

    socket.io.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    socket.io.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    // ✅ [BARU] Network online/offline detection
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Network online - attempting to reconnect...");
        if (socket && !socket.connected) {
          socket.connect();
        }
      });

      window.addEventListener("offline", () => {
        console.log("📵 Network offline");
        connectionCallbacks.forEach(cb => cb({ connected: false, reason: "offline" }));
      });
    }

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    // ✅ [BARU] Clear tracked rooms
    currentDocumentRoom = null;
    currentGroupRooms.clear();
  },

  joinRoom: (documentId) => {
    // ✅ [BARU] Track room untuk auto-rejoin
    currentDocumentRoom = documentId;

    if (socket && socket.connected) {
      socket.emit("join_room", documentId);
    } else {
      console.warn("⚠️ Socket not connected, will join room after reconnect");
    }
  },

  leaveRoom: (documentId) => {
    // ✅ [BARU] Clear tracked room
    if (currentDocumentRoom === documentId) {
      currentDocumentRoom = null;
    }

    if (socket) {
      socket.emit("leave_room", documentId);
    }
  },

  notifyDataChanged: (documentId) => {
    if (socket && socket.connected) socket.emit("trigger_reload", documentId);
  },

  emitDrag: (data) => {
    if (socket && socket.connected) socket.emit("drag_signature", data);
  },
  emitAddSignature: (documentId, signature) => {
    if (socket && socket.connected) socket.emit("add_signature_live", { documentId, signature });
  },
  emitRemoveSignature: (documentId, signatureId) => {
    if (socket && socket.connected) socket.emit("remove_signature_live", { documentId, signatureId });
  },
  emitCursorMove: (data) => {
    if (socket && socket.connected) socket.emit("cursor_move", data);
  },

  onPositionUpdate: (callback) => {
    if (socket) socket.on("update_signature_position", callback);
  },
  onAddSignatureLive: (callback) => {
    if (socket) socket.on("add_signature_live", callback);
  },
  onRemoveSignatureLive: (callback) => {
    if (socket) socket.on("remove_signature_live", callback);
  },
  onRefetchData: (callback) => {
    if (socket) socket.on("refetch_data", callback);
  },
  onCursorMove: (callback) => {
    if (socket) socket.on("cursor_move", callback);
  },

  // ✅ [BARU] Emit event saat user menyimpan tanda tangan
  emitSignatureSaved: (documentId) => {
    if (socket && socket.connected) socket.emit("signature_saved", { documentId });
  },

  // ✅ [BARU] Listener untuk notifikasi saat user lain menyimpan tanda tangan
  onSignatureSaved: (callback) => {
    if (socket) socket.on("signature_saved", callback);
  },

  onDocumentStatusUpdate: (callback) => {
    if (socket)
      socket.on("document_status_update", (data) => {
        callback(data);
      });
  },
  offDocumentStatusUpdate: (callback) => {
    if (socket) socket.off("document_status_update", callback);
  },

  /**
   * Bergabung ke Room Grup untuk menerima update Member & Dokumen.
   */
  joinGroupRoom: (groupId) => {
    // ✅ [BARU] Track group room untuk auto-rejoin
    currentGroupRooms.add(groupId);

    if (socket && socket.connected) {
      socket.emit("join_group_room", groupId);
    } else {
      console.warn("⚠️ Socket not connected, will join group room after reconnect");
    }
  },

  leaveGroupRoom: (groupId) => {
    // ✅ [BARU] Clear tracked group room
    currentGroupRooms.delete(groupId);

    if (socket) {
      socket.emit("leave_group_room", groupId);
    }
  },

  onGroupMemberUpdate: (callback) => {
    if (socket) {
      const existingWrapper = groupListeners.get(`member_${callback}`);
      if (existingWrapper) {
        socket.off("group_member_update", existingWrapper);
      }

      const wrapper = (data) => {
        callback(data);
      };
      groupListeners.set(`member_${callback}`, wrapper);
      socket.on("group_member_update", wrapper);
    }
  },
  offGroupMemberUpdate: (callback) => {
    if (socket) {
      const wrapper = groupListeners.get(`member_${callback}`);
      if (wrapper) {
        socket.off("group_member_update", wrapper);
        groupListeners.delete(`member_${callback}`);
      }
    }
  },

  onGroupDocumentUpdate: (callback) => {
    if (socket) {
      const existingWrapper = groupListeners.get(`doc_${callback}`);
      if (existingWrapper) {
        socket.off("group_document_update", existingWrapper);
      }

      const wrapper = (data) => {
        callback(data);
      };
      groupListeners.set(`doc_${callback}`, wrapper);
      socket.on("group_document_update", wrapper);
    }
  },

  offGroupDocumentUpdate: (callback) => {
    if (socket) {
      const wrapper = groupListeners.get(`doc_${callback}`);
      if (wrapper) {
        socket.off("group_document_update", wrapper);
        groupListeners.delete(`doc_${callback}`);
      }
    }
  },

  onGroupInfoUpdate: (callback) => {
    if (socket) {
      const existingWrapper = groupListeners.get(`info_${callback}`);
      if (existingWrapper) {
        socket.off("group_info_update", existingWrapper);
      }

      const wrapper = (data) => {
        callback(data);
      };
      groupListeners.set(`info_${callback}`, wrapper);
      socket.on("group_info_update", wrapper);
    }
  },

  offGroupInfoUpdate: (callback) => {
    if (socket) {
      const wrapper = groupListeners.get(`info_${callback}`);
      if (wrapper) {
        socket.off("group_info_update", wrapper);
        groupListeners.delete(`info_${callback}`);
      }
    }
  },

  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },
  off: (event, callback) => {
    if (socket) socket.off(event, callback);
  },

  // ✅ [BARU] Helper functions untuk connection management

  /**
   * Cek apakah socket sedang connected
   */
  isConnected: () => {
    return socket && socket.connected;
  },

  /**
   * Dapatkan socket instance (untuk advanced usage)
   */
  getSocket: () => socket,

  /**
   * Subscribe ke perubahan status koneksi
   * @param {Function} callback - Called with { connected: boolean, transport?: string, reason?: string, error?: string }
   * @returns {Function} Unsubscribe function
   */
  onConnectionChange: (callback) => {
    connectionCallbacks.add(callback);

    // Immediately call with current state
    if (socket) {
      callback({
        connected: socket.connected,
        transport: socket.connected ? socket.io?.engine?.transport?.name : null
      });
    }

    // Return unsubscribe function
    return () => {
      connectionCallbacks.delete(callback);
    };
  },

  /**
   * Force reconnect - untuk manual retry
   */
  forceReconnect: () => {
    console.log("🔄 Force reconnecting...");

    if (socket) {
      socket.disconnect();
      socket.connect();
    } else {
      // Jika socket belum pernah dibuat, panggil connect
      socketService.connect();
    }
  },

  /**
   * Get current connection info
   */
  getConnectionInfo: () => {
    if (!socket) {
      return { connected: false, transport: null, id: null };
    }
    return {
      connected: socket.connected,
      transport: socket.io?.engine?.transport?.name || null,
      id: socket.id || null,
    };
  },
};
