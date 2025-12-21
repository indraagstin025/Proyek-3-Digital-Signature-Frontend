/**
 * @file apiClient.js
 * @description Konfigurasi Axios final: aman dari error JSON.parse,
 * stabil, mendukung sesi cookie, link production/local otomatis,
 * fitur "Silent Check" untuk 401, DAN Handling Timeout/Network.
 */

import axios from "axios";
import { toast } from "react-hot-toast"; // 🔥 Tambahkan ini untuk feedback otomatis

/* ============================================================
 * 1. KONFIGURASI BASE URL (DYNAMIC)
 * ============================================================ */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.moodvis.my.id/api"
    : "http://localhost:3000/api");

console.log(`[API Client] Base URL: ${API_BASE_URL}`);

/* ============================================================
 * AXIOS INSTANCE (JSON)
 * ============================================================ */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // cookie session tetap dikirim
  
  // 🔥 FIX UTAMA: Timeout 10 Detik
  // Jika server tidak merespon dalam 10 detik, batalkan request.
  // Ini mencegah spinner berputar selamanya saat ganti halaman.
  timeout: 300000, 
});

/* ============================================================
 * OPTIONAL AXIOS INSTANCE (FILE / BLOB DOWNLOAD)
 * ============================================================ */
export const apiFileClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  responseType: "blob",
  timeout: 30000, // File download butuh waktu lebih lama (30s)
});

/* ============================================================
 * REQUEST INTERCEPTOR — AMAN
 * ============================================================ */
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("authUser");

    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (parseError) {
        console.warn("[API] JSON.parse(authUser) gagal → token dihapus.");
        localStorage.removeItem("authUser");
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================
 * RESPONSE INTERCEPTOR — STABIL & PINTAR
 * Menangani 401, network error, Timeout, dan Silent Check.
 * ============================================================ */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { code, message, response, config } = error;

    // 1. Cek apakah request dibatalkan (CancelToken) - Abaikan
    if (axios.isCancel(error) || code === "ERR_CANCELED") {
      return new Promise(() => {});
    }

    // 2. Cek apakah ini Request Khusus yang minta skip interceptor (Silent Check)
    if (config && config._skipSessionCheck) {
        return Promise.reject(error); 
    }

    // 3. 🔥 HANDLE TIMEOUT (Penyebab Loading Terus Menerus)
    if (code === "ECONNABORTED" || message.includes("timeout")) {
        console.error("[API] Request Timeout");
        // Opsional: Toast hanya muncul jika bukan silent check
        if (!config?._silent) toast.error("Koneksi lambat. Permintaan waktu habis.", {
          id: "timeout-error" 
        });

        return Promise.reject(new Error("Request Timeout"));
    }

    // 4. 🔥 HANDLE NETWORK ERROR / OFFLINE
    if (code === "ERR_NETWORK" || !response) {
        console.error("[API] Network Error / Offline");
        
        const isOffline = !navigator.onLine;
        const errorMsg = isOffline 
            ? "Anda sedang offline. Periksa koneksi internet." 
            : "Gagal terhubung ke server. Pastikan backend aktif.";

        if (!config?._silent) toast.error(errorMsg, {
          id: "network-error"
        });
        
        // Kembalikan error standard agar UI bisa menangani (misal stop loading)
        return Promise.reject(new Error(errorMsg));
    }

    // 5. Handle Response Error dari Server
    if (response) {
      const status = response.status;
      const msg = response.data?.message || "";

      // Handle 401 (Unauthorized) Global
      if (status === 401) {
        // Cek pesan spesifik atau anggap semua 401 adalah sesi habis
        if (msg.includes("Sesi") || msg.includes("berakhir") || msg.includes("Unauthorized") || msg.includes("Token")) {
          window.dispatchEvent(new CustomEvent("sessionExpired"));
        }
      }

      // 403 Forbidden, 404 Not Found, 500 Server Error -> Biarkan catch di component yang menangani
      return Promise.reject(error);
    }

    console.error("[API] Unknown Error:", error);
    return Promise.reject(new Error("Terjadi kesalahan yang tidak terduga."));
  }
);

export default apiClient;