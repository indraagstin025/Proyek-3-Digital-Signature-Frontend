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

/**
 * Mengirim permintaan untuk mereset password ke backend.
 * @param {string} accessToken - Token sesi yang didapat dari Supabase di client-side.
 * @param {string} newPassword - Password baru yang diinput oleh pengguna.
 * @returns {Promise<object>} Data respons dari server.
 */
const resetPassword = async (accessToken, refreshToken, newPassword) => {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      accessToken,
      refreshToken,  // ✅ tambahkan refreshToken di body
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


const authService = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
};

export default authService;
