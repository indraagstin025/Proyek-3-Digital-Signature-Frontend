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

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshComplete = (success) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { code, message, response, config } = error;

    if (code === "ECONNABORTED" || code === "ERR_NETWORK" || message?.includes("timeout") || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return Promise.reject(new Error("Offline-Detected"));
    }

    if (axios.isCancel(error) || code === "ERR_CANCELED") {
      return Promise.reject({ isCanceled: true, message: "Request canceled" });
    }

    if (response) {
      const status = response.status;
      const data = response.data;

      if (status === 401) {
        if (config._retry) {
          const currentPath = window.location.pathname;
          const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email,", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions", "/auth/callback", "/forgot-password", "/reset-password"];

          if (!publicPages.includes(currentPath)) {
            window.dispatchEvent(new CustomEvent("sessionExpired"));
          }
          return Promise.reject(error);
        }

        const errorCode = data?.code || "";

        if (errorCode === "SESSION_EXPIRED") {


          const currentPath = window.location.pathname;
          const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions", "/auth/callback", "/forgot-password", "/reset-password"];
          if (!publicPages.includes(currentPath)) {
            window.dispatchEvent(new CustomEvent("sessionExpired"));
          }
          return Promise.reject(error);
        }

        config._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeToRefresh((success) => {
              if (success) {
                resolve(apiClient(config));
              } else {
                reject(error);
              }
            });
          });
        }

        isRefreshing = true;

        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const retryResponse = await apiClient(config);

          onRefreshComplete(true);
          return retryResponse;
        } catch (retryError) {
          onRefreshComplete(false);

          if (retryError.response?.status === 401) {
            const currentPath = window.location.pathname;
            const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email ", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions", "/auth/callback", "/forgot-password", "/reset-password"];

            if (!publicPages.includes(currentPath)) {
              window.dispatchEvent(new CustomEvent("sessionExpired"));
            }
          }
          return Promise.reject(retryError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
