import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaFilePdf, FaCheckCircle, FaTimes } from "react-icons/fa";

const loadingMessages = [
  "Menyiapkan dokumen...",
  "Memverifikasi tanda tangan...",
  "Mengenkripsi data...",
  "Menyimpan ke cloud...",
];

const ProcessingPackageModal = ({ 
  isOpen, 
  totalDocs, 
  currentDocIndex, 
  currentDocTitle,
  onCancel 
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  // Efek ganti teks setiap 2 detik agar tidak bosan
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Hitung nomor dokumen saat ini (misal index 0.5 -> Dokumen 1)
  const currentNum = Math.min(Math.floor(currentDocIndex) + 1, totalDocs);
  const isFinished = currentDocIndex >= totalDocs;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center border border-slate-100 dark:border-slate-700 relative overflow-hidden mx-4">
        
        {/* Background Glow Halus */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* --- ANIMASI UTAMA --- */}
        <div className="relative w-24 h-24 mx-auto mb-8 mt-4">
          {isFinished ? (
            <FaCheckCircle className="w-full h-full text-green-500 animate-bounce" />
          ) : (
            <>
              {/* Lingkaran Luar Statis */}
              <div className="absolute inset-0 border-4 border-blue-100 dark:border-slate-700 rounded-full"></div>
              {/* Lingkaran Loading Berputar */}
              <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              {/* Ikon PDF Berdenyut */}
              <div className="absolute inset-0 flex items-center justify-center">
                <FaFilePdf className="text-blue-600 dark:text-blue-400 text-3xl animate-pulse" />
              </div>
            </>
          )}
        </div>

        {/* --- TEKS STATUS --- */}
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 transition-all duration-300">
          {isFinished ? "Selesai!" : loadingMessages[msgIndex]}
        </h3>

        {/* --- DETAIL DOKUMEN --- */}
        {!isFinished && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-600">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
              Dokumen {currentNum} dari {totalDocs}
            </p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[250px] mx-auto">
              {currentDocTitle || "Memuat..."}
            </p>
          </div>
        )}

        {/* --- TOMBOL BATAL (Muncul setelah 5 detik jika macet) --- */}
        {onCancel && !isFinished && (
           <button 
             onClick={onCancel}
             className="mt-6 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center gap-1 mx-auto transition-colors"
           >
             <FaTimes /> Batalkan Proses
           </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProcessingPackageModal;