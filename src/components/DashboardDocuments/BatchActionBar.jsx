// src/components/dashboard/BatchActionBar.jsx
import React from "react";
import { FaSpinner, FaSignature } from "react-icons/fa";

const BatchActionBar = ({ selectedCount, onClear, onSign, isSubmitting }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-2xl p-4 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-4 animate-slide-up">
      <div className="flex items-center gap-3 pl-2">
        <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{selectedCount}</div>
        <span className="font-medium text-sm">Dokumen dipilih</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onClear} className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          Batal
        </button>
        <button
          onClick={onSign}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg shadow transition-transform hover:scale-105 active:scale-95"
        >
          {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSignature />}
          <span>Tanda Tangani</span>
        </button>
      </div>
    </div>
  );
};

export default BatchActionBar;