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
  FaFileSignature, 
  FaTag 
} from "react-icons/fa";

const AiAnalysisModal = ({ isOpen, onClose, data, isLoading, dbDocumentType }) => {
  // Jika tidak open, jangan render apa-apa agar performa terjaga
  if (!isOpen) return null;

  // Konten Modal
  const modalContent = (
    // Z-Index 9999 agar selalu di atas Sidebar & Header
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      
      {/* --- 1. TAMPILAN LOADING (ROBOT) --- */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-pulse border border-slate-200 dark:border-slate-700 max-w-sm w-full">
          {/* Animasi Robot Bounce */}
          <FaRobot className="text-6xl text-blue-500 mb-6 animate-bounce" />
          
          <h3 className="text-xl font-bold text-slate-700 dark:text-white text-center">
            AI Sedang Menganalisis...
          </h3>
          
          {/* Progress Bar Dummy */}
          <div className="mt-4 flex flex-col gap-2 w-full">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-progress"></div>
            </div>
            {/* Menampilkan Konteks Label dari Database/Title */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
               Menggunakan konteks: <span className="font-semibold text-blue-500">{dbDocumentType || "Umum"}</span>
            </p>
          </div>
        </div>

      ) : data ? (
        
        // --- 2. TAMPILAN HASIL DATA ---
        <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
          
          {/* HEADER */}
          <div className="p-5 flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 text-white">
                <FaRobot size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Hasil Analisis AI
                </h3>

                {/* LABEL DATABASE / TIPE DOKUMEN */}
                <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wide ${getTypeColor(dbDocumentType || data.document_type)}`}>
                  <FaTag className="w-2.5 h-2.5" />
                  <span>Kategori: {data.document_type || dbDocumentType || "Dokumen Umum"}</span>
                </div>
              </div>
            </div>
            
            {/* Tombol Tutup (X) */}
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-all"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* CONTENT BODY (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
            
            {/* A. Bagian Risiko */}
            <RiskSection analysis={data.risk_analysis} />

            {/* B. Bagian Summary */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <FaFileSignature className="text-blue-500" /> Ringkasan Eksekutif
              </h5>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {data.summary}
              </p>
            </div>

            {/* C. Grid Detail (Entitas & Poin) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EntitySection entities={data.key_entities || data.parties || []} />
              <PointSection points={data.critical_points || data.key_points || []} />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button 
              onClick={onClose} 
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  // Return menggunakan Portal ke Body HTML
  return createPortal(modalContent, document.body);
};

// ==========================================
// HELPER COMPONENTS (Untuk Kerapihan Kode)
// ==========================================

const getTypeColor = (type) => {
  if (!type || type === "General") return "bg-gray-100 text-gray-600 border-gray-200";
  
  // Lowercase untuk pencocokan yang aman
  const t = type.toLowerCase();
  
  if (t.includes("sk") || t.includes("keputusan")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (t.includes("perjanjian") || t.includes("mou") || t.includes("kontrak") || t.includes("kerjasama")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (t.includes("invoice") || t.includes("tagihan")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (t.includes("nda") || t.includes("rahasia")) return "bg-rose-100 text-rose-700 border-rose-200";
  
  // Default Style
  return "bg-teal-100 text-teal-700 border-teal-200";
};

const RiskSection = ({ analysis }) => {
  const getRiskAnalysisInfo = (text) => {
    if (!text) return { color: "bg-slate-100 text-slate-600 border-slate-200", label: "INFO", icon: <FaShieldAlt /> };
    
    const lower = text.toLowerCase();
    if (lower.includes("tinggi") || lower.includes("high") || lower.includes("berbahaya")) 
        return { color: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200", label: "RISIKO TINGGI", icon: <FaExclamationTriangle /> };
    if (lower.includes("sedang") || lower.includes("medium")) 
        return { color: "bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-200", label: "RISIKO SEDANG", icon: <FaExclamationTriangle /> };
    if (lower.includes("rendah") || lower.includes("low") || lower.includes("aman")) 
        return { color: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200", label: "AMAN / RENDAH", icon: <FaCheckCircle /> };
    
    return { color: "bg-blue-50 text-blue-700 border-blue-200", label: "ANALISIS UMUM", icon: <FaShieldAlt /> };
  };

  const info = getRiskAnalysisInfo(analysis);

  return (
    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 items-start shadow-sm ${info.color}`}>
      <div className="text-2xl mt-1 opacity-90">{info.icon}</div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black uppercase tracking-wider opacity-70">Status Risiko</span>
          <span className="font-bold text-sm bg-white/60 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">{info.label}</span>
        </div>
        <p className="text-sm font-medium leading-relaxed opacity-90">
            {analysis || "Tidak ada risiko signifikan terdeteksi."}
        </p>
      </div>
    </div>
  );
};

const EntitySection = ({ entities }) => (
  <div className="flex flex-col h-full">
    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
      <FaFingerprint className="text-purple-500" /> Entitas Utama
    </h5>
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex-1 shadow-sm">
      {entities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {entities.map((item, idx) => (
            <span key={idx} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-md border border-purple-100 dark:border-purple-800">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Tidak ada entitas spesifik.</span>
      )}
    </div>
  </div>
);

const PointSection = ({ points }) => (
  <div className="flex flex-col h-full">
    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
      <FaListUl className="text-teal-500" /> Poin Analisis
    </h5>
    <ul className="space-y-2 flex-1">
      {points.length > 0 ? (
        points.map((point, idx) => (
          <li key={idx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-600 dark:text-slate-300 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-teal-500 font-bold mt-0.5">•</span>
            <span className="leading-snug">{point}</span>
          </li>
        ))
      ) : (
        <li className="text-xs text-slate-400">Tidak ada poin kritis.</li>
      )}
    </ul>
  </div>
);

export default AiAnalysisModal;