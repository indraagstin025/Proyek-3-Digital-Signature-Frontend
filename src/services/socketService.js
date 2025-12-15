// src/services/socketService.js
import { io } from "socket.io-client";

// Pastikan VITE_API_URL mengarah ke backend (misal http://localhost:3000)
// Jika undefined, fallback ke localhost:3000
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket;

export const socketService = {
  connect: () => {
    // Jika socket sudah ada dan tersambung, gunakan yang ada
    if (socket && socket.connected) {
      console.log("⚡ [Socket] Reusing existing connection:", socket.id);
      return socket;
    }

    console.log("🔌 [Socket] Connecting to:", SOCKET_URL);

    socket = io(SOCKET_URL, {
      withCredentials: true, // PENTING: Kirim Cookie HttpOnly
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      path: "/socket.io/", // Pastikan path sesuai backend
    });

    socket.on("connect", () => {
      console.log("✅ [Socket] Connected! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Socket] Connection Error:", err.message);

      // TAMBAHAN: Jika error karena Auth, matikan socket agar tidak spam reconnect
      if (err.message.includes("Authentication error") || err.message.includes("token missing")) {
        console.warn("🔒 Auth gagal, memutus koneksi socket. Menunggu login ulang...");
        socket.disconnect();
      }
    });

    return socket;
  },

  // 2. Room Management
  joinRoom: (documentId) => {
    if (socket) socket.emit("join_room", documentId);
  },

  leaveRoom: (documentId) => {
    if (socket) socket.emit("leave_room", documentId);
  },

  // 3. Emitters (Kirim Data)
  emitDrag: (data) => {
    if (socket) socket.emit("drag_signature", data);
  },

  emitAddSignature: (documentId, signature) => {
    if (socket) socket.emit("add_signature_live", { documentId, signature });
  },

  emitRemoveSignature: (documentId, signatureId) => {
    if (socket) socket.emit("remove_signature_live", { documentId, signatureId });
  },

  notifyDataChanged: (documentId) => {
    if (socket) socket.emit("trigger_reload", documentId);
  },

  emitCursorMove: (data) => {
    if (socket) socket.emit("cursor_move", data);
  },

  // 4. Listeners (Terima Data)
  // Kita bungkus callback agar aman jika socket belum ready
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

  // Generic listener/unlistener untuk event apapun
  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },

  off: (event, callback) => {
    if (socket) socket.off(event, callback);
  },

  // 5. Cleanup
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};
