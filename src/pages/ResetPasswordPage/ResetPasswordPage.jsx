// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineLockClosed } from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";
import authService from "../../services/authService";
import nameLogo from "../../assets/images/name.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let tokenFromUrl = authService.getTokenFromUrl();
    if (tokenFromUrl) {
      sessionStorage.setItem("resetToken", tokenFromUrl);
      setToken(tokenFromUrl);
    } else {
      const savedToken = sessionStorage.getItem("resetToken");
      if (savedToken) {
        setToken(savedToken);
      } else {
        toast.error("Tautan tidak valid atau sudah kedaluwarsa.");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok.");
      return;
    }

    if (!token) {
      toast.error("Token tidak ditemukan.");
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    let success = false;
    try {
      await authService.resetPassword(token, newPassword);
      success = true;
    } catch (err) {
      toast.error(err.message || "Gagal mengubah password. Silakan coba lagi.");
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = 1000 - elapsed;
      if (remaining > 0) await new Promise((res) => setTimeout(res, remaining));
      setLoading(false);
      if (success) {
        toast.success("Password berhasil diubah! Mengalihkan ke login...");
        setTimeout(() => navigate("/login"), 3000);
      }
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center py-20 px-4">
        <div className="text-gray-400">Memuat...</div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    );
  }

  return (
    <section className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Aurora Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-md
                    p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10
                    transition-all duration-700 ease-out
                    ${isCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={nameLogo} alt="Logo DigiSign" className="h-10 md:h-12 w-auto dark:invert" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Atur Ulang Password</h1>
          <p className="text-slate-600 dark:text-gray-400">Masukkan password baru Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <HiOutlineLockClosed className="w-5 h-5 text-slate-400 dark:text-gray-400" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full text-slate-900 bg-slate-100 border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                           dark:text-white dark:bg-white/5 dark:border-white/20 dark:placeholder-gray-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white" /> : <AiOutlineEye className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <HiOutlineLockClosed className="w-5 h-5 text-slate-400 dark:text-gray-400" />
              </span>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full text-slate-900 bg-slate-100 border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                           dark:text-white dark:bg-white/5 dark:border-white/20 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || newPassword !== confirmPassword}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <ImSpinner9 className="animate-spin h-5 w-5 mr-3" /> : "Ubah Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
            Kembali ke login
          </Link>
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </section>
  );
};

export default ResetPasswordPage;
