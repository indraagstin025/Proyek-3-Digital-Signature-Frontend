import React from "react";
import { HiSun, HiMoon } from "react-icons/hi";

const AdminDashboardHeader = ({
  activePage,
  onToggleSidebar,
  isSidebarOpen,
  userName,
  userAvatar,
  userEmail,
  theme,
  toggleTheme,
}) => {
  const getTitle = () => {
    switch (String(activePage || "").toLowerCase()) {
      case "dashboard":
        return "Ringkasan Admin";
      case "users":
        return "Manajemen Pengguna";
      default:
        return "Admin Panel";
    }
  };

  // Hitung posisi dan lebar header secara dinamis
  const leftOffset = isSidebarOpen && window.innerWidth >= 1024 ? "16rem" : "0";
  const computedWidth = isSidebarOpen && window.innerWidth >= 1024 ? "calc(100% - 16rem)" : "100%";

  return (
    <header
      className="fixed top-0 z-30 flex items-center justify-between h-20 px-4 
                 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8
                 bg-white/80 border-b border-gray-200/80
                 dark:bg-slate-900/80 dark:border-white/10 
                 transition-all duration-300 ease-in-out"
      style={{ left: leftOffset, width: computedWidth }}
    >
      {/* Bagian Kiri */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{getTitle()}</span>
        </div>
      </div>

      {/* Bagian Kanan */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all bg-gray-200/70 hover:bg-gray-300/70 dark:bg-gray-700/70 dark:hover:bg-gray-600/70"
        >
          {theme === "light" ? <HiMoon className="w-5 h-5 text-gray-800" /> : <HiSun className="w-5 h-5 text-gray-200" />}
        </button>
        <div className="flex items-center gap-3">
          <img
            src={userAvatar || `https://i.pravatar.cc/40?u=${userEmail}`}
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
          />
          <div className="hidden sm:block">
            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{userName || 'Admin'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminDashboardHeader;