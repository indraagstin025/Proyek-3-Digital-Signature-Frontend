import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Pastikan pakai Link agar tidak refresh halaman
import { FaCookieBite, FaTimes } from 'react-icons/fa'; // Install: npm install react-icons

/**
 * Komponen Banner Cookie Modern
 */
const CookieBanner = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Efek animasi muncul setelah mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed bottom-4 right-4 z-50 w-full max-w-[400px] p-6
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-md
        border border-slate-200 dark:border-slate-700
        shadow-2xl rounded-2xl transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Ikon Cookie */}
        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full shrink-0">
          <FaCookieBite className="text-orange-500 text-xl" />
        </div>

        <div className="flex-1">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">
            Kami menghargai privasi Anda
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            Website ini menggunakan cookie untuk memastikan Anda mendapatkan pengalaman terbaik. 
            Pelajari lebih lanjut di{" "}
            <Link 
              to="/privacy-policy" 
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Kebijakan Privasi
            </Link> kami.
          </p>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-500/50"
            >
              Terima Semua
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2.5 bg-transparent border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              Tolak
            </button>
          </div>
        </div>

        {/* Tombol Close Kecil (Opsional, fungsinya sama dengan Tolak) */}
        <button 
          onClick={onDecline}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2"
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;