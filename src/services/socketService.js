import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.MODE === "production" ? "https://api.moodvis.my.id" : "http://localhost:3000");

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

console.log(`[Socket Service] Base URL derived from API: ${SOCKET_URL}`);

let socket;

export const socketService = {
  connect: () => {
    if (socket && socket.connected) {
      // console.log("⚡ [Socket] Sudah terhubung.");
      return socket;
    }

    console.log("🔌 [Socket] Mencoba connect ke:", SOCKET_URL);

    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      path: "/socket.io/",
    });

    socket.on("connect", () => {
      console.log("✅ [Socket] Connected! Socket ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Socket] Connection Error:", err.message);
      if (err.message.includes("Authentication error")) {
        // Handle auth error if needed
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn(`⚠️ [Socket] Disconnected. Reason: ${reason}`);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      console.log("🛑 [Socket] Disconnect manual.");
      socket.disconnect();
      socket = null;
    }
  },

  // =========================================
  // 1. DOCUMENT ROOM (SIGNING & EDITING)
  // =========================================
  joinRoom: (documentId) => {
    if (socket && socket.connected) {
      console.log(`🚪 [Socket] Joining Doc Room: ${documentId}`);
      socket.emit("join_room", documentId);
    }
  },

  leaveRoom: (documentId) => {
    if (socket) {
      socket.emit("leave_room", documentId);
    }
  },

  notifyDataChanged: (documentId) => {
    if (socket && socket.connected) socket.emit("trigger_reload", documentId);
  },

  // Emit Actions
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

  // Listeners Document
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

  // Listeners Document Status (Finalized)
  onDocumentStatusUpdate: (callback) => {
    if (socket)
      socket.on("document_status_update", (data) => {
        console.log("🔔 [Socket] Doc Status Update:", data);
        callback(data);
      });
  },
  offDocumentStatusUpdate: (callback) => {
    if (socket) socket.off("document_status_update", callback);
  },

  // =========================================
  // 2. GROUP ROOM (DASHBOARD REALTIME)
  // =========================================

  /**
   * Bergabung ke Room Grup untuk menerima update Member & Dokumen.
   */
joinGroupRoom: (groupId) => {
    if (socket && socket.connected) {
      // Kita kirim ID mentah, biar Backend yang format jadi "group_ID" 
      // ATAU kita format di sini.
      // Sesuai kode backend Anda sebelumnya (socketHandler.js), dia melakukan:
      // socket.join(`group_${groupId}`);
      
      // Jadi kita kirim ID saja sudah benar.
      console.log(`🔄 [Socket] Request Join Room untuk Group ID: ${groupId}`);
      socket.emit("join_group_room", groupId); 
    } else {
      console.warn("⚠️ [Socket] Gagal join, socket belum connect.");
    }
  },

  leaveGroupRoom: (groupId) => {
    if (socket) {
      console.log(`👋 [Socket] Leaving Group Room: ${groupId}`);
      socket.emit("leave_group_room", groupId);
    }
  },

  onGroupMemberUpdate: (callback) => {
    if (socket)
      socket.on("group_member_update", (data) => {
        console.log("👥 [Socket RECV] Member Update:", JSON.stringify(data, null, 2));
        callback(data);
      });
  },
  offGroupMemberUpdate: (callback) => {
    if (socket) socket.off("group_member_update", callback);
  },

  onGroupDocumentUpdate: (callback) => {
    if (socket)
      socket.on("group_document_update", (data) => {
        console.log("📄 [Socket RECV] Document Update:", JSON.stringify(data, null, 2));
        callback(data);
      });
  },

  onGroupInfoUpdate: (callback) => {
    if (socket)
      socket.on("group_info_update", (data) => {
        console.log("ℹ️ [Socket RECV] Group Info Update:", data);
        callback(data);
      });
  },

  offGroupDocumentUpdate: (callback) => {
    if (socket) socket.off("group_document_update", callback);
  },

  offGroupInfoUpdate: (callback) => {
    if (socket) socket.off("group_info_update", callback);
  },

  // Helpers Generic
  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },
  off: (event, callback) => {
    if (socket) socket.off(event, callback);
  },
};
