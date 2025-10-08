import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";

import nameLogo from "../../assets/images/name.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verificationMessage = searchParams.get("message");
    if (verificationMessage) {
      toast.success("Email Anda berhasil diverifikasi! Silakan login.", {
        duration: 5000,
      });
    }

    const timer = setTimeout(() => setIsCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  /**
   * Menangani proses login dengan validasi error yang informatif.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user } = await authService.login(email, password);
      toast.success(`Login berhasil, selamat datang ${user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      let specificErrorMessage = "Terjadi kesalahan yang tidak terduga.";

      if (!err.response) {
        specificErrorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else {
        const backendError = err.response.data;
        const statusCode = err.response.status;

        if (backendError.code === "EMAIL_NOT_VERIFIED") {
          specificErrorMessage = "Email Anda belum dikonfirmasi, silakan periksa kotak masuk Anda.";
        } else if (statusCode === 401) {
          specificErrorMessage = "Email atau Password yang Anda masukkan salah.";
        } else {
          specificErrorMessage = backendError.message || "Terjadi kesalahan pada server.";
        }
      }

      toast.error(specificErrorMessage);
      setError(specificErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full flex items-center justify-center px-4 py-12">
      {/* Aurora khusus untuk LoginPage */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Card Login */}
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Selamat Datang Kembali</h1>
          <p className="text-slate-600 dark:text-gray-400">Silakan masuk untuk melanjutkan.</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-center text-sm" role="alert">
              <p>{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
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
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                Lupa password?
              </Link>
            </div>
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white" /> : <AiOutlineEye className="w-5 h-5 text-gray-400 hover:text-black dark:hover:text-white" />}
              </button>
            </div>
          </div>

          <div>
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
                "Login"
              )}
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-white/10"></div>
          <span className="mx-4 text-xs text-slate-500 dark:text-gray-400 font-medium">ATAU</span>
          <div className="flex-grow border-t border-slate-300 dark:border-white/10"></div>
        </div>

        <div>
          <button
            onClick={() => authService.loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-lg transform hover:scale-[1.02] duration-300
                                                                           bg-slate-200 text-slate-800 hover:bg-slate-300
                                                                           dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.22,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.783,44,30.886,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Belum punya akun?
            <Link to="/register" className="font-semibold text-blue-500 dark:text-blue-400 hover:underline ml-1">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
