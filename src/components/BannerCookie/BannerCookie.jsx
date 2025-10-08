import React from 'react';

/**
 * Komponen untuk menampilkan banner persetujuan cookie.
 * @param {object} props 
 * @param {function} props.onAccept - Fungsi yang dipanggil saat tombol "Setuju" di klik.
 */
const CookieBanner = ({ onAccept }) => {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 
                 border-t border-slate-200 dark:border-white/10 shadow-lg"
    >
      <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 text-center sm:text-left">
          Website ini menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan melanjutkan, Anda setuju dengan{" "}
          <a href="/privacy-policy" className="font-semibold text-blue-600 dark:text-blue-400 underline hover:no-underline">
            Kebijakan Privasi
          </a>
          {" "}kami.
        </p>
        <button
          onClick={onAccept}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
        >
          Setuju
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;