// src/services/authService.js
import apiClient from "./apiClient";

const login = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const session = response.data?.data?.session;
  const user = response.data?.data?.user;
  const token = session?.access_token;

  if (token) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user)); // simpan juga user info
  } else {
    console.error("❌ Token tidak ditemukan dalam respons login backend");
  }

  return { token, user };
};

const register = async (name, email, password) => {
  const response = await apiClient.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};

const logout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.error("Gagal logout di server:", err);
  } finally {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }
};

const forgotPassword = async (email) => {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

const getTokenFromUrl = () => {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
      return accessToken;
    }
  }
  return null;
};

const authService = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  getTokenFromUrl,
};

export default authService;
