// src/services/apiClient.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor untuk menambahkan Authorization header otomatis
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani error global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      // Kasus jaringan mati / tidak ada internet
      return Promise.reject({ message: "Tidak ada koneksi internet. Periksa jaringan Anda." });
    }

    if (error.response) {
      // Error dari server (401, 403, 500, dll.)
      return Promise.reject(error.response.data);
    }

    return Promise.reject({ message: "Terjadi kesalahan tak terduga." });
  }
);

export default apiClient;
