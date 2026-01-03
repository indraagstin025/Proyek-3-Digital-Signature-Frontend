import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaFilePdf, FaUsers, FaCheckCircle } from "react-icons/fa";

const groupMessages = [
  "Menyinkronkan data grup...",
  "Memverifikasi kontribusi anggota...",
  "Mengunci posisi tanda tangan...",
  "Finalisasi dokumen grup...",
];

const ProcessingGroupModal = ({ isOpen }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMsgIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % groupMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center border border-slate-100 dark:border-slate-700 relative overflow-hidden mx-4">
        
        {/* Background Glow Ungu (Khas Grup) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* --- ANIMASI UTAMA --- */}
        <div className="relative w-24 h-24 mx-auto mb-8 mt-4">
            {/* Lingkaran Luar Statis */}
            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-700 rounded-full"></div>
            
            {/* Lingkaran Loading Berputar */}
            <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
            
            {/* Ikon Grup/PDF Berdenyut */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <FaFilePdf className="text-indigo-600 dark:text-indigo-400 text-3xl animate-pulse" />
                {/* Badge User Kecil */}
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                    <FaUsers className="text-xs text-slate-500" />
                </div>
              </div>
            </div>
        </div>

        {/* --- TEKS STATUS --- */}
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 transition-all duration-300">
          {groupMessages[msgIndex]}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mohon tunggu, sedang memproses kontribusi tim...
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ProcessingGroupModal;