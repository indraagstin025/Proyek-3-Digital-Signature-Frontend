import React from "react";
// Sesuaikan path import gambar dengan struktur folder Anda
// Karena file ini ada di src/components/SplashScreen, maka kita perlu mundur (../) beberapa kali
import logoLight from "../../assets/images/LogoLightMode.jpg"; 
import logoDark from "../../assets/images/LogoDarkMode.jpg";   

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Background Aurora Halus */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Container Logo & Loading */}
      <div className="relative flex flex-col items-center animate-fade-in-up">
        
        {/* Gambar 1: Tampil HANYA saat Light Mode */}
        <img 
          src={logoLight} 
          alt="DigiSign Logo" 
          className="h-16 md:h-20 w-auto object-contain mb-6 animate-bounce-slow block dark:hidden" 
        />

        {/* Gambar 2: Tampil HANYA saat Dark Mode */}
        <img 
          src={logoDark} 
          alt="DigiSign Logo" 
          className="h-16 md:h-20 w-auto object-contain mb-6 animate-bounce-slow hidden dark:block" 
        />
        
        {/* Loading Bar Tipis */}
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-loading-bar"></div>
        </div>
        
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">
          Memuat Aplikasi...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;