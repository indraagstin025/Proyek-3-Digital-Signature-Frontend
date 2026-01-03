import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiSun, HiMoon } from "react-icons/hi";
import nameLogo from "../../assets/images/WeSign.png";

const Header = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                 ring-1 ring-white/40 dark:ring-black/40"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img src={nameLogo} alt="Logo WeSign" className="h-10 w-auto dark:invert" />
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="/#features" className="font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Fitur
          </a>
          <a href="/#how-it-works" className="font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Proses
          </a>
          <a href="/#impact" className="font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Dampak
          </a>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-700/50"></div>

          {/* Action Buttons */}
          <ThemeToggleButton />
          
          <Link 
            to="/demo" 
            className="font-medium text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-800 dark:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
          <a href="/#features" onClick={() => setIsMenuOpen(false)} className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 rounded-lg">
            Fitur
          </a>
          <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 rounded-lg">
            Proses
          </a>
          <a href="/#impact" onClick={() => setIsMenuOpen(false)} className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 rounded-lg">
            Dampak
          </a>
          
          <hr className="w-full border-slate-300/50 dark:border-slate-700/50 my-2" />

          <Link to="/demo" onClick={() => setIsMenuOpen(false)} className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 rounded-lg">
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