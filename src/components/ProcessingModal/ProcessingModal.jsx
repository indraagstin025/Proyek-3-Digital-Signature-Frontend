import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaSpinner, FaCheckCircle, FaLock, FaPenNib, FaCloudUploadAlt } from "react-icons/fa";

// ✅ DURASI DIPERPANJANG (Total: ~10 Detik)
const steps = [
  { message: "Mempersiapkan dokumen PDF...", icon: <FaSpinner className="animate-spin" />, duration: 2500 },
  { message: "Menanamkan tanda tangan visual...", icon: <FaPenNib className="animate-bounce" />, duration: 3000 },
  { message: "Enkripsi sertifikat digital (P12)...", icon: <FaLock className="animate-pulse" />, duration: 3000 },
  { message: "Finalisasi & Upload ke Cloud...", icon: <FaCloudUploadAlt className="animate-bounce" />, duration: 2000 },
];

const ProcessingModal = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setCurrentStep(0), 300);
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
    // Overlay Gelap
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 animate-fadeIn">
      
      {/* ✅ KARTU TRANSPARAN (GLASSMORPHISM) */}
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl overflow-hidden">
        
        {/* Efek Glow di Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl -z-10"></div>

        {/* ✅ EFEK BERPUTAR (Spinning Ring) */}
        <div className="relative mx-auto mb-8 w-24 h-24 flex items-center justify-center">
          {/* Cincin Luar Berputar */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-purple-400 animate-[spin_3s_linear_infinite]" />
          
          {/* Cincin Dalam Berputar Lawan Arah */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-300 border-l-purple-300 animate-[spin_4s_linear_infinite_reverse]" />

          {/* Icon Tengah */}
          <div className="relative z-10 text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500 transform scale-110">
            {steps[currentStep].icon}
          </div>
        </div>

        {/* Text Status (Putih Bersih) */}
        <h3 className="text-2xl font-bold text-white mb-3 tracking-wide drop-shadow-md">
          Memproses...
        </h3>
        
        <p className="text-blue-100/80 text-sm font-medium min-h-[24px] transition-all duration-500 ease-in-out">
          {steps[currentStep].message}
        </p>

        {/* Progress Bar Tipis */}
        <div className="mt-8 w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(96,165,250,0.8)]"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProcessingModal;