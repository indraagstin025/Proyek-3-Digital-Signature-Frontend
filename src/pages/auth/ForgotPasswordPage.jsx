// src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService.js";
import nameLogo from "../../assets/images/name.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage("Jika email terdaftar, tautan reset password telah dikirimkan ke email Anda.");
    } catch (err) {
      console.error("Lupa password gagal:", err);
      setError("Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Aurora background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Forgot Password Card */}
      <div
        className={`relative z-10 w-full max-w-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-md 
                    p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10
                    transition-all duration-700 ease-out
                    ${isCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={nameLogo} alt="DigiSign Logo" className="h-10 md:h-12 w-auto dark:invert" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Lupa Password</h1>
          <p className="text-slate-600 dark:text-gray-400">Masukkan email Anda untuk menerima tautan reset password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full text-slate-900 bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 placeholder-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                         dark:text-white dark:bg-white/5 dark:border-white/20 dark:placeholder-gray-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}

          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 disabled:opacity-50 disabled:scale-100"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Ingat password Anda?{" "}
            <Link to="/login" className="font-semibold text-blue-500 dark:text-blue-400 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
