import apiClient from "./apiClient";

const login = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const user = response.data?.data?.user;

  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
  return { user };
};

const register = async (name, email, password) => {
  try {
    const response = await apiClient.post("/auth/register", { name, email, password });
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    if (err.response?.data?.errors) {
      throw new Error(err.response.data.errors[0]?.message || "Registrasi gagal.");
    }
    throw err;
  }
};

const logout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.error("Gagal logout di server.", err);
  } finally {
    localStorage.removeItem("authUser");
  }
};

const forgotPassword = async (email) => {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (accessToken, refreshToken, newPassword) => {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      accessToken,
      refreshToken,
      newPassword,
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Gagal mereset password.");
  }
};

const verifyEmail = async (code) => {
  try {
    const response = await apiClient.post("/auth/verify-email", { code });
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Verifikasi email gagal.");
  }
};

/**
 * [FIX] Mengecek sesi aktif dengan mode "Silent Check".
 * Menambahkan flag _skipSessionCheck: true agar interceptor tidak memicu modal jika 401.
 */
const getMe = async () => {
  try {
    const response = await apiClient.get("/users/me", { 
      _skipSessionCheck: true 
    });
    
    const user = response.data?.data;
    if (user) {
      localStorage.setItem("authUser", JSON.stringify({ user })); 
    }
    return user;
  } catch (err) {
    // Jika error 401 (Belum login), bersihkan localStorage agar bersih
    localStorage.removeItem("authUser");
    throw err; // Lempar error agar ditangkap catch di App.js (tanpa memicu modal)
  }
};

// Login Google (jika ada)
const loginWithGoogle = async () => {
    // Implementasi sesuai kebutuhan
};

const authService = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe, // Pastikan ini diexport
  loginWithGoogle
};

export default authService;