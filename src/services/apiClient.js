// apiClient.js - VERSI DENGAN VALIDASI JARINGAN

import axios from "axios";

const API_BASE_URL = "https://proyek-3digital-signature-production.up.railway.app/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 1. Server MERESPONS dengan sebuah status error (misal: 401, 500, 503)
    if (error.response) {
      // Logika untuk sesi berakhir yang sudah ada tetap dipertahankan
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
      // Untuk error lain dari server (404, 500, 503 asli, dll),
      // langsung teruskan error aslinya dari backend.
      return Promise.reject(error);
    } 
    
    // 2. Server TIDAK MERESPONS (Internet mati atau server down)
    else if (error.request) {
      // Buat sebuah objek error custom yang strukturnya mirip dengan error dari backend Anda
      // agar bisa ditangani dengan cara yang sama di halaman login/komponen lain.
      const networkError = {
        response: {
          data: {
            code: "NETWORK_ERROR",
            // Pesan ini diambil dari CommonError.NetworkError Anda
            message: "Koneksi ke server lambat atau tidak stabil. Silakan coba lagi beberapa saat.",
          },
          // Sesuai permintaan Anda, kita gunakan status 503 untuk masalah jaringan/server down.
          // Ini lebih sesuai daripada 500 (Internal Server Error).
          status: 503, 
        },
      };
      return Promise.reject(networkError);
    } 
    
    // 3. Error lain yang tidak terduga
    else {
      // Untuk error yang lebih aneh lagi, kembalikan pesan generik.
      return Promise.reject(new Error("Terjadi kesalahan yang tidak terduga."));
    }
  }
);

export default apiClient;