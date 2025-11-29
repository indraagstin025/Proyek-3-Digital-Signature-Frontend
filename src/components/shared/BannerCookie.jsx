import React from 'react';

/**
 * Komponen untuk menampilkan banner persetujuan cookie.
 * @param {object} props 
 * @param {function} props.onAccept - Fungsi yang dipanggil saat tombol "Setuju" di klik.
 * @param {function} props.onDecline - Fungsi yang dipanggil saat tombol "Batal" di klik.
 */
const CookieBanner = ({ onAccept, onDecline }) => {
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white dark:bg-slate-900 
                 border border-slate-200 dark:border-white/10 shadow-lg rounded-lg p-4"
    >
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
        Website ini menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan melanjutkan, Anda setuju dengan{" "}
        <a href="/privacy-policy" className="font-semibold text-blue-600 dark:text-blue-400 underline hover:no-underline">
          Kebijakan Privasi
        </a>
        {" "}kami.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onDecline}
          className="bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-slate-200 font-medium py-1 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors text-sm"
        >
          Batal
        </button>
        <button
          onClick={onAccept}
          className="bg-blue-600 text-white font-bold py-1 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Setuju
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
