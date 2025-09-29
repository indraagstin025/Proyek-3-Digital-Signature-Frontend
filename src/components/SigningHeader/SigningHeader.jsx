// file: src/components/SigningHeader/SigningHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { HiSun, HiMoon } from "react-icons/hi";
import nameLogo from "../../assets/images/name.png";

// 1. Hapus 'documentTitle' dari daftar props
const SigningHeader = ({ theme, toggleTheme }) => {
  return (
    <header
      className="fixed top-0 left-0 w-full z-40 flex items-center justify-between h-16 px-4
                 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8
                 bg-white/80 border-b border-slate-200/80
                 dark:bg-slate-900/80 dark:border-white/10"
    >
      {/* Bagian Kiri */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/documents">
          <img src={nameLogo} alt="Logo Signify" className="h-8 w-auto dark:invert" />
        </Link>
        {/* 2. Hapus blok div dan h1 di bawah ini */}
        {/*
          <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-700/50"></div>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
            {documentTitle}
          </h1>
        */}
      </div>

      {/* Bagian Kanan (tidak berubah) */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all
                     bg-gray-200/70 text-gray-800 hover:bg-gray-300/70
                     dark:bg-gray-700/70 dark:text-gray-200 dark:hover:bg-gray-600/70"
        >
          {theme === "light" ? <HiMoon size={20} /> : <HiSun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default SigningHeader;