import apiClient from "./apiClient";

const login = async (email, password) => {
  // Tidak perlu try...catch. Jika gagal, error akan otomatis dilempar.
  const response = await apiClient.post("/auth/login", { email, password });
  if (response.data.session?.access_token) {
    localStorage.setItem("authToken", response.data.session.access_token);
  }
  return response.data;
};

const register = async (name, email, password) => {
  const response = await apiClient.post("/auth/register", { name, email, password });
  return response.data;
};

const logout = async () => {
  try {
    // try...catch di sini DIPERLUKAN karena kita tidak ingin melempar error ke UI.
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.error("Gagal logout di server:", err);
  } finally {
    localStorage.removeItem("authToken");
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
