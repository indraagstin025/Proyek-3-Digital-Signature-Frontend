import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

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
    if (error.response && error.response.status === 401) {
      const sessionExpiredEvent = new CustomEvent("sessionExpired");
      window.dispatchEvent(sessionExpiredEvent);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
