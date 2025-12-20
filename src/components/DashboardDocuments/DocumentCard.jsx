// src/components/dashboard/DocumentCard.jsx
import React from "react";
import { FaCheck, FaRobot, FaSignature, FaCheckCircle, FaEye, FaCog, FaTrashAlt , FaFileAlt} from "react-icons/fa";

const DocumentCard = ({ 
  doc, 
  isSelected, 
  onToggle, 
  onNavigate, 
  onManage, 
  onDelete, 
  getStatusClass, 
  getTypeColor, 
  formatDate,
  getDerivedStatus,
  enableSelection = true 
}) => {
  const displayedStatus = getDerivedStatus(doc);
  const isCompleted = displayedStatus === "completed";
  const mySignerData = doc.signerRequests?.[0];
  const hasISigned = mySignerData && mySignerData.status === "SIGNED";
  const isActionDone = isCompleted || (hasISigned && displayedStatus !== "draft");

  // Handler klik kartu
  const handleCardClick = () => {
    if (!enableSelection) return; 
    if (!isCompleted) {
      onToggle(doc.id);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200 
        ${enableSelection ? "cursor-pointer" : "cursor-default"} 
        ${isSelected 
          ? "border-blue-500 ring-1 ring-blue-500 shadow-md bg-blue-50/30 dark:bg-blue-900/10" 
          : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20"
        }`}
    >
      {/* Kiri: Checkbox & Info */}
      <div className="flex items-start gap-4 w-full sm:flex-1 min-w-0">
        
        {/* Checkbox / Icon */}
        {enableSelection ? (
          <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all 
            ${isSelected ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-slate-300 text-transparent group-hover:border-blue-400"}`}>
            <FaCheck className="w-3 h-3" />
          </div>
        ) : (
          <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
             <FaFileAlt className="w-4 h-4" />
          </div>
        )}

        {/* --- INFO DOCUMENT (LAYOUT BARU) --- */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          
          {/* 1. JUDUL (Full Width) */}
          <h3 className="text-base font-bold text-slate-800 dark:text-white truncate w-full" title={doc.title}>
            {doc.title}
          </h3>
          
          {/* 2. LABEL ROW (Pindah ke Bawah) */}
          {(doc.type && doc.type !== "Uncategorized") || doc.group ? (
            <div className="flex flex-wrap items-center gap-2">
              {/* AI Label */}
              {doc.type && doc.type !== "Uncategorized" && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border tracking-wide ${getTypeColor(doc.type)}`}>
                  <FaRobot className="w-2.5 h-2.5" />
                  {doc.type}
                </div>
              )}
              
              {/* Group Label */}
              {doc.group && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 font-medium">
                  {doc.group.name}
                </span>
              )}
            </div>
          ) : null}

          {/* 3. META ROW (Status & Date) */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusClass(displayedStatus)}`}>
              {displayedStatus}
            </span>
            <span>•</span>
            <span>{formatDate(doc.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Kanan: Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-700 pt-3 sm:pt-0 mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
        {!isActionDone ? (
          <button
            onClick={() => onNavigate()} 
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition-transform active:scale-95"
          >
            <FaSignature /> <span className="hidden sm:inline">Tanda Tangani</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
            <FaCheckCircle />
            {hasISigned && !isCompleted ? "Menunggu Partner" : "Selesai"}
          </div>
        )}

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
          <button onClick={() => onNavigate('view')} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all" title="Lihat">
            <FaEye />
          </button>
          
          <button onClick={() => onManage("update", doc)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all" title="Kelola">
            <FaCog />
          </button>
          
          <button onClick={() => onDelete(doc.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all" title="Hapus">
            <FaTrashAlt />
          </button>
        </div>
      </div>
    </article>
  );
};

export default DocumentCard;