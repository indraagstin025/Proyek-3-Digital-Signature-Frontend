/**
 * @file apiClient.js
 * @description Modul konfigurasi klien Axios dengan validasi jaringan, 
 * penanganan error otomatis, dan deteksi sesi berakhir.
 */

import axios from "axios";

/**
 * Base URL untuk API backend.
 * 
 * Prioritas:
 * 1. Menggunakan `VITE_API_URL` dari environment (misalnya di Vercel/Railway)
 * 2. Berdasarkan `NODE_ENV` (production atau development)
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://proyek-3digital-signature-production.up.railway.app/api"
    : "http://localhost:3000/api");

console.log(`[API Client] Base URL: ${API_BASE_URL}`);

/**
 * Instansiasi klien Axios utama.
 * 
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Interceptor respons untuk menangani berbagai skenario error:
 * - Error 401 (Sesi berakhir)
 * - Error jaringan (server tidak merespons)
 * - Error tidak terduga
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {
      if (error.response.status === 401 && error.response.data) {
        const errorMessage = error.response.data.message || "";
        if (
          errorMessage.includes("Sesi tidak ditemukan") ||
          errorMessage.includes("Sesi Anda telah berakhir")
        ) {
          const sessionExpiredEvent = new CustomEvent("sessionExpired");
          window.dispatchEvent(sessionExpiredEvent);
        }
      }
      return Promise.reject(error);
    }

    if (error.request) {
      const networkError = {
        response: {
          data: {
            code: "NETWORK_ERROR",
            message:
              "Koneksi ke server lambat atau tidak stabil. Silakan coba lagi beberapa saat.",
          },
          status: 503,
        },
      };
      return Promise.reject(networkError);
    }

    return Promise.reject(new Error("Terjadi kesalahan yang tidak terduga."));
  }
);

export default apiClient;
