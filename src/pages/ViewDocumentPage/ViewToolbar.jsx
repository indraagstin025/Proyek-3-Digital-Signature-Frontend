import React from 'react';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaFolderOpen } from "react-icons/fa";

const ViewToolbar = ({ 
  pageNumber, numPages, onPrev, onNext, onTogglePreview, previewOpen, onBack 
}) => {
  const btnClass = "p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200";

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      
      {/* Kiri: Back */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={btnClass} title="Kembali">
          <FaArrowLeft />
        </button>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Hal {pageNumber} / {numPages || "--"}
        </span>
      </div>

      {/* Kanan: Navigasi & Preview */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1 mr-2">
          <button onClick={onPrev} disabled={pageNumber <= 1} className={`${btnClass} disabled:opacity-30`}>
            <FaChevronLeft size={14} />
          </button>
          <button onClick={onNext} disabled={pageNumber >= numPages} className={`${btnClass} disabled:opacity-30`}>
            <FaChevronRight size={14} />
          </button>
        </div>

        <button 
          onClick={onTogglePreview} 
          className={`${btnClass} ${previewOpen ? "bg-slate-200 dark:bg-slate-700" : ""}`}
          title="Toggle Preview"
        >
          <FaFolderOpen />
        </button>
      </div>
    </div>
  );
};

export default ViewToolbar;