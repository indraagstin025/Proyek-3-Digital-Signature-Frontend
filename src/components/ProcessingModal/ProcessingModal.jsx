import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaFilePdf } from "react-icons/fa";

const messages = [
  "Mempersiapkan dokumen...",
  "Menanamkan tanda tangan...",
  "Mengenkripsi data...",
  "Finalisasi dokumen...",
];

const ProcessingModal = ({ isOpen }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMsgIndex(0);
      return;
    }

    // Ganti pesan setiap 1.5 detik agar user merasa ada progres
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-opacity duration-300">
      <div className="max-w-md w-full text-center p-6">
        
        {/* Animasi Ikon PDF (Pulse & Spin Ring) */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Lingkaran Luar Statis */}
          <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
          
          {/* Lingkaran Loading Berputar */}
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          
          {/* Ikon PDF Berdenyut di Tengah */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FaFilePdf className="text-blue-600 text-3xl animate-pulse" />
          </div>
        </div>

        {/* Teks Status */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-all duration-300">
          {messages[msgIndex]}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Mohon jangan tutup halaman ini...
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ProcessingModal;