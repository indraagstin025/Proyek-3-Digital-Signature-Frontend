import apiClient from "./apiClient";

const login = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const session = response.data?.data?.session;
  const user = response.data?.data?.user;
  const token = session?.access_token;

  if (token) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
  } else {
    console.error("❌ Token tidak ditemukan dalam respons login backend");
  }

  return { token, user };
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

  localStorage.removeItem("resetToken");
  localStorage.removeItem("resetRefreshToken");

  return response.data;
};

const getTokenFromUrl = () => {
  try {
    const hash = window.location.hash;
    if (!hash) return null;

    console.log("📩 URL hash ditemukan (dari Supabase):", hash);

    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (accessToken && type === "recovery") {
      console.log("✅ Access token recovery terdeteksi. Menyimpan di localStorage...");

      localStorage.setItem("resetToken", accessToken);
      if (refreshToken) localStorage.setItem("resetRefreshToken", refreshToken);

      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

      return { accessToken, refreshToken, type };
    }

    return null;
  } catch (err) {
    console.error("❌ Gagal memproses token dari URL:", err);
    return null;
  }
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
