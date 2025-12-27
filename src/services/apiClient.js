/* eslint-disable no-unused-vars */
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.moodvis.my.id/api"
    : "http://localhost:3000/api");

// 1. Setup Instance Utama
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // PENTING: Ini yang membuat browser otomatis kirim Cookie
  timeout: 15000,
});

// 2. Setup Instance Khusus File (Blob)
export const apiFileClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // PENTING
  responseType: "blob",
  timeout: 30000,
});

// --- REQUEST INTERCEPTOR (DIBERSIHKAN) ---
// Kita HAPUS logika penyuntikan header 'Authorization'.
// Biarkan backend membaca token HANYA dari Cookie.
apiClient.interceptors.request.use(
  (config) => {
    // Debugging (Opsional): Pastikan kredensial dikirim
    // console.log(`🚀 Requesting: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { code, message, response } = error;

    // 1. Cek Koneksi / Offline / Timeout
    // Mengembalikan pesan standar "Offline-Detected" agar Service/Hook bisa menangani UI-nya.
    if (
      code === "ECONNABORTED" || 
      code === "ERR_NETWORK" || 
      message?.includes("timeout") ||
      (typeof navigator !== "undefined" && !navigator.onLine)
    ) {
        return Promise.reject(new Error("Offline-Detected"));
    }

    // 2. Handle Cancel Request
    if (axios.isCancel(error) || code === "ERR_CANCELED") {
      return Promise.reject({ isCanceled: true, message: "Request canceled" });
    }

    // 3. Handle HTTP Errors (401, 403, 500)
    if (response) {
      const status = response.status;
      
      // Deteksi Session Expired (401)
      if (status === 401) {
        // Cek apakah response body mengindikasikan token invalid
        // Backend Anda mengirim: { code: 'SESSION_EXPIRED', ... }
        const data = response.data;
        
        // Trigger event logout global jika sesi benar-benar habis (Refresh Token mati)
        if (data?.code === 'SESSION_EXPIRED' || data?.message?.toLowerCase().includes("sesi berakhir")) {
             console.warn("🔒 Session expired via 401. Triggering logout...");
             window.dispatchEvent(new CustomEvent("sessionExpired"));
        }
      }

      // Kembalikan error utuh agar React Query bisa menangkap error message dari backend
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;