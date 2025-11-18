import React from "react";
import { FaInstagram, FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";
import logoLight from "../../assets/images/LogoLightMode.jpg";
import logoDark from "../../assets/images/LogoDarkMode.jpg";

const Footer = () => {
  return (
    <footer 
      className="relative mt-16 overflow-hidden 
                 bg-white border-t border-slate-200 
                 dark:bg-slate-900 dark:border-slate-800"
    >
      
      {/* 1. PENAMBAHAN EFEK AURORA/BLUR DI FOOTER (Opsional) */}
      <div className="absolute inset-0 pt z-0 pointer-events-none opacity-50 dark:opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>


      {/* 2. KONTEN UTAMA */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
        
        {/* Kolom 1: Logo + Brand (Menggunakan MD:COL-SPAN-2 untuk layout yang lebih seimbang) */}
        <div className="flex flex-col items-center md:items-start gap-4 md:col-span-2">
          {/* Logo Light Mode */}
          <img
            src={logoLight}
            alt="Logo Light"
            className="w-32 dark:hidden"
          />
          {/* Logo Dark Mode */}
          <img
            src={logoDark}
            alt="Logo Dark"
            className="w-32 hidden dark:block"
          />
          <p className="text-sm text-slate-500 dark:text-gray-400 max-w-sm">
            Platform tanda tangan digital modern, aman, dan efisien.
          </p>
        </div>

        {/* Kolom 2: Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Navigasi Cepat
          </h3>
          <ul className="space-y-3 text-sm">
            <li><a href="/" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Home</a></li>
            <li><a href="#features" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Fitur</a></li>
            <li><a href="#how-it-works" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Cara Kerja</a></li>
            <li><a href="#contact" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Kontak</a></li>
            <li><a href="/login" className="text-slate-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Login / Daftar</a></li>
          </ul>
        </div>

        {/* Kolom 3: Social Media & Kontak */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Ikuti Kami
          </h3>
          <div className="flex justify-center md:justify-start gap-5">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
              className="text-slate-500 dark:text-gray-400 hover:text-pink-500 text-2xl transition-colors"
              aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="mailto:info@signify.com"
              className="text-slate-500 dark:text-gray-400 hover:text-red-500 text-2xl transition-colors"
              aria-label="Email">
              <FaEnvelope />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
              className="text-slate-500 dark:text-gray-400 hover:text-blue-600 text-2xl transition-colors"
              aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer"
              className="text-slate-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl transition-colors"
              aria-label="GitHub">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Copyright */}
      <div className="relative z-10 border-t border-slate-100 dark:border-slate-800 py-6">
        <p className="text-center text-sm text-slate-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} **Signify**. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default Footer;