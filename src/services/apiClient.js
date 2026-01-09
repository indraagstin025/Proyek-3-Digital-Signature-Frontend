/* eslint-disable no-unused-vars */
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "production" ? "https://api.moodvis.my.id/api" : "http://localhost:3000/api");

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

// ============================================================
// 3. REFRESH TOKEN QUEUE - Mengatasi Race Condition
// ============================================================
// Jika multiple request gagal dengan 401 bersamaan, hanya 1 yang akan
// memicu refresh di backend. Request lainnya akan menunggu dan retry.
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshComplete = (success) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

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
  async (error) => {
    const { code, message, response, config } = error;

    // 1. Cek Koneksi / Offline / Timeout
    // Mengembalikan pesan standar "Offline-Detected" agar Service/Hook bisa menangani UI-nya.
    if (code === "ECONNABORTED" || code === "ERR_NETWORK" || message?.includes("timeout") || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return Promise.reject(new Error("Offline-Detected"));
    }

    // 2. Handle Cancel Request
    if (axios.isCancel(error) || code === "ERR_CANCELED") {
      return Promise.reject({ isCanceled: true, message: "Request canceled" });
    }

    // 3. Handle HTTP Errors (401, 403, 500)
    if (response) {
      const status = response.status;
      const data = response.data;

      // ============================================================
      // DETEKSI 401 - RETRY LOGIC UNTUK RACE CONDITION
      // ============================================================
      if (status === 401) {
        // Jangan retry jika sudah pernah retry (hindari infinite loop)
        if (config._retry) {
          console.warn("🔒 Retry sudah dilakukan, tetap 401. Triggering logout...");
          // Hanya trigger logout jika bukan halaman publik
          const currentPath = window.location.pathname;
          const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email,", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions" ];
          if (!publicPages.includes(currentPath)) {
            window.dispatchEvent(new CustomEvent("sessionExpired"));
          }
          return Promise.reject(error);
        }

        // Cek apakah ini MISSING_TOKEN (belum ada cookie) atau SESSION_EXPIRED (refresh gagal total)
        const errorCode = data?.code || "";

        // Jika SESSION_EXPIRED dengan refresh token gagal, logout langsung
        if (errorCode === "SESSION_EXPIRED") {
          console.warn("🔒 Session expired (refresh gagal). Triggering logout...");
          // Hanya trigger logout jika bukan halaman publik
          const currentPath = window.location.pathname;
          const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions" ];
          if (!publicPages.includes(currentPath)) {
            window.dispatchEvent(new CustomEvent("sessionExpired"));
          }
          return Promise.reject(error);
        }

        // Jika MISSING_TOKEN atau token invalid, coba retry sekali
        // (kemungkinan race condition - request lain sedang refresh)
        config._retry = true;

        // Jika sudah ada proses refresh yang berjalan, tunggu
        if (isRefreshing) {
          console.log("⏳ Menunggu refresh dari request lain...");
          return new Promise((resolve, reject) => {
            subscribeToRefresh((success) => {
              if (success) {
                // Retry request asli
                resolve(apiClient(config));
              } else {
                reject(error);
              }
            });
          });
        }

        // Tandai sedang refresh
        isRefreshing = true;
        console.log("🔄 Mencoba retry request setelah delay singkat...");

        // Delay singkat untuk memberi waktu cookie ter-set dari request sebelumnya
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // Retry request
          const retryResponse = await apiClient(config);

          // Berhasil! Notify subscribers
          onRefreshComplete(true);
          return retryResponse;
        } catch (retryError) {
          // Gagal juga, notify subscribers
          onRefreshComplete(false);

          // Jika masih 401 setelah retry, trigger logout (hanya untuk non-public pages)
          if (retryError.response?.status === 401) {
            console.warn("🔒 Retry tetap gagal 401. Triggering logout...");
            const currentPath = window.location.pathname;
            const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email ", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions" ];
            if (!publicPages.includes(currentPath)) {
              window.dispatchEvent(new CustomEvent("sessionExpired"));
            }
          }
          return Promise.reject(retryError);
        } finally {
          isRefreshing = false;
        }
      }

      // Kembalikan error utuh agar React Query bisa menangkap error message dari backend
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
