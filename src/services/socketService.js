// src/services/socketService.js
import { io } from "socket.io-client";

// 1. Ambil URL dari Environment Variable
// Prioritaskan VITE_API_BASE_URL, lalu VITE_API_URL, fallback ke localhost
const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

// 2. Bersihkan URL (Hapus akhiran "/api" jika ada)
// Socket.io butuh root domain (misal: https://api.moodvis.my.id), bukan endpoint API
const SOCKET_URL = rawUrl.replace(/\/api\/?$/, ""); 

let socket;

export const socketService = {
  connect: () => {
    // Jika socket sudah ada dan tersambung, gunakan yang ada
    if (socket && socket.connected) {
      // console.log("⚡ [Socket] Reusing existing connection:", socket.id);
      return socket;
    }

    console.log("🔌 [Socket] Connecting to:", SOCKET_URL);

    socket = io(SOCKET_URL, {
      withCredentials: true, // PENTING: Agar cookie Session/JWT terkirim
      transports: ["websocket"], // Paksa websocket agar lebih stabil & cepat
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      path: "/socket.io/", // Default path socket.io
    });

    socket.on("connect", () => {
      console.log("✅ [Socket] Connected! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Socket] Connection Error:", err.message);

      // Jika error karena Auth, matikan socket agar tidak spam reconnect
      if (err.message.includes("Authentication error") || err.message.includes("token missing")) {
        console.warn("🔒 Auth gagal, memutus koneksi socket. Menunggu login ulang...");
        socket.disconnect();
      }
    });

    return socket;
  },

  // 2. Room Management
  joinRoom: (documentId) => {
    if (socket && socket.connected) socket.emit("join_room", documentId);
  },

  leaveRoom: (documentId) => {
    if (socket) socket.emit("leave_room", documentId);
  },

  // 3. Emitters (Kirim Data)
  emitDrag: (data) => {
    if (socket && socket.connected) socket.emit("drag_signature", data);
  },

  emitAddSignature: (documentId, signature) => {
    if (socket && socket.connected) socket.emit("add_signature_live", { documentId, signature });
  },

  emitRemoveSignature: (documentId, signatureId) => {
    if (socket && socket.connected) socket.emit("remove_signature_live", { documentId, signatureId });
  },

  notifyDataChanged: (documentId) => {
    if (socket && socket.connected) socket.emit("trigger_reload", documentId);
  },

  emitCursorMove: (data) => {
    // Cek connected agar tidak error saat user putus nyambung
    if (socket && socket.connected) socket.emit("cursor_move", data);
  },

  // 4. Listeners (Terima Data)
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

  // Generic listener/unlistener
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