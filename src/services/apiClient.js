import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data || {};
      const code = data.code || "";

      if (status === 401 && (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN")) {
        localStorage.removeItem("authToken");
        window.dispatchEvent(new CustomEvent("sessionExpired"));
        return new Promise(() => {});
      }

      return Promise.reject(error); 
    } else if (error.request) {
      return Promise.reject({
        message: "Tidak dapat terhubung ke server. Periksa koneksi Internet Anda.",
      });
    } else {
      return Promise.reject({ message: "Terjadi kesalahan tak terduga." });
    }
  }
);

export default apiClient;
