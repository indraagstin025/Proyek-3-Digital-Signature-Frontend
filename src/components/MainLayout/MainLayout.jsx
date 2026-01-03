import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div
      className="relative flex flex-col h-screen overflow-y-auto custom-scrollbar
              text-zinc-800 dark:text-zinc-200 
              /* 1. BACKGROUND GRADIENT (Persis seperti HeroSection) */
              bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
              dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
              transition-colors duration-300"
    >
      {/* 2. AURORA / GLOW EFFECT (Persis seperti HeroSection) */}
      {/* z-0: Agar berada di paling belakang */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Blob 1: Kiri Atas (Hijau) */}
        {/* Menggunakan w-96 h-96 (ukuran fix) atau persentase jika ingin lebih responsif */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>

        {/* Blob 2: Kanan Bawah (Biru) */}
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Blob 3 (Opsional): Tengah (Ungu) - Agar tidak terlalu kosong di layar besar */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* 3. KONTEN UTAMA */}
      {/* z-10: SANGAT PENTING. 
          Memastikan konten (tombol, link, form) berada DI ATAS background aurora 
          sehingga bisa diklik. Tanpa z-10, konten mungkin tertutup layer aurora. 
      */}
      <main className={`grow relative z-10 ${isHomePage ? "pt-16" : "pt-6"}`}>
        <Outlet />
      </main>

      {/* Footer juga diberi z-10 agar aman */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
