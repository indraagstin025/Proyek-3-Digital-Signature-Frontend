import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHome, HiOutlineDocumentText, HiOutlineUserGroup,
  HiOutlineClock, HiOutlineUserCircle, HiArrowRight, HiOutlineUpload,
} from "react-icons/hi";

import OnboardingTour from "../../components/common/OnboardingTour";
import { SHORTCUTS_STEPS } from "../../constants/tourSteps";

// --- WELCOME BANNER (Sama seperti sebelumnya) ---
const WelcomeBanner = ({ userName, onUploadClick, onCreateGroupClick }) => (
  <div id="shortcuts-banner" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-6 sm:p-8 text-white shadow-lg mb-8 transition-all hover:shadow-xl group">
    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white tracking-tight">Halo, {userName}! 👋</h2>
        <p className="text-blue-50 opacity-90 max-w-md">Selamat datang. Mulai upload dokumen atau kelola workspace Anda.</p>
      </div>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <button id="btn-quick-upload" onClick={onUploadClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all active:scale-95">
          <HiOutlineUpload className="text-lg" /> Upload
        </button>
        <button id="btn-create-group" onClick={onCreateGroupClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-semibold text-sm backdrop-blur-md border border-white/30 transition-all active:scale-95">
          <HiOutlineUserGroup className="text-lg" /> Buat Grup
        </button>
      </div>
    </div>
  </div>
);

const ShortcutsPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name ? parsed.name.split(" ")[0] : "User");
      }
    } catch (e) { console.error(e); }

    // [FIX] Bersihkan error OAuth dari URL jika ada (khusus di halaman ini)
    // Mencegah loop error saat switch mode browser (Mobile <-> Desktop)
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") || params.get("error_description")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleUploadClick = () => navigate("/dashboard/documents?openUpload=true");
  const handleCreateGroupClick = () => navigate("/dashboard/workspaces");

  // 🔥 LOGIKA SMART SCROLL
  const responsiveSteps = useMemo(() => {
    const isDesktop = window.innerWidth >= 1024;

    return SHORTCUTS_STEPS.map((step) => {
      // 1. MOBILE: SELALU ALLOW SCROLL
      if (!isDesktop) return { ...step, disableScroll: false, placement: 'bottom' };

      // 2. DESKTOP: CEK TARGET
      // Apakah targetnya adalah kartu bagian bawah?
      const isBottomCard = step.target === '#shortcut-card-history' || step.target === '#shortcut-card-profile';

      // 3. SETTING PER-STEP
      return {
        ...step,
        // Jika kartu bawah, AKTIFKAN SCROLL (disableScroll: false)
        // Jika kartu atas/banner, MATIKAN SCROLL (disableScroll: true)
        disableScroll: !isBottomCard,

        // Placement: Top untuk kartu bawah, Bottom/Center untuk sisanya
        placement: isBottomCard ? 'top' : (step.target === 'body' ? 'center' : 'bottom')
      };
    });
  }, []);

  const shortcuts = [
    { id: "overview", label: "Overview", description: "Lihat ringkasan aktivitas.", path: "/dashboard", icon: <HiOutlineHome className="w-7 h-7" />, color: "blue", gradient: "from-blue-500 to-indigo-500" },
    { id: "documents", label: "Dokumen Saya", description: "Kelola file dan tanda tangan.", path: "/dashboard/documents", icon: <HiOutlineDocumentText className="w-7 h-7" />, color: "emerald", gradient: "from-emerald-500 to-teal-500" },
    { id: "workspaces", label: "Workspace & Grup", description: "Berkolaborasi dengan tim.", path: "/dashboard/workspaces", icon: <HiOutlineUserGroup className="w-7 h-7" />, color: "violet", gradient: "from-violet-500 to-purple-500" },
    { id: "history", label: "Riwayat Aktivitas", description: "Lacak jejak audit.", path: "/dashboard/history", icon: <HiOutlineClock className="w-7 h-7" />, color: "amber", gradient: "from-amber-500 to-orange-500" },
    { id: "profile", label: "Profil & Pengaturan", description: "Perbarui data diri.", path: "/dashboard/profile", icon: <HiOutlineUserCircle className="w-7 h-7" />, color: "rose", gradient: "from-rose-500 to-pink-500" },
  ];

  return (
    // ✅ KEMBALIKAN overflow-y-auto (Jangan di-hidden, agar bisa scroll)
    <div className="h-full w-full p-6 sm:p-8 fade-in bg-slate-50/50 dark:bg-[#0f172a] custom-scrollbar overflow-y-auto">

      <OnboardingTour
        tourKey="shortcuts_intro"
        steps={responsiveSteps}
      />

      <WelcomeBanner userName={userName} onUploadClick={handleUploadClick} onCreateGroupClick={handleCreateGroupClick} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pl-1 border-l-4 border-indigo-500">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 pl-3">Menu Pintasan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm pl-3">Akses cepat ke seluruh modul dan fitur utama aplikasi.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {shortcuts.map((item) => (
            <div
              key={item.id}
              id={`shortcut-card-${item.id}`}
              onClick={() => navigate(item.path)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${item.gradient}`}></div>
              <div className="p-6 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${item.gradient} group-hover:scale-110 transition-transform duration-300`}>{item.icon}</div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <HiArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <div className="flex-1 mt-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsPage;