import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaFileContract, FaCheckCircle, FaSpinner, FaCloudUploadAlt } from "react-icons/fa";

const ProcessingPackageModal = ({ isOpen, totalDocs, currentDocIndex, currentDocTitle }) => {
  const [percentage, setPercentage] = useState(0);

  // Menghitung persentase progress
  useEffect(() => {
    if (totalDocs > 0) {
      const progress = Math.round(((currentDocIndex + 1) / totalDocs) * 100);
      setPercentage(progress > 100 ? 100 : progress);
    }
  }, [currentDocIndex, totalDocs]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-md transition-opacity duration-500 animate-fadeIn">
      {/* Kartu Glassmorphism */}
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center overflow-hidden">
        
        {/* Dekorasi Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/20 rounded-full blur-[60px] -z-10"></div>

        {/* --- LINGKARAN PROGRESS --- */}
        <div className="relative mx-auto mb-6 w-36 h-36 flex items-center justify-center">
          {/* SVG Circle untuk Progress Bar Melingkar */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Track Circle (Abu-abu) */}
            <circle
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
            />
            {/* Progress Circle (Berwarna) */}
            <circle
              className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeDasharray={264} // Keliling lingkaran (2 * PI * r)
              strokeDashoffset={264 - (264 * percentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
            />
          </svg>

          {/* Icon & Counter di Tengah Lingkaran */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 dark:text-white">
            {percentage < 100 ? (
                <div className="flex flex-col items-center animate-pulse">
                    <span className="text-3xl font-bold">{currentDocIndex + 1}<span className="text-lg text-slate-400">/{totalDocs}</span></span>
                </div>
            ) : (
                <FaCheckCircle className="text-4xl text-green-500 animate-bounce" />
            )}
          </div>
        </div>

        {/* --- TEKS STATUS --- */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {percentage < 100 ? "Memproses Paket..." : "Selesai!"}
        </h3>

        {/* Nama Dokumen Aktif (Truncated agar rapi) */}
        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 py-2 px-4 rounded-lg">
             {percentage < 100 ? (
                 <>
                    <FaSpinner className="animate-spin text-blue-500" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{currentDocTitle || "Menyiapkan..."}</span>
                 </>
             ) : (
                 <>
                    <FaCloudUploadAlt className="text-green-500" />
                    <span className="text-sm font-medium">Semua dokumen tersimpan.</span>
                 </>
             )}
        </div>

        {/* Footer Info */}
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            Mohon jangan tutup halaman ini hingga selesai.
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ProcessingPackageModal;