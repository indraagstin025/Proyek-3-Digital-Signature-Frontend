import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiSun, HiMoon } from 'react-icons/hi';
import nameLogo from "../../assets/images/name.png";

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
      {theme === 'light' ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
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
        {/* Logo diganti dengan gambar */}
        <Link to="/" className="flex items-center">
          <img
            src={nameLogo}
            alt="Logo DigiSign"
            className="h-10 w-auto dark:invert"
          />
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="/#features"
            className="font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Fitur
          </a>
          <a
            href="/#how-it-works"
            className="font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Proses
          </a>
          <a
            href="/#testimonials"
            className="font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Testimoni
          </a>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-700/50"></div>

          {/* Tombol Tema */}
          <ThemeToggleButton />
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggleButton />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-800 dark:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} 
                    bg-white/30 dark:bg-gray-900/30 
                    backdrop-blur-lg shadow-lg ring-1 
                    ring-white/40 dark:ring-black/40`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
          <a
            href="/#features"
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 rounded-lg"
          >
            Fitur
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 rounded-lg"
          >
            Proses
          </a>
          <a
            href="/#testimonials"
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-center font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 rounded-lg"
          >
            Testimoni
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
