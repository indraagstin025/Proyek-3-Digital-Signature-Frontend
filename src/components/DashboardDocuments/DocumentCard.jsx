// src/components/dashboard/DocumentCard.jsx
import React from "react";
import { FaCheck, FaTags, FaSignature, FaCheckCircle, FaEye, FaCog, FaTrashAlt, FaFileAlt, FaFilePdf } from "react-icons/fa";

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
  // Safety check untuk props
  const displayedStatus = (typeof getDerivedStatus === 'function') 
    ? getDerivedStatus(doc) 
    : (doc.status || "Draft");

  const isCompleted = displayedStatus === "completed" || displayedStatus === "COMPLETED";
  const mySignerData = doc.signerRequests?.find(s => s.email === doc.currentUserEmail) || doc.signerRequests?.[0];
  const hasISigned = mySignerData && mySignerData.status === "SIGNED";
  const isActionDone = isCompleted || (hasISigned && displayedStatus !== "draft");

  // 1. Handler Klik Tombol Centang (Checkbox)
  const handleSelectionClick = (e) => {
    e.stopPropagation(); 
    if (!isCompleted) {
      onToggle(doc.id);
    }
  };

  // 2. [UBAH DISINI] Handler Klik Badan Kartu
  const handleCardClick = () => {
    // KONDISI:
    // Jika sedang Mode Seleksi (enableSelection = true), maka klik kartu = Pilih Dokumen
    if (enableSelection) {
       if (!isCompleted) {
         onToggle(doc.id);
       }
    }
    // Jika TIDAK Mode Seleksi, jangan lakukan apa-apa (User harus klik tombol Mata/Action)
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 
        ${enableSelection 
            ? "cursor-pointer" // Jika mode seleksi, cursor jadi jari (pointer)
            : "cursor-default" // Jika mode biasa, cursor biasa (default) agar user tahu tidak bisa diklik sembarangan
        }
        ${isSelected 
          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500 shadow-sm" 
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md" 
        }`}
    >
      {/* --- BAGIAN KIRI: Checkbox & Info --- */}
      <div className="flex items-start gap-4 w-full sm:flex-1 min-w-0">
        
        {/* Checkbox Area (Hanya muncul jika enableSelection/Mode Seleksi Aktif) */}
        {enableSelection ? (
           <div 
             onClick={handleSelectionClick}
             className="mt-1 relative z-10 group/checkbox p-1 -m-1 cursor-pointer"
             title="Pilih dokumen"
           >
             <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200
               ${isSelected 
                 ? "bg-blue-600 border-blue-600 scale-100" 
                 : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 group-hover/checkbox:border-blue-400 group-hover/checkbox:bg-blue-50"
               }`}
             >
               <FaCheck className={`w-3 h-3 text-white transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
             </div>
           </div>
        ) : (
          // Icon Statis
          <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
             <FaFileAlt className="w-4 h-4" />
          </div>
        )}

        {/* Info Document */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
             <h3 className={`text-base font-bold truncate transition-colors ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`} title={doc.title}>
               {doc.title || "Tanpa Judul"}
             </h3>
          </div>
          
          {(doc.type && doc.type !== "Uncategorized") || doc.group ? (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {doc.type && doc.type !== "Uncategorized" && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border tracking-wide ${getTypeColor ? getTypeColor(doc.type) : 'bg-gray-100 text-gray-600'}`}>
                  <FaTags className="w-2.5 h-2.5" />
                  {doc.type}
                </div>
              )}
              {doc.group && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 font-medium">
                  {doc.group.name}
                </span>
              )}
            </div>
          ) : null}

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusClass ? getStatusClass(displayedStatus) : 'bg-gray-100'}`}>
              {displayedStatus}
            </span>
            <span>•</span>
            <span>{formatDate ? formatDate(doc.updatedAt) : new Date(doc.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN: Actions --- */}
      <div 
        className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-700 pt-3 sm:pt-0 mt-2 sm:mt-0" 
        onClick={(e) => e.stopPropagation()} // Supaya klik tombol action tidak men-trigger event parent
      >
        {!isActionDone ? (
          <button
            onClick={() => onNavigate("sign")} 
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
          {/* Tombol VIEW (Mata) */}
          <button 
             onClick={() => onNavigate('view')} 
             className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all" 
             title="Lihat Detail" // Tooltip
          >
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