import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";

import nameLogo from "../../assets/images/name.png";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- Validasi Frontend Dimulai ---
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Semua kolom wajib diisi.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error("Password minimal harus 8 karakter.");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password harus mengandung minimal satu angka.");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password harus mengandung minimal satu huruf kapital.");
      setLoading(false);
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error("Password harus mengandung minimal satu huruf kecil.");
      setLoading(false);
      return;
    }
    // --- Validasi Frontend Selesai ---

    try {
      await authService.register(name, email, password);
      toast.success("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
      setIsRegistered(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Registrasi gagal.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-sm text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mb-6">
            Silakan cek inbox email Anda untuk memverifikasi akun.
          </p>
          <Link
            to="/login"
            className="w-full inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Aurora background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Register Card */}
      <div
        className={`relative z-10 w-full max-w-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-md 
                    p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10
                    transition-all duration-700 ease-out
                    ${isCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img
              src={nameLogo}
              alt="DigiSign Logo"
              className="h-10 md:h-12 w-auto dark:invert"
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
            Buat Akun Baru
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Bergabunglah bersama kami sekarang.
          </p>
        </div>

        {/* Form Register */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
            >
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <HiOutlineUser className="w-5 h-5 text-slate-400 dark:text-gray-400" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-slate-900 bg-slate-100 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                           dark:text-white dark:bg-white/5 dark:border-white/20 dark:placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
            >
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <HiOutlineMail className="w-5 h-5 text-slate-400 dark:text-gray-400" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-slate-900 bg-slate-100 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                           dark:text-white dark:bg-white/5 dark:border-white/20 dark:placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <HiOutlineLockClosed className="w-5 h-5 text-slate-400 dark:text-gray-400" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-slate-900 bg-slate-100 border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                           dark:text-white dark:bg-white/5 dark:border-white/20 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white" />
                ) : (
                  <AiOutlineEye className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <>
                  <ImSpinner9 className="animate-spin h-5 w-5 mr-3" /> Memuat...
                </>
              ) : (
                "Buat Akun"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Sudah punya akun?
            <Link
              to="/login"
              className="font-semibold text-blue-500 dark:text-blue-400 hover:underline ml-1"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
