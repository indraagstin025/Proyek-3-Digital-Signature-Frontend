import React from "react";
import { FaInstagram, FaEnvelope, FaLinkedin, FaGithub, FaHeart } from "react-icons/fa";
import logoLight from "../../assets/images/WeSignLightMode.png"; 
import logoDark from "../../assets/images/WeSignDarkMode.png";

const Footer = () => {
  return (
    <footer className="relative w-full bg-slate-50 dark:bg-slate-950 pt-20 pb-10 overflow-hidden">
      
      {/* 1. SEPARATOR HALUS DI ATAS (Agar menyatu dengan section sebelumnya) */}
      {/* Ini membuat garis gradasi halus sebagai transisi, bukan garis kaku */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

      {/* 2. AURORA BACKGROUND EFFECT (Lebih subtle) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 3. KONTEN UTAMA */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* KOLOM 1: Brand & Desc (Lebar 5 kolom) */}
          <div className="lg:col-span-5 space-y-6">
             {/* Logo Container */}
             <div className="flex items-start">
                <img src={logoLight} alt="WeSign Logo" className="h-10 w-auto block dark:hidden" />
                <img src={logoDark} alt="WeSign Logo" className="h-10 w-auto hidden dark:block" />
             </div>
             
             <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm max-w-md">
               Platform tanda tangan digital yang dirancang untuk kecepatan tim modern. 
               Aman secara hukum, mudah digunakan, dan terintegrasi penuh dengan workflow Anda.
             </p>

             <div className="flex gap-4 pt-2">
                <SocialLink href="#" icon={<FaInstagram />} />
                <SocialLink href="#" icon={<FaEnvelope />} />
                <SocialLink href="#" icon={<FaLinkedin />} />
                <SocialLink href="#" icon={<FaGithub />} />
             </div>
          </div>

          {/* KOLOM 2: Navigasi (Lebar 2 kolom) */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Produk</h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><FooterLink href="#features">Fitur Utama</FooterLink></li>
              <li><FooterLink href="#how-it-works">Cara Kerja</FooterLink></li>
              <li><FooterLink href="#pricing">Harga</FooterLink></li>
              <li><FooterLink href="/login">Masuk / Daftar</FooterLink></li>
            </ul>
          </div>

          {/* KOLOM 3: Perusahaan (Lebar 2 kolom) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Perusahaan</h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><FooterLink href="#about">Tentang Kami</FooterLink></li>
              <li><FooterLink href="#blog">Blog</FooterLink></li>
              <li><FooterLink href="#karir">Karir</FooterLink></li>
              <li><FooterLink href="#kontak">Hubungi Kami</FooterLink></li>
            </ul>
          </div>

          {/* KOLOM 4: Legal (Lebar 2 kolom) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><FooterLink href="/privacy">Kebijakan Privasi</FooterLink></li>
              <li><FooterLink href="/terms">Syarat Ketentuan</FooterLink></li>
              <li><FooterLink href="/security">Keamanan</FooterLink></li>
            </ul>
          </div>
        </div>

        {/* 4. COPYRIGHT BOTTOM BAR */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="font-bold text-slate-700 dark:text-slate-300">WeSign</span>. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dibuat dengan</span>
            <FaHeart className="text-red-500 animate-pulse" />
            <span>di Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Komponen Kecil untuk Kerapihan ---

const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
  >
    {icon}
  </a>
);

const FooterLink = ({ href, children }) => (
  <a 
    href={href} 
    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
  >
    {children}
  </a>
);

export default Footer;