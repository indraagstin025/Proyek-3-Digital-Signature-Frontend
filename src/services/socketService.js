// src/services/socketService.js
import { io } from "socket.io-client";

// --- 1. LOGIKA PENENTUAN URL (SAMA DENGAN API CLIENT) ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.moodvis.my.id"
    : "http://localhost:3000");

// --- 2. KONVERSI KE SOCKET URL ---
// Kita harus menghapus "/api" dari belakang URL karena Socket.io jalan di root.
// Contoh: "https://api.moodvis.my.id/api" --> Menjadi "https://api.moodvis.my.id"
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

console.log(`[Socket Service] Base URL derived from API: ${SOCKET_URL}`);

let socket;

export const socketService = {
  connect: () => {
    // Singleton: Jika sudah connect, pakai yang lama
    if (socket && socket.connected) {
      return socket;
    }

    console.log("🔌 [Socket] Connecting to:", SOCKET_URL);

    socket = io(SOCKET_URL, {
      withCredentials: true, // Wajib untuk cookie/session
      transports: ["websocket"], // Wajib untuk kestabilan di Railway/Cloudflare
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      path: "/socket.io/",
    });

    socket.on("connect", () => {
      console.log("✅ [Socket] Connected! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Socket] Connection Error:", err.message);

      // Logika pencegahan spam reconnect jika Auth gagal
      if (err.message.includes("Authentication error") || err.message.includes("token missing")) {
        console.warn("🔒 Auth gagal, memutus koneksi socket...");
        socket.disconnect();
      }
    });

    return socket;
  },

  // --- ROOM MANAGEMENT ---
  joinRoom: (documentId) => {
    if (socket && socket.connected) socket.emit("join_room", documentId);
  },

  leaveRoom: (documentId) => {
    if (socket) socket.emit("leave_room", documentId);
  },

  // --- EMITTERS (Kirim Data) ---
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
    if (socket && socket.connected) socket.emit("cursor_move", data);
  },

  // --- LISTENERS (Terima Data) ---
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

  // Helpers
  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },

  off: (event, callback) => {
    if (socket) socket.off(event, callback);
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};