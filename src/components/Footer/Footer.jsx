import React from "react";
import { FaInstagram, FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";

// Import logo (light & dark mode)
import logoLight from "../../assets/images/LogoLightMode.jpg";
import logoDark from "../../assets/images/LogoDarkMode.jpg";

const Footer = () => {
  return (
    <footer className="relative mt-16 overflow-hidden 
                       bg-slate-50 border-t border-slate-200
                       dark:bg-gray-900 dark:border-white/10">
      
      {/* Aurora Effect */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Kolom 1: Logo + Brand */}
        <div className="flex flex-col items-center md:items-start gap-4">
          {/* Logo Light Mode */}
          <img
            src={logoLight}
            alt="Logo Light"
            className="w-36 dark:hidden"
          />
          {/* Logo Dark Mode */}
          <img
            src={logoDark}
            alt="Logo Dark"
            className="w-36 hidden dark:block"
          />
          <p className="text-sm text-slate-600 dark:text-gray-400 max-w-xs">
            Platform tanda tangan digital modern, aman, dan efisien.
          </p>
        </div>

        {/* Kolom 2: Quick Links */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Navigasi
          </h3>
          <ul className="space-y-2">
            <li><a href="/" className="text-slate-600 dark:text-gray-400 hover:text-blue-500">Home</a></li>
            <li><a href="#features" className="text-slate-600 dark:text-gray-400 hover:text-blue-500">Fitur</a></li>
            <li><a href="#how-it-works" className="text-slate-600 dark:text-gray-400 hover:text-blue-500">Cara Kerja</a></li>
            <li><a href="#contact" className="text-slate-600 dark:text-gray-400 hover:text-blue-500">Kontak</a></li>
          </ul>
        </div>

        {/* Kolom 3: Social Media */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Hubungi Kami
          </h3>
          <div className="flex justify-center md:justify-start gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
               className="text-slate-600 dark:text-gray-400 hover:text-pink-500 text-xl">
              <FaInstagram />
            </a>
            <a href="mailto:info@signify.com"
               className="text-slate-600 dark:text-gray-400 hover:text-red-500 text-xl">
              <FaEnvelope />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
               className="text-slate-600 dark:text-gray-400 hover:text-blue-600 text-xl">
              <FaLinkedin />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer"
               className="text-slate-600 dark:text-gray-400 hover:text-gray-700 text-xl">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 border-t border-slate-200 dark:border-white/10 py-4">
        <p className="text-center text-sm text-slate-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Signify. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
