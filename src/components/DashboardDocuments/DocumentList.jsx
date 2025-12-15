// src/components/dashboard/DocumentList.jsx
import React from "react";
import { FaSpinner, FaFileAlt } from "react-icons/fa";
import DocumentCard from "./DocumentCard"; // Pastikan path ini benar

const DocumentList = ({
  isLoading,
  isSearching,
  error,
  documents, // displayedDocuments
  searchQuery,
  activeTab,
  
  // Props untuk Card
  selectedDocIds,
  onToggle,
  onNavigate,
  onManage,
  onDelete,
  getStatusClass,
  getTypeColor,
  formatDate,
  getDerivedStatus
}) => {

  // 1. Loading Awal (Besar)
  if (isLoading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <span className="text-slate-500 font-medium">Memuat dokumen...</span>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-xl mb-6">{error}</div>;
  }

  // 3. Container Utama dengan Efek Transisi Search
  return (
    <div className={`transition-opacity duration-300 ${isSearching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      
      {/* A. Empty State: Data Kosong (Belum ada upload) */}
      {!isLoading && documents.length === 0 && !searchQuery && (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 mt-4">
          <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFileAlt className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white">Belum Ada Dokumen</h4>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === "personal" ? "Mulai dengan mengunggah dokumen PDF pertama Anda." : "Grup ini belum memiliki dokumen."}
          </p>
        </div>
      )}

      {/* B. Empty State: Search Not Found */}
      {!isLoading && documents.length === 0 && searchQuery && (
        <div className="text-center py-20 mt-4">
          <div className="text-slate-300 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Tidak ditemukan</h3>
          <p className="text-slate-500">Tidak ada dokumen cocok dengan "{searchQuery}"</p>
        </div>
      )}

      {/* C. Grid Dokumen */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-2">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isSelected={selectedDocIds.has(doc.id)}
              onToggle={onToggle}
              onNavigate={onNavigate}
              onManage={onManage}
              onDelete={onDelete}
              getStatusClass={getStatusClass}
              getTypeColor={getTypeColor}
              formatDate={formatDate}
              getDerivedStatus={getDerivedStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;