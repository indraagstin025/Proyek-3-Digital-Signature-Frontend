import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiSun, HiMoon, HiMenu, HiX } from "react-icons/hi";
import nameLogo from "../../assets/images/WeSign.png";

const Header = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Fungsi helper untuk menentukan style link aktif
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "font-bold text-blue-600 dark:text-blue-400" 
      : "font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors";
  };

  // Helper khusus Mobile
  const getMobileLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `block py-2 text-center rounded-lg ${isActive 
      ? "font-bold text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-black/20" 
      : "font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"}`;
  };

  const ThemeToggleButton = () => (
    <button
      onClick={toggleTheme}
      className="p-2 bg-slate-200/70 dark:bg-gray-700/70 rounded-full 
                 text-slate-800 dark:text-gray-200 
                 hover:bg-slate-300/70 dark:hover:bg-gray-600/70 
                 backdrop-blur-md shadow-sm transition-all"
    >
      {theme === "light" ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
    </button>
  );

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 
                 bg-white/30 dark:bg-gray-900/30 
                 backdrop-blur-lg shadow-lg 
                 ring-1 ring-white/40 dark:ring-black/40 transition-all"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img src={nameLogo} alt="Logo WeSign" className="h-8 md:h-10 w-auto dark:invert transition-all" />
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={getLinkClass("/")}>Beranda</Link>
          
          <Link to="/tour" className={getLinkClass("/tour")}>
            Tour & Konsep
          </Link>

          <Link to="/features" className={getLinkClass("/features")}>
            Fitur
          </Link>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-700/50"></div>

          {/* Action Buttons */}
          <ThemeToggleButton />
          
          <Link 
            to="/demo" 
            className={getLinkClass("/demo")}
          >
            Demo
          </Link>

          <Link 
            to="/login" 
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Masuk
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggleButton />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-800 dark:text-white p-1">
             {isMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      <div
        id="mobile-menu"
        className={`md:hidden ${isMenuOpen ? "block" : "hidden"} 
                   bg-white/30 dark:bg-gray-900/30 
                   backdrop-blur-lg shadow-lg ring-1 
                   ring-white/40 dark:ring-black/40`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col items-center">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass("/")}>
            Beranda
          </Link>
          <Link to="/tour" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass("/tour")}>
            Tour & Konsep
          </Link>
          <Link to="/features" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass("/features")}>
            Fitur
          </Link>
          
          <hr className="w-full border-slate-300/50 dark:border-slate-700/50 my-2" />

          <Link to="/demo" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass("/demo")}>
            Coba Demo
          </Link>
          
          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg shadow-md transition-colors mt-2">
            Masuk Akun
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;