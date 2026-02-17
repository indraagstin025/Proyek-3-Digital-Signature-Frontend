import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "production" ? "https://api.moodvis.my.id/api" : "http://localhost:3000/api");

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

// Helper: Cek apakah path adalah halaman publik logic
const isPublicPath = (path) => {
  const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions", "/auth/callback", "/pricing"];
  const publicPrefixes = ["/verify/"];
  return publicPages.includes(path) || publicPrefixes.some(prefix => path.startsWith(prefix));
};

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { code, message, response } = error;

    // 1. Handle Network/Offline Errors
    if (code === "ECONNABORTED" || code === "ERR_NETWORK" || message?.includes("timeout") || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return Promise.reject(new Error("Offline-Detected"));
    }

    if (axios.isCancel(error) || code === "ERR_CANCELED") {
      return Promise.reject({ isCanceled: true, message: "Request canceled" });
    }

    // 2. Handle Auth Handling (401)
    if (response && response.status === 401) {
      // Backend auto-refresh gagal atau token invalid -> Logout
      const currentPath = window.location.pathname;

      // Jika bukan halaman public, trigger event session expired agar UI (App.jsx) handle logout
      if (!isPublicPath(currentPath)) {
        console.warn("[ApiClient] 401 Unauthorized detected on private route. Triggering session cleanup.");
        window.dispatchEvent(new CustomEvent("sessionExpired"));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
