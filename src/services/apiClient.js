/**
 * @file apiClient.js
 * @description Konfigurasi Axios final: aman dari error JSON.parse,
 * stabil, dan mendukung sesi menggunakan cookie + token.
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
 * RESPONSE INTERCEPTOR — STABIL
 * Menangani 401, network error, dan error tak dikenal.
 * ============================================================ */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // FIX: Abaikan error pembatalan (common saat unmount/strict mode)
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return new Promise(() => {}); // swallow the cancel
    }

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "";

      if (status === 401) {
        if (msg.includes("Sesi tidak ditemukan") || msg.includes("Sesi Anda telah berakhir")) {
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
