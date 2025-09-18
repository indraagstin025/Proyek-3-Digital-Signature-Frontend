// src/services/authService.js
import apiClient from "./apiClient";

const login = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    if (response.data.session?.access_token) {
      localStorage.setItem("authToken", response.data.session.access_token);
    }
    return response.data;
  } catch (err) {
    // Sekarang cukup throw error.message (sudah diproses interceptor)
    throw new Error(err.message || "Terjadi kesalahan saat login");
  }
};

const register = async (name, email, password) => {
  try {
    const response = await apiClient.post("/auth/register", { name, email, password });
    return response.data;
  } catch (err) {
    throw new Error(err.message || "Terjadi kesalahan saat registrasi");
  }
};

const logout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.error("Gagal logout di server:", err.message);
  } finally {
    localStorage.removeItem("authToken");
    console.log("Token di localStorage berhasil dihapus");
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (err) {
    throw new Error(err.message || "Terjadi kesalahan saat meminta reset password");
  }
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new Error("Token dan password baru harus diberikan.");
  }

  try {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });

    return response.data;
  } catch (err) {
    console.error("❌ Error resetPassword (frontend):", err.message);
    throw new Error(err.message || "Terjadi kesalahan saat reset password");
  }
};

const getTokenFromUrl = () => {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
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
