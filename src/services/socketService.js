import { io } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.moodvis.my.id"
    : "http://localhost:3000");

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

console.log(`[Socket Service] Base URL derived from API: ${SOCKET_URL}`);

let socket;

export const socketService = {
  connect: () => {
    if (socket && socket.connected) {
      console.log("⚡ [Socket] Sudah terhubung, menggunakan koneksi aktif.");
      return socket;
    }

    console.log("🔌 [Socket] Mencoba connect ke:", SOCKET_URL);
    
    // DEBUG: Cek apakah cookie terbaca oleh JS (Hanya jika tidak HttpOnly)
    // Jika HttpOnly, ini string kosong, tapi browser tetap mengirimnya.
    console.log("🍪 [Socket] Cookie Visible (Document):", document.cookie);

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
      
      // Cek detail error dari backend (kadang ada di err.data)
      if (err.data) console.error("   Detail:", err.data);

      if (err.message.includes("Authentication error") || err.message.includes("token missing")) {
        console.warn("🔒 Auth gagal. Server menolak token/cookie.");
        // Opsi: Jangan langsung disconnect biar bisa retry jika token di-refresh
        // socket.disconnect(); 
      }
    });

    socket.on("disconnect", (reason) => {
       console.warn(`⚠️ [Socket] Disconnected. Reason: ${reason}`);
    });

    return socket;
  },

  joinRoom: (documentId) => {
    if (socket && socket.connected) {
        console.log(`🚪 [Socket] Joining Room: ${documentId}`);
        socket.emit("join_room", documentId);
    } else {
        console.warn("⚠️ [Socket] Gagal Join Room: Socket belum connect.");
    }
  },

  leaveRoom: (documentId) => {
    if (socket) {
        console.log(`👋 [Socket] Leaving Room: ${documentId}`);
        socket.emit("leave_room", documentId);
    }
  },

  emitDrag: (data) => {
    if (socket && socket.connected) {
        // LOG PENTING: Cek Document ID sebelum kirim
        // console.log("📤 [Socket] Emit Drag:", data); 
        socket.emit("drag_signature", data);
    }
  },

  emitAddSignature: (documentId, signature) => {
    if (socket && socket.connected) {
        console.log("✨ [Socket] Emit Add Signature ke Room:", documentId);
        socket.emit("add_signature_live", { documentId, signature });
    }
  },

  emitRemoveSignature: (documentId, signatureId) => {
    if (socket && socket.connected) {
        console.log("🗑️ [Socket] Emit Remove Signature:", signatureId);
        socket.emit("remove_signature_live", { documentId, signatureId });
    }
  },

  notifyDataChanged: (documentId) => {
    if (socket && socket.connected) socket.emit("trigger_reload", documentId);
  },

  emitCursorMove: (data) => {
    if (socket && socket.connected) socket.emit("cursor_move", data);
  },

  // --- LISTENERS ---
  onPositionUpdate: (callback) => {
    if (socket) socket.on("update_signature_position", callback);
  },

  onAddSignatureLive: (callback) => {
    if (socket) socket.on("add_signature_live", (data) => {
        console.log("📥 [Socket] Terima Signature Baru dari Teman:", data);
        callback(data);
    });
  },

  onRemoveSignatureLive: (callback) => {
    if (socket) socket.on("remove_signature_live", callback);
  },

  onRefetchData: (callback) => {
    if (socket) socket.on("refetch_data", () => {
        console.log("🔄 [Socket] Diminta Reload Data oleh Server");
        callback();
    });
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
      console.log("🛑 [Socket] Disconnect manual dipanggil.");
      socket.disconnect();
      socket = null;
    }
  },
};