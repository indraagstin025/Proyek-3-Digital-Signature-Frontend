import React from "react";
import { Link } from "react-router-dom";

import logoLight from "../../assets/images/WeSignLightMode.png";
import logoDark from "../../assets/images/WeSignDarkMode.png";

const HeroSection = () => {
  const HeroLogo = ({ className }) => (
    <div className={`relative animate-float ${className}`}>
      <img
        src={logoLight}
        alt="Logo WeSign Light"
        className="w-[280px] sm:w-[360px] md:w-[480px] h-auto drop-shadow-2xl block dark:hidden transform transition-transform duration-300"
      />
      <img
        src={logoDark}
        alt="Logo WeSign Dark"
        className="w-[280px] sm:w-[360px] md:w-[480px] h-auto drop-shadow-2xl hidden dark:block transform transition-transform duration-300"
      />
    </div>
  );

  return (
    <section
      id="home"
      className="relative min-h-screen flex justify-center overflow-hidden 
                 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
                 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                 
                 /* --- BAGIAN YANG DIUBAH --- */
                 /* Mobile: items-start (rata atas) | Desktop: items-center (rata tengah) */
                 items-start md:items-center 
                 
                 /* Mobile: pt-15 (Jarak atas dikurangi drastis agar konten naik) */
                 /* Desktop: pt-0 (Kembali ke tengah) */
                 pt-24 md:pt-0 pb-12"
    >
      {/* Aurora / Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        
        {/* === KOLOM 1: Teks & Logo Mobile === */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          
          {/* Judul */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Tandatangani Dokumen dengan{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              WeSign
            </span>
          </h1>

          {/* LOGO MOBILE (Di antara Judul & Teks) */}
          <div className="flex justify-center md:hidden my-6">
            <HeroLogo />
          </div>

          {/* Deskripsi */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto md:mx-0">
            Buat tanda tangan digital yang aman, cepat, dan dapat diverifikasi
            kapan saja.
          </p>

          {/* Tombol */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold rounded-full text-white 
               bg-gradient-to-r from-blue-600 to-indigo-600
               shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
               transform hover:-translate-y-1 hover:scale-105
               transition-all duration-300 text-center"
            >
              Mulai Sekarang
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold rounded-full
               bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800
               dark:from-slate-700 dark:to-slate-800 dark:text-slate-200
               border border-transparent shadow-md hover:shadow-lg
               transform hover:-translate-y-1 hover:scale-105
               transition-all duration-300 text-center"
            >
              Lihat Fitur
            </a>
          </div>
        </div>

        {/* === KOLOM 2: Logo Desktop (Hidden di Mobile) === */}
        <div className="w-full md:w-1/2 hidden md:flex justify-center items-center">
          <HeroLogo />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;