import React from "react";
// Sesuaikan path import gambar dengan struktur folder Anda
import logoLight from "../../assets/images/LogoUtama.png"; 
import logoDark from "../../assets/images/LogoUtama.png";   

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-500">
      
      {/* --- Background Elements (Aurora Effect) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob Biru Atas */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        {/* Blob Ungu Bawah */}
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* --- Main Content --- */}
      <div className="relative flex flex-col items-center z-10">
        
        {/* LOGO CONTAINER */}
        {/* Menggunakan animasi 'scale' halus saat muncul agar terasa premium */}
        <div className="animate-fade-in-up flex flex-col items-center">
            
            {/* Logo Light Mode */}
            <img 
              src={logoLight} 
              alt="WeSign Logo" 
              // PERUBAHAN UKURAN DI SINI: h-32 (mobile) dan md:h-48 (desktop)
              className="h-32 md:h-48 w-auto object-contain mb-8 block dark:hidden drop-shadow-xl filter" 
            />

            {/* Logo Dark Mode */}
            <img 
              src={logoDark} 
              alt="WeSign Logo" 
              // PERUBAHAN UKURAN DI SINI
              className="h-32 md:h-48 w-auto object-contain mb-8 hidden dark:block drop-shadow-2xl filter" 
            />
        </div>
        
        {/* LOADING BAR AREA */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up delay-200">
            {/* Bar Container */}
            <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              {/* Animated Progress */}
              <div className="h-full w-full origin-left bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-[shimmer_1.5s_infinite_linear] background-size-[200%_100%]"></div>
            </div>
            
            {/* Text Indicator */}
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-[0.2em] uppercase">
              Memuat WeSign...
            </p>
        </div>

      </div>
      
      {/* Footer Version (Opsional - Menambah kesan App beneran) */}
      <div className="absolute bottom-8 text-slate-300 dark:text-slate-700 text-[10px]">
         v1.0.0
      </div>

    </div>
  );
};

// Tambahan CSS Custom untuk animasi shimmer loading bar (jika belum ada di tailwind.config)
// Bisa ditaruh di index.css atau style tag global
/*
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
*/

export default SplashScreen;