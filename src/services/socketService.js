import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.MODE === "production" ? "https://api.moodvis.my.id" : "http://localhost:3000");

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let socket;

const groupListeners = new Map();

export const socketService = {
  connect: () => {
    if (socket && socket.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      path: "/socket.io/",
    });

    socket.on("connect", () => {
    });

    socket.on("connect_error", (err) => {
      if (err.message.includes("Authentication error")) {
    
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn(`${reason}`);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinRoom: (documentId) => {
    if (socket && socket.connected) {
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
    if (socket && socket.connected) {
      socket.emit("join_group_room", groupId);
    }
  },

  leaveGroupRoom: (groupId) => {
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
};
