import React from 'react';
import { HiSun, HiMoon } from 'react-icons/hi';

const DashboardHeader = ({ activePage, onToggleSidebar, theme, toggleTheme }) => {
  const getTitle = () => {
    switch (activePage) {
      case 'overview':
        return 'Overview';
      case 'documents':
        return 'Dokumen';
      case 'workspaces':
        return 'Workspace';
      case 'history':
        return 'Riwayat';
      default:
        return 'Dashboard';
    }
  };

  // Komponen tombol tema dengan gaya dinamis
  const ThemeToggleButton = () => (
    <button
      onClick={toggleTheme}
      // DIUBAH: Menambahkan gaya untuk light & dark mode
      className="p-2 rounded-full transition-all
                 bg-gray-200/70 text-gray-800 hover:bg-gray-300/70
                 dark:bg-gray-700/70 dark:text-gray-200 dark:hover:bg-gray-600/70"
    >
      {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
    </button>
  );

  return (
    // DIUBAH: Latar belakang header sekarang dinamis
    <header className="sticky top-0 z-40 flex items-center justify-between p-4 shadow-sm backdrop-blur-sm sm:p-6 lg:p-8
                       bg-white/80 border-b border-gray-200/80
                       dark:bg-gray-900/80 dark:border-b dark:border-white/10">
      
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* DIUBAH: Warna ikon hamburger sekarang dinamis */}
        <button onClick={onToggleSidebar} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        {/* DIUBAH: Warna judul sekarang dinamis */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getTitle()}</h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">

        
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default DashboardHeader;