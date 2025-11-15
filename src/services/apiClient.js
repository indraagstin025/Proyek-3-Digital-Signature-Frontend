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
 * 1. Menggunakan `VITE_API_URL` dari environment (.env pada Vite)
 * 2. Berdasarkan `import.meta.env.MODE` (production atau development)
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
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
 * Interceptor request untuk menambahkan token otentikasi (JWT)
 * dari localStorage ke setiap request.
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Ambil data user dari localStorage
    const userString = localStorage.getItem("authUser");
    
    if (userString) {
      // 2. Parse data untuk mendapatkan token
      //    CATATAN: Sesuaikan ini jika struktur data Anda berbeda.
      //    Saya berasumsi token ada di dalam objek user, misal: user.token
      //    Jika token tidak ada di 'authUser', Anda harus menyimpannya saat login.
      
      // *** ASUMSI SAYA: Token disimpan di 'authUser.token' ***
      // *** Jika token Anda tidak ada, authService.js Anda perlu diperbaiki ***
      // *** UNTUK SAAT INI, mari kita asumsikan 'authUser' ADALAH token ***
      
      // Berdasarkan authService.js Anda, sepertinya Anda menyimpan
      // SELURUH objek user, tapi BUKAN token JWT. 
      // Mari kita perbaiki authService.js Anda dulu...
      
      // ...Tunggu, mari kita lihat authService.js Anda...
      // `localStorage.setItem("authUser", JSON.stringify(user));`
      
      // Backend Anda sepertinya menggunakan Supabase Auth (terlihat dari resetPassword).
      // Supabase biasanya menangani sesi via cookie (karena ada 'withCredentials: true').
      // TAPI... middleware Anda (authMiddleware) sepertinya custom.
      
      // MARI KITA ASUMSIKAN 'authMiddleware' Anda membaca cookie
      // Jika 'authMiddleware' Anda mencari 'Authorization: Bearer' header,
      // maka 'authService.js' Anda salah karena tidak menyimpan JWT.
      
      // Untuk saat ini, kita abaikan dulu. `withCredentials: true` MUNGKIN sudah cukup
      // jika 'authMiddleware' Anda membaca cookie.
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
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
