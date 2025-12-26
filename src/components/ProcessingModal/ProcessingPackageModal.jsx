import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  FaCheckCircle, 
  FaSpinner, 
  FaCloudUploadAlt, 
  FaWifi, 
  FaTimes 
} from "react-icons/fa";

const ProcessingPackageModal = ({ 
  isOpen, 
  totalDocs, 
  currentDocIndex, // Ini sekarang bisa berupa angka desimal (misal 0.5, 1.8)
  currentDocTitle,
  onCancel 
}) => {
  const [percentage, setPercentage] = useState(0);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  // 1. Pantau Status Jaringan Real-time
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. [PERBAIKAN UTAMA] Hitung Persentase Progress
  useEffect(() => {
    if (totalDocs > 0) {
      // HAPUS '+1' dari rumus perhitungan persentase!
      // Kita ingin progress murni dari 0 sampai totalDocs.
      // Contoh: 0.9 dari 1 dokumen = 90% (bukan 190%)
      const rawPercentage = (currentDocIndex / totalDocs) * 100;
      
      // Bulatkan, dan pastikan tidak lebih dari 100
      let progress = Math.round(rawPercentage);
      if (progress > 100) progress = 100;
      
      setPercentage(progress);
    }
  }, [currentDocIndex, totalDocs]);

  if (!isOpen) return null;

  // Status Selesai HANYA jika benar-benar 100%
  // (Ingat: Backend sukses akan mengirim nilai totalDocs penuh, sehingga jadi 100%)
  const isFinished = percentage >= 100;
  
  let gradientClass = "from-blue-500/10 to-purple-500/10";
  let strokeColorClass = "text-blue-600 dark:text-blue-400";
  let statusTextColor = "text-slate-800 dark:text-white";

  if (isOffline) {
    gradientClass = "from-red-500/10 to-orange-500/10";
    strokeColorClass = "text-red-500";
    statusTextColor = "text-red-600 dark:text-red-400";
  } else if (isFinished) {
    gradientClass = "from-green-500/10 to-emerald-500/10";
    strokeColorClass = "text-green-500";
  }

  // Helper untuk menampilkan "Dokumen ke-X" agar tidak muncul angka desimal (0.5)
  // Kita pakai Math.floor + 1. 
  // Contoh: index 0.5 (masih proses doc 1) -> Tampil "1"
  // Contoh: index 1.5 (sedang proses doc 2) -> Tampil "2"
  const displayCurrentDocNum = Math.min(Math.floor(currentDocIndex) + 1, totalDocs);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-md transition-opacity duration-500 animate-fadeIn">
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center overflow-hidden transition-all duration-500">
        
        {/* Background Glow */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${gradientClass} -z-10 transition-colors duration-500`}></div>
        
        {/* Lingkaran Progress */}
        <div className="relative mx-auto mb-6 w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="42" cx="50" cy="50"
            />
            <circle
              className={`${strokeColorClass} transition-all duration-1000 ease-out`}
              strokeWidth="6"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * percentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42" cx="50" cy="50"
            />
          </svg>

          {/* Konten Tengah Lingkaran */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 dark:text-white">
            {isOffline ? (
                <div className="flex flex-col items-center animate-pulse text-red-500">
                    <FaWifi className="text-4xl mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Terputus</span>
                </div>
            ) : isFinished ? (
                <FaCheckCircle className="text-5xl text-green-500 animate-bounce" />
            ) : (
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold font-mono">
                      {percentage}<span className="text-base">%</span>
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Dokumen {displayCurrentDocNum}/{totalDocs}
                    </span>
                </div>
            )}
          </div>
        </div>

        {/* --- Text Status Utama --- */}
        <h3 className={`text-xl font-bold mb-2 transition-colors ${statusTextColor}`}>
          {isOffline 
            ? "Koneksi Internet Terputus!" 
            : (isFinished ? "Selesai!" : "Memproses Dokumen...")}
        </h3>

        {/* --- Detail Dokumen --- */}
        <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors duration-300
            ${isOffline 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-800' 
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
            }`}>
             
             {isOffline ? (
                 <span className="text-sm font-medium">Periksa koneksi internet Anda.</span>
             ) : !isFinished ? (
                 <>
                    <FaSpinner className="animate-spin text-blue-500 shrink-0" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                        {currentDocTitle || "Menyiapkan..."}
                    </span>
                 </>
             ) : (
                 <>
                    <FaCloudUploadAlt className="text-green-500 shrink-0" />
                    <span className="text-sm font-medium">Semua dokumen tersimpan.</span>
                 </>
             )}
        </div>

        {/* Tombol Batal Manual */}
        {!isFinished && onCancel && (
            <div className="mt-6 animate-fadeIn">
                <button 
                    onClick={onCancel}
                    className="group flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                >
                    <FaTimes className="group-hover:rotate-90 transition-transform" />
                    <span>Batalkan Proses</span>
                </button>
            </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default ProcessingPackageModal;