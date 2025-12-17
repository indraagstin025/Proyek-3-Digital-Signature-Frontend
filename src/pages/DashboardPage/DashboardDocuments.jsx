// file: src/pages/DashboardDocuments/DashboardDocuments.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// [1] Hapus 'Toaster' dari import, sisakan 'toast'
import { toast } from "react-hot-toast"; 
import { FaPlus, FaSpinner, FaFileAlt } from "react-icons/fa";

// ... imports lainnya (Hooks, Components, Modals) ...
import { useDashboardDocuments } from "../../hooks/useDashboardDocuments";
import DocumentFilters from "../../components/DashboardDocuments/DocumentFilters";
import DocumentCard from "../../components/DashboardDocuments/DocumentCard.jsx";
import BatchActionBar from "../../components/DashboardDocuments/BatchActionBar";
import ViewDocumentModal from "../../components/ViewDocumentModal/ViewDocumentModal.jsx";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";

const DashboardDocuments = () => {
  // ... (Semua logic hook & state TETAP SAMA) ...
  const {
    personalDocuments,
    groupDocuments,
    isLoading,
    isSearching,
    error,
    getDerivedStatus,
    fetchDocuments,
    deleteDocument,
    selectedDocIds,
    toggleDocumentSelection,
    clearSelection,
    startBatchSigning,
    isSubmittingBatch,
    searchQuery,
    setSearchQuery,
  } = useDashboardDocuments();

  const [activeTab, setActiveTab] = useState("personal");
  const [isManagementModalOpen, setManagementModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  const navigate = useNavigate();

  // ... (Semua helpers TETAP SAMA) ...
  const handleSmartNavigation = (doc, action = 'sign') => {
    if (action === 'view') {
      navigate(`/documents/${doc.id}/view`);
      return;
    }
    const isGroupDoc = doc.groupId || (doc.group && doc.group.id);
    if (isGroupDoc) {
      navigate(`/documents/${doc.id}/group-sign`);
    } else {
      navigate(`/documents/${doc.id}/sign`);
    }
  };

  const openManagementModal = (mode, doc = null) => {
    setModalMode(mode);
    setSelectedDocument(doc);
    setManagementModalOpen(true);
  };

  const handleDeleteClick = (docId) => {
    setDocumentToDelete(docId);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    toast.promise(deleteDocument(documentToDelete), {
      loading: "Menghapus...",
      success: "Dokumen dihapus!",
      error: "Gagal menghapus.",
    });
    setIsConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  
  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200"; 
      case "action_needed": return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse"; 
      case "waiting": return "bg-slate-100 text-slate-500 border-slate-200"; 
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getTypeColor = (type) => {
    if (!type || type === "General" || type === "Lainnya") return "bg-gray-100 text-gray-600 border-gray-200";
    if (type.includes("SK") || type.includes("Keputusan")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (type.includes("Perjanjian") || type.includes("MoU")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (type.includes("Surat")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-teal-100 text-teal-700 border-teal-200";
  };

  const displayedDocuments = activeTab === "personal" ? personalDocuments : groupDocuments;

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar relative bg-transparent">
      
      {/* [PENTING] HAPUS KOMPONEN <Toaster /> DARI SINI AGAR TIDAK KONFLIK */}
      
      {/* --- STICKY HEADER SECTION --- */}
      <div className="sticky top-0 z-30 px-3 sm:px-8 pt-2 sm:pt-4 pb-2">
        {/* ... (Isi Header Tetap Sama) ... */}
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md -z-10 shadow-sm border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" />

        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dokumen Saya
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">
                Arsip digital & pelabelan otomatis AI.
              </p>
            </div>
            
            <button
              onClick={() => openManagementModal("create")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg sm:rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <FaPlus className="w-3.5 h-3.5" /> <span>Upload Baru</span>
            </button>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            <DocumentFilters 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              personalCount={personalDocuments.length}
              groupCount={groupDocuments.length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
            />
          </div>
        </div>
      </div>

      {/* --- LIST DOKUMEN --- */}
      <div className="px-3 sm:px-8 pb-32 max-w-7xl mx-auto mt-2 sm:mt-4">
        
        {/* Loading State */}
        {isLoading && displayedDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 animate-fade-in">
            <FaSpinner className="animate-spin text-3xl sm:text-4xl text-blue-500 mb-4" />
            <span className="text-slate-500 text-sm sm:text-base font-medium">Memuat dokumen...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className={`transition-opacity duration-300 ${isSearching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Empty State */}
            {!isLoading && displayedDocuments.length === 0 && (
              <div className="text-center py-12 sm:py-20 px-4 bg-white/60 dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 mt-2 sm:mt-4">
                <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {searchQuery ? <span className="text-4xl">🔍</span> : <FaFileAlt className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />}
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                    {searchQuery ? "Tidak ditemukan" : "Belum Ada Dokumen"}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery 
                    ? `Tidak ada dokumen yang cocok dengan "${searchQuery}"`
                    : activeTab === "personal" 
                        ? "Upload dokumen PDF pertama Anda di sini." 
                        : "Grup ini belum memiliki dokumen."}
                </p>
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="mt-4 text-blue-500 hover:underline text-sm font-medium">
                        Hapus pencarian
                    </button>
                )}
              </div>
            )}

            {/* Grid Dokumen */}
            {displayedDocuments.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {displayedDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedDocIds.has(doc.id)}
                    
                    onNavigate={(action) => handleSmartNavigation(doc, action)}
                    
                    onToggle={toggleDocumentSelection}
                    onManage={openManagementModal}
                    onDelete={handleDeleteClick}
                    getStatusClass={getStatusClass}
                    getTypeColor={getTypeColor}
                    formatDate={formatDate}
                    getDerivedStatus={getDerivedStatus}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* --- FLOATING ACTION BAR --- */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto shadow-2xl w-full sm:w-auto">
            <BatchActionBar 
                selectedCount={selectedDocIds.size}
                onClear={clearSelection}
                onSign={startBatchSigning}
                isSubmitting={isSubmittingBatch}
            />
        </div>
      </div>

      {/* --- MODALS --- */}
      {isManagementModalOpen && (
        <DocumentManagementModal
          mode={modalMode}
          initialDocument={selectedDocument}
          onClose={() => setManagementModalOpen(false)}
          onSuccess={() => fetchDocuments(searchQuery)}
          onViewRequest={(url) => {
            setSelectedDocumentUrl(url);
            setViewModalOpen(true);
          }}
        />
      )}
      
      <ViewDocumentModal 
        isOpen={isViewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        url={selectedDocumentUrl} 
      />
      
      <ConfirmationModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={confirmDelete} 
        title="Hapus Dokumen" 
        message="Dokumen ini akan dihapus permanen. Lanjutkan?" 
        confirmButtonColor="bg-red-600" 
      />
    </div>
  );
};

export default DashboardDocuments;