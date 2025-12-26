/* eslint-disable no-unused-vars */
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.moodvis.my.id/api"
    : "http://localhost:3000/api");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000, 
});

export const apiFileClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  responseType: "blob",
  timeout: 30000, 
});

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("authUser");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user?.user?.token || user?.token) {
          const token = user.user?.token || user.token;
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (parseError) {
        // Silent fail
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR (UPDATED) ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { code, message, response, config } = error;

    // 0. Cek Status Online Browser
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        // 🔥 HAPUS/KOMENTARI INI: Biarkan Service yang handle toast offline
        // if (!config?._silent) toast.error("Koneksi terputus...", { id: "offline-mode" });
        return Promise.reject(new Error("Offline-Detected")); // Konsisten dengan logic Service kita
    }

    // 1. Cek Pembatalan (Cancel)
    if (axios.isCancel(error) || code === "ERR_CANCELED" || error.name === "CanceledError") {
      return Promise.reject({ isCanceled: true, message: "Request canceled" });
    }

    // 2. Timeout & Network Error
    if (code === "ECONNABORTED" || code === "ERR_NETWORK" || message.includes("timeout")) {
        // 🔥 HAPUS/KOMENTARI INI JUGA
        // Alasannya: Service kita (packageService/signatureService) sudah punya 
        // listener window.addEventListener('offline') yang lebih akurat.
        // if (!config?._silent) toast.error("Gagal terhubung...", { id: "network-error" });
        
        return Promise.reject(new Error("Offline-Detected")); // Lempar pesan standar agar ditangkap Service
    }

    // 3. Handle Response Error (400, 401, 500)
    if (response) {
      const status = response.status;
      const isJsonResponse = response.headers["content-type"]?.includes("application/json");

      // Handle 401 Session Expired
      if (status === 401 && isJsonResponse) {
        const msg = response.data?.message || "";
        if (
            msg.toLowerCase().includes("token") || 
            msg.toLowerCase().includes("session") || 
            msg.toLowerCase().includes("unauthorized")
        ) {
             window.dispatchEvent(new CustomEvent("sessionExpired"));
        }
      }
      
      // Kembalikan error utuh (termasuk response body) agar UI bisa baca pesan "Sudah Selesai"
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;