import apiClient from "./apiClient";

const login = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const user = response.data?.data?.user;

  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
    window.dispatchEvent(new Event("auth-update")); // Notify UI
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
    window.dispatchEvent(new Event("auth-update")); // Notify UI
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
      // [FIXED] Simpan 'user' langsung, JANGAN dibungkus { user }
      // Agar konsisten dengan fungsi login() dan cara baca di ShortcutsPage
      localStorage.setItem("authUser", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-update")); // Notify UI
    }
    return user;
  } catch (err) {
    // Jika error 401 (Belum login), bersihkan localStorage
    localStorage.removeItem("authUser");
    window.dispatchEvent(new Event("auth-update")); // Notify UI
    throw err;
  }
};

// Login Google - Redirect ke Supabase OAuth
const loginWithGoogle = () => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const redirectTo = `${window.location.origin}/auth/callback`;

  // Redirect ke Supabase OAuth endpoint
  const oauthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  // Gunakan replace agar halaman login tidak tersimpan di history, meminimalisir isu Back button
  window.location.replace(oauthUrl);
};

// Google OAuth Callback - Kirim token ke backend
const googleCallback = async (accessToken, refreshToken) => {
  const response = await apiClient.post("/auth/google/callback", {
    accessToken,
    refreshToken
  });

  const user = response.data?.data?.user;
  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
    window.dispatchEvent(new Event("auth-update")); // Notify UI
  }
  return { user };
};

const authService = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  loginWithGoogle,
  googleCallback
};

export default authService;