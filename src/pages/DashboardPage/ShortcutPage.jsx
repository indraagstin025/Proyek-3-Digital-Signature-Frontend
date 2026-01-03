// file: src/pages/ShortcutsPage/ShortcutsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiArrowRight,
  HiOutlineUpload, // Icon untuk tombol banner
} from "react-icons/hi";

// --- KOMPONEN: Welcome Banner ---
const WelcomeBanner = ({ userName, onUploadClick, onCreateGroupClick }) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl 
      bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 
      dark:from-slate-900 dark:via-blue-950 dark:to-slate-900
      dark:border dark:border-blue-500/30 dark:shadow-blue-900/20
      p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 mb-8 transition-all hover:shadow-xl group"
    >
      {/* Background Pattern - Animated */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white opacity-10 dark:opacity-5 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-white opacity-10 dark:opacity-5 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white dark:text-blue-50 tracking-tight">Halo, {userName}! 👋</h2>
          <p className="text-blue-50 dark:text-slate-300 max-w-md text-sm sm:text-base leading-relaxed opacity-90">Selamat datang. Mulai upload dokumen atau kelola workspace Anda.</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* TOMBOL UTAMA: UPLOAD */}
          <button
            onClick={onUploadClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
          >
            <HiOutlineUpload className="text-lg" />
            Upload
          </button>

          {/* TOMBOL SEKUNDER: BUAT GRUP */}
          <button
            onClick={onCreateGroupClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg font-semibold text-sm backdrop-blur-md border border-white/30 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <HiOutlineUserGroup className="text-lg" />
            Buat Grup
          </button>
        </div>
      </div>
    </div>
  );
};

const ShortcutsPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  // --- LOGIKA USER ---
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Ambil nama depan saja agar lebih personal
        const firstName = parsed.name ? parsed.name.split(" ")[0] : "User";
        setUserName(firstName);
      }
    } catch (e) {
      console.error("Gagal parse user", e);
    }
  }, []);

  // --- HANDLER BUTTON ACTION ---
  const handleUploadClick = () => {
    // Pastikan di DashboardDocuments Anda menangani query param ?openUpload=true
    navigate("/dashboard/documents?openUpload=true");
  };

  const handleCreateGroupClick = () => {
    navigate("/dashboard/workspaces");
  };

  // Daftar Menu Shortcuts
  const shortcuts = [
    {
      id: "overview",
      label: "Overview",
      description: "Lihat ringkasan aktivitas, statistik, dan status dokumen terkini.",
      path: "/dashboard",
      icon: <HiOutlineHome className="w-7 h-7" />,
      color: "blue",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      id: "documents",
      label: "Dokumen Saya",
      description: "Kelola file, tanda tangani dokumen, dan atur permintaan tanda tangan.",
      path: "/dashboard/documents",
      icon: <HiOutlineDocumentText className="w-7 h-7" />,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "workspaces",
      label: "Workspace & Grup",
      description: "Berkolaborasi dengan tim, kelola anggota, dan berbagi dokumen grup.",
      path: "/dashboard/workspaces",
      icon: <HiOutlineUserGroup className="w-7 h-7" />,
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      id: "history",
      label: "Riwayat Aktivitas",
      description: "Lacak jejak audit (audit trail) dan log aktivitas penandatanganan.",
      path: "/dashboard/history",
      icon: <HiOutlineClock className="w-7 h-7" />,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      id: "profile",
      label: "Profil & Pengaturan",
      description: "Perbarui data diri, ganti password, dan preferensi akun Anda.",
      path: "/dashboard/profile",
      icon: <HiOutlineUserCircle className="w-7 h-7" />,
      color: "rose",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 sm:p-8 fade-in bg-slate-50/50 dark:bg-[#0f172a]">
      {/* 1. WELCOME BANNER */}
      <WelcomeBanner userName={userName} onUploadClick={handleUploadClick} onCreateGroupClick={handleCreateGroupClick} />

      <div className="max-w-7xl mx-auto">
        {/* 2. HEADER TEXT */}
        <div className="mb-8 pl-1 border-l-4 border-indigo-500">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 pl-3">Menu Pintasan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm pl-3">Akses cepat ke seluruh modul dan fitur utama aplikasi.</p>
        </div>

        {/* 3. GRID SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortcuts.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Hover Gradient Overlay */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${item.gradient}`}></div>

              <div className="p-6 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                  {/* Icon Container */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${item.gradient} group-hover:scale-110 transition-transform duration-300`}>{item.icon}</div>

                  {/* Arrow Icon */}
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
