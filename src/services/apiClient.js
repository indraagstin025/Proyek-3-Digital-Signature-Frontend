/**
 * @file apiClient.js
 * @description Konfigurasi Axios final: aman dari error JSON.parse,
 * stabil, mendukung sesi cookie, dan fitur "Silent Check" untuk 401.
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

console.log(`[API Client] Base URL: ${API_BASE_URL}`);

/* ============================================================
 * AXIOS INSTANCE (JSON)
 * ============================================================ */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // cookie session tetap dikirim
});

/* ============================================================
 * OPTIONAL AXIOS INSTANCE (FILE / BLOB DOWNLOAD)
 * ============================================================ */
export const apiFileClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  responseType: "blob",
});

/* ============================================================
 * REQUEST INTERCEPTOR — AMAN
 * Tidak membatalkan request, tidak redirect dalam interceptor.
 * ============================================================ */
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("authUser");

    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user?.token) {
          // Opsional: Jika backend masih support Bearer token selain Cookie
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
 * Menangani 401, network error, dan mendukung "Silent Check".
 * ============================================================ */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Cek apakah request dibatalkan (CancelToken)
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return new Promise(() => {});
    }

    // 2. Cek apakah ini Request Khusus yang minta skip interceptor (Silent Check)
    // Digunakan oleh authService.getMe() saat inisialisasi aplikasi
    if (error.config && error.config._skipSessionCheck) {
        // Langsung lempar error ke pemanggil (try-catch di service),
        // JANGAN trigger event modal global.
        return Promise.reject(error); 
    }

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "";

      // 3. Handle 401 (Unauthorized) Global
      if (status === 401) {
        // Trigger Modal HANYA jika pesannya tentang sesi habis/hilang
        // DAN bukan request yang di-skip di atas
        if (msg.includes("Sesi") || msg.includes("berakhir")) {
          window.dispatchEvent(new CustomEvent("sessionExpired"));
        }
      }

      return Promise.reject(error);
    }

    if (error.request) {
      const networkError = {
        response: {
          data: {
            code: "NETWORK_ERROR",
            message: "Koneksi ke server lambat atau tidak stabil. Silakan coba lagi.",
          },
          status: 503,
        },
      };
      return Promise.reject(networkError);
    }

    console.error("[API] Unknown Error:", error);
    return Promise.reject(new Error("Terjadi kesalahan yang tidak terduga."));
  }
);

export default apiClient;