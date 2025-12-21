import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaSpinner, FaCheckCircle, FaLock, FaPenNib, FaCloudUploadAlt } from "react-icons/fa";

const steps = [
  // ✅ DURASI DIUBAH MENJADI 5-6 DETIK
  // Total estimasi waktu jika berjalan penuh: ~22 Detik
  { message: "Mempersiapkan dokumen PDF...", icon: <FaSpinner className="animate-spin" />, duration: 5000 },
  { message: "Menanamkan tanda tangan visual...", icon: <FaPenNib className="animate-bounce" />, duration: 6000 },
  { message: "Enkripsi sertifikat digital (P12)...", icon: <FaLock className="animate-pulse" />, duration: 6000 },
  { message: "Finalisasi & Upload ke Cloud...", icon: <FaCloudUploadAlt className="animate-bounce" />, duration: 5000 },
];

const ProcessingModal = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setCurrentStep(0), 500);
      return () => clearTimeout(timer);
    }

    let timeout;
    if (currentStep < steps.length - 1) {
      timeout = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].duration);
    }

    return () => clearTimeout(timeout);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/30 dark:bg-black/20 backdrop-blur-md transition-opacity duration-700 animate-fadeIn">
      {/* Container Transparan */}
      <div className="relative bg-transparent p-10 max-w-sm w-full mx-4 text-center overflow-visible">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>

        {/* CINCIN BERPUTAR (Sangat Lambat & Elegan) */}
        <div className="relative mx-auto mb-8 w-32 h-32 flex items-center justify-center">
          {/* Cincin Luar: 12 Detik per putaran */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-600 dark:border-t-blue-400 dark:border-r-purple-400 animate-[spin_12s_linear_infinite]" />

          {/* Cincin Dalam: 10 Detik per putaran (reverse) */}
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-blue-400 border-l-indigo-400 dark:border-b-blue-300 dark:border-l-purple-300 animate-[spin_10s_linear_infinite_reverse]" />

          {/* Icon Tengah */}
          <div className="relative z-10 text-5xl text-blue-700 dark:text-white drop-shadow-lg transition-all duration-700 transform scale-110">{steps[currentStep].icon}</div>
        </div>

        {/* Teks Status */}
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 tracking-wide drop-shadow-sm transition-all duration-500">Memproses...</h3>

        <p className="text-slate-600 dark:text-blue-100 text-sm font-semibold min-h-[24px] transition-all duration-700 ease-in-out">{steps[currentStep].message}</p>

        {/* Progress Bar (Animasi bar juga diperlambat agar smooth) */}
        <div className="mt-8 w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-purple-400 h-1.5 rounded-full transition-all duration-[3000ms] ease-linear shadow-lg"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProcessingModal;
