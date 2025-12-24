// src/components/SigningHeader/SigningHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { HiSun, HiMoon } from "react-icons/hi";
import { FaBars } from 'react-icons/fa'; // Import ikon hamburger
import nameLogo from "../../assets/images/WeSign.png";

// Tambahkan onToggleSidebar ke props
const SigningHeader = ({ theme, toggleTheme, onToggleSidebar }) => {
return (
  <header
    className="fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-4
               shadow-sm backdrop-blur-sm sm:px-6 lg:px-8
               bg-white/80 border-b border-slate-200/80
               dark:bg-slate-900/80 dark:border-white/10"
  >
    {/* Bagian Kiri */}
    <div className="flex items-center gap-4">
      <Link to="/dashboard/documents">
        <img src={nameLogo} alt="Logo Signify" className="h-8 w-auto dark:invert" />
      </Link>
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
      
      {/* Tombol Hamburger → tampil di mobile & desktop portrait, sembunyi di landscape */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-full text-gray-800 dark:text-gray-200
                   md:hidden portrait:inline-flex landscape:hidden"
      >
        <FaBars size={20} />
      </button>
    </div>
  </header>
);

};

export default SigningHeader;