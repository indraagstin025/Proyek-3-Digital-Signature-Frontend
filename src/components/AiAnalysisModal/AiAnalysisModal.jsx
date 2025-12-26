/* eslint-disable no-unused-vars */
import React from "react";
import { createPortal } from "react-dom";
import { 
  FaRobot, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimes, 
  FaFingerprint, 
  FaListUl, 
  FaShieldAlt, 
  FaFileSignature 
} from "react-icons/fa";

const AiAnalysisModal = ({ isOpen, onClose, data, isLoading }) => {
  // 1. Jika modal tertutup, jangan render apa-apa (Hemat Memori)
  if (!isOpen) return null;

  // 2. Definisikan Konten Modal
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fade-in">
      
      {/* BACKDROP (Latar Gelap Blur) */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} // Klik luar untuk tutup
      ></div>

      {/* --- KONTEN UTAMA --- */}
      <div className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all">
        
        {/* A. TAMPILAN LOADING */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <FaRobot className="relative text-6xl text-blue-500 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                AI Sedang Menganalisis...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Gemini AI sedang membaca isi dokumen Anda untuk mencari poin penting dan risiko.
              </p>
            </div>

            {/* Progress Bar Indikator */}
            <div className="w-64 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-progress"></div>
            </div>
          </div>

        ) : data ? (
          // B. TAMPILAN HASIL (DATA ADA)
          <>
            {/* HEADER */}
            <div className="p-5 flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                  <FaRobot size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Hasil Analisis AI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Powered by Google Gemini 2.5 Flash
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
              
              {/* 1. Bagian Risiko */}
              <RiskSection analysis={data.risk_analysis} />

              {/* 2. Bagian Summary */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <FaFileSignature className="text-blue-500" /> Ringkasan Eksekutif
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                  {data.summary || "Tidak ada ringkasan tersedia."}
                </p>
              </div>

              {/* 3. Grid Detail (Entitas & Poin) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EntitySection entities={data.key_entities || []} />
                <PointSection points={data.critical_points || []} />
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end">
              <button 
                onClick={onClose} 
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-500/20"
              >
                Tutup Analisis
              </button>
            </div>
          </>
        ) : (
          // C. TAMPILAN ERROR / KOSONG
          <div className="p-12 text-center">
            <p className="text-slate-500">Data tidak ditemukan atau terjadi kesalahan.</p>
            <button onClick={onClose} className="mt-4 text-blue-600 font-bold hover:underline">Tutup</button>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Render ke document.body menggunakan createPortal
  return createPortal(modalContent, document.body);
};

// ==========================================
// SUB-KOMPONEN (Untuk Kerapihan)
// ==========================================

const RiskSection = ({ analysis }) => {
  const getRiskInfo = (text) => {
    if (!text) return { color: "bg-slate-100 border-slate-200 text-slate-600", label: "INFO", icon: <FaShieldAlt /> };
    
    const lower = text.toLowerCase();
    if (lower.includes("tinggi") || lower.includes("high") || lower.includes("berbahaya")) 
        return { color: "bg-red-50 border-red-200 text-red-700", label: "RISIKO TINGGI", icon: <FaExclamationTriangle /> };
    if (lower.includes("sedang") || lower.includes("medium")) 
        return { color: "bg-orange-50 border-orange-200 text-orange-700", label: "RISIKO SEDANG", icon: <FaExclamationTriangle /> };
    if (lower.includes("rendah") || lower.includes("low") || lower.includes("aman")) 
        return { color: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "AMAN", icon: <FaCheckCircle /> };
    
    return { color: "bg-blue-50 border-blue-200 text-blue-700", label: "ANALISIS", icon: <FaShieldAlt /> };
  };

  const info = getRiskInfo(analysis);

  return (
    <div className={`p-5 rounded-xl border flex flex-col sm:flex-row gap-4 items-start shadow-sm transition-colors ${info.color}`}>
      <div className="text-2xl mt-0.5 opacity-90">{info.icon}</div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Status Risiko</span>
          <span className="font-bold text-[10px] bg-white/60 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm border border-black/5">{info.label}</span>
        </div>
        <p className="text-sm font-medium leading-relaxed opacity-90">
            {analysis || "Tidak ada risiko signifikan terdeteksi."}
        </p>
      </div>
    </div>
  );
};

const EntitySection = ({ entities }) => (
  <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
      <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <FaFingerprint className="text-purple-500" /> Entitas Utama
      </h5>
    </div>
    <div className="p-4 flex-1">
      {entities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {entities.map((item, idx) => (
            <span key={idx} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-md border border-purple-100 dark:border-purple-800">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Tidak ada entitas spesifik ditemukan.</p>
      )}
    </div>
  </div>
);

const PointSection = ({ points }) => (
  <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
      <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <FaListUl className="text-teal-500" /> Poin Penting
      </h5>
    </div>
    <ul className="p-4 space-y-3 flex-1">
      {points.length > 0 ? (
        points.map((point, idx) => (
          <li key={idx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <span className="text-teal-500 font-bold mt-1 text-[10px]">•</span>
            <span className="leading-snug">{point}</span>
          </li>
        ))
      ) : (
        <li className="text-xs text-slate-400 italic">Tidak ada poin kritis ditemukan.</li>
      )}
    </ul>
  </div>
);

export default AiAnalysisModal;