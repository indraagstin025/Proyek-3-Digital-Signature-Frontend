// src/components/SigningHeader/SigningHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { HiSun, HiMoon } from "react-icons/hi";
import nameLogo from "../../assets/images/name.png"; // Pastikan path logo benar

const SigningHeader = ({ documentTitle, theme, toggleTheme }) => {
  return (
    // Mengadopsi gaya dari DashboardHeader (sticky, backdrop-blur, warna dinamis)
    <header className="sticky top-0 z-40 flex items-center justify-between p-4 shadow-sm backdrop-blur-sm
                       bg-white/80 border-b border-gray-200/80
                       dark:bg-gray-900/80 dark:border-b dark:border-white/10"
    >
      {/* Bagian Kiri */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/documents">
          <img src={nameLogo} alt="Logo Signify" className="h-8 w-auto dark:invert" />
        </Link>
        <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-700/50"></div>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
          {documentTitle}
        </h1>
      </div>
      
      {/* Bagian Kanan */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all
                     bg-gray-200/70 text-gray-800 hover:bg-gray-300/70
                     dark:bg-gray-700/70 dark:text-gray-200 dark:hover:bg-gray-600/70"
        >
          {theme === "light" ? <HiMoon size={20} /> : <HiSun size={20} />}
        </button>
        {/* Tombol Tanda Tangani sudah dihapus dari sini */}
      </div>
    </header>
  );
};

export default SigningHeader;