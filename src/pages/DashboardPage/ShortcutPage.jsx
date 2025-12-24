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
  HiOutlineUpload // Import icon tambahan untuk banner
} from "react-icons/hi";

// --- KOMPONEN PINDAHAN: Welcome Banner ---
const WelcomeBanner = ({ userName, onUploadClick, onCreateGroupClick }) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl 
      bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 
      dark:from-slate-900 dark:via-blue-950 dark:to-slate-900
      dark:border dark:border-blue-500/30 dark:shadow-blue-900/20
      p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 mb-8 transition-all hover:shadow-xl"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-20 dark:opacity-5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white opacity-20 dark:opacity-5 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white dark:text-blue-50">Halo, {userName}! 👋</h2>
          <p className="text-blue-50 dark:text-slate-300 max-w-lg text-sm sm:text-base leading-relaxed font-medium">
            Selamat datang di Workspace Anda. Apa yang ingin Anda kerjakan hari ini?
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* TOMBOL UTAMA: UPLOAD */}
          <button onClick={onUploadClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-md transition-transform active:scale-95">
            <HiOutlineUpload className="text-xl" />
            Upload Dokumen
          </button>

          {/* TOMBOL SEKUNDER: BUAT GRUP */}
          <button
            onClick={onCreateGroupClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold backdrop-blur-md border border-white/30 transition-colors"
          >
            <HiOutlineUserGroup className="text-xl" />
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

  // --- LOGIKA USER (Dipindahkan dari DashboardOverview) ---
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const firstName = parsed.name ? parsed.name.split(" ")[0] : "User";
        setUserName(firstName);
      }
    } catch (e) {
      console.error("Gagal parse user", e);
    }
  }, []);

  // --- HANDLER BUTTON ACTION ---
  const handleUploadClick = () => {
    navigate("/dashboard/documents?openUpload=true");
  };

  const handleCreateGroupClick = () => {
    navigate("/dashboard/workspaces");
  };

  // Daftar Menu
  const shortcuts = [
    {
      id: "overview",
      label: "Overview",
      description: "Ringkasan aktivitas dan statistik dashboard Anda.",
      path: "/dashboard",
      icon: <HiOutlineHome className="w-8 h-8" />,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "documents",
      label: "Dokumen",
      description: "Kelola, tanda tangani, dan upload dokumen baru.",
      path: "/dashboard/documents",
      icon: <HiOutlineDocumentText className="w-8 h-8" />,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "workspaces",
      label: "Workspace & Grup",
      description: "Kolaborasi dengan tim dan manajemen grup kerja.",
      path: "/dashboard/workspaces",
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      id: "history",
      label: "Riwayat",
      description: "Lacak log aktivitas dan riwayat penandatanganan.",
      path: "/dashboard/history",
      icon: <HiOutlineClock className="w-8 h-8" />,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      id: "profile",
      label: "Profil Saya",
      description: "Pengaturan akun, ganti password, dan data diri.",
      path: "/dashboard/profile",
      icon: <HiOutlineUserCircle className="w-8 h-8" />,
      color: "rose",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 sm:p-8 fade-in">
      
      {/* 1. WELCOME BANNER DILETAKKAN DI SINI */}
      <WelcomeBanner 
        userName={userName} 
        onUploadClick={handleUploadClick} 
        onCreateGroupClick={handleCreateGroupClick} 
      />

      {/* 2. HEADER TEXT */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Menu Pintasan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Akses cepat ke seluruh fitur utama aplikasi.
        </p>
      </div>

      {/* 3. GRID SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shortcuts.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${item.gradient}`}></div>
            
            <div className="p-6 flex flex-col h-full relative z-10">
              <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${item.gradient}`}>
                {item.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                Buka Halaman <HiArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortcutsPage;