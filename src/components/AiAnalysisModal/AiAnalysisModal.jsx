import React from 'react';
import { FaRobot, FaExclamationTriangle, FaCheckCircle, FaTimes, FaUserTie, FaFileContract } from 'react-icons/fa';

const AiAnalysisModal = ({ isOpen, onClose, data, isLoading }) => {
  if (!isOpen) return null;
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-pulse">
          <FaRobot className="text-6xl text-blue-200 dark:text-slate-600 mb-4 animate-bounce" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">AI sedang membaca dokumen...</h3>
          <p className="text-sm text-slate-400">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Tentukan warna berdasarkan Risk Level
// Update Logika Warna untuk Bahasa Indonesia
  const getRiskColor = (level) => {
    if (!level) return 'bg-slate-100 text-slate-700 border-slate-200';
    
    const safeLevel = level.toLowerCase();
    
    // Merah: High / Tinggi
    if (safeLevel === 'high' || safeLevel === 'tinggi') {
        return 'bg-red-100 text-red-700 border-red-200';
    }
    // Oranye: Medium / Sedang
    if (safeLevel === 'medium' || safeLevel === 'sedang') {
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    // Hijau: Low / Rendah
    if (safeLevel === 'low' || safeLevel === 'rendah') {
        return 'bg-green-100 text-green-700 border-green-200';
    }
    
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-purple-600">
              <FaRobot size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Analisis Cerdas AI</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* CONTENT (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 1. Document Type & Risk Badge */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jenis Dokumen</span>
              <div className="flex items-center gap-2 mt-1">
                <FaFileContract className="text-blue-500" />
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">{data.document_type || "Dokumen Umum"}</h4>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-2 ${getRiskColor(data.risk_level)}`}>
              {data.risk_level === 'High' ? <FaExclamationTriangle /> : <FaCheckCircle />}
              RISIKO: {data.risk_level?.toUpperCase()}
            </div>
          </div>

          {/* 2. Summary */}
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Ringkasan Eksekutif</h5>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* 3. Parties Involved */}
          <div>
            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <FaUserTie className="text-slate-400" /> Pihak Terkait
            </h5>
            <div className="flex flex-wrap gap-2">
              {data.parties?.map((party, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 text-sm rounded-lg font-medium border border-blue-100 dark:border-slate-600">
                  {party}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Key Points (Risiko/Kewajiban) */}
          <div>
            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Poin Penting & Risiko</h5>
            <ul className="space-y-2">
              {data.key_points?.map((point, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-slate-600 dark:text-slate-300 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
          <button onClick={onClose} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all">
            Saya Mengerti
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiAnalysisModal;