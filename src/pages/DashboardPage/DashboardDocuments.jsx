import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaPlus, FaSpinner, FaFileAlt, FaUsers, FaArrowRight, FaBuilding } from "react-icons/fa";
import { useDashboardDocuments } from "../../hooks/Documents/useDashboardDocuments";
import DocumentFilters from "../../components/DashboardDocuments/DocumentFilters";
import DocumentCard from "../../components/DashboardDocuments/DocumentCard.jsx";
import BatchActionBar from "../../components/DashboardDocuments/BatchActionBar";
import ViewDocumentModal from "../../components/ViewDocumentModal/ViewDocumentModal.jsx";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";

// ... (Komponen GroupShortcutView tetap sama, tidak perlu diubah) ...
const GroupShortcutView = ({ onGoToWorkspace }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in bg-white/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 mt-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-full mb-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <FaUsers className="w-12 h-12 text-blue-500" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Belum Ada Dokumen Grup</h3>

      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm leading-relaxed">Anda belum tergabung dalam grup manapun atau grup Anda belum memiliki dokumen. Kelola tim dan kolaborasi di Workspace.</p>

      <button
        onClick={onGoToWorkspace}
        className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
      >
        <FaBuilding className="text-lg" />
        <span>Buka Workspace</span>
        <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
      </button>
    </div>
  );
};

const DashboardDocuments = () => {
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
    isUploadModalOpen,
    setIsUploadModalOpen,
    currentUser
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

  // --- HANDLER ---
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearSelection();
  };

  const handleGoToWorkspace = () => {
    navigate("/dashboard/workspaces");
  };

  const handleSmartNavigation = (doc, action = "sign") => {
    if (action === "view") {
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

  // ✅ FIX MASALAH KEDUA: Double Toast Delete
  const confirmDelete = async () => {
    if (!documentToDelete) return;

    // Hapus wrapper toast.promise disini.
    // Kita cukup panggil deleteDocument karena Hook sudah menghandle toast-nya.
    await deleteDocument(documentToDelete);

    setIsConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "action_needed":
        return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
      case "waiting":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getTypeColor = (type) => {
    if (!type || type === "General") return "bg-gray-100 text-gray-600 border-gray-200";
    return "bg-teal-100 text-teal-700 border-teal-200";
  };

  const displayedDocuments = activeTab === "personal" ? personalDocuments : groupDocuments;
  const showGroupShortcut = activeTab === "group" && groupDocuments.length === 0 && !searchQuery && !isLoading;

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar relative bg-transparent">
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 px-3 sm:px-8 pt-2 sm:pt-4 pb-2">
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md -z-10 shadow-sm border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" />

        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dokumen Saya</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm">Arsip digital & pelabelan otomatis AI.</p>
            </div>

            {activeTab === "personal" && (
              <button
                onClick={() => openManagementModal("create")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg sm:rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 hover:-translate-y-0.5"
              >
                <FaPlus className="w-3.5 h-3.5" /> <span>Upload Pribadi</span>
              </button>
            )}
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            <DocumentFilters
              activeTab={activeTab}
              onTabChange={handleTabChange}
              personalCount={personalDocuments.length}
              groupCount={groupDocuments.length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              disableSearch={showGroupShortcut}
            />
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="px-3 sm:px-8 pb-32 max-w-7xl mx-auto mt-2 sm:mt-4">
        {showGroupShortcut ? (
          <GroupShortcutView onGoToWorkspace={handleGoToWorkspace} />
        ) : (
          <>
            {/* Loading */}
            {isLoading && displayedDocuments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                <span className="text-slate-500 font-medium">Memuat dokumen...</span>
              </div>
            )}

            {/* Error */}
            {error && <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-xl mb-6">{error}</div>}

            {/* List */}
            <div className={`transition-opacity duration-300 ${isSearching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              {!isLoading && displayedDocuments.length === 0 && (
                <div className="text-center py-20 px-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {searchQuery ? <span className="text-4xl">剥</span> : <FaFileAlt className="h-8 w-8 text-slate-400" />}
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white">{searchQuery ? "Tidak ditemukan" : activeTab === "personal" ? "Belum Ada Dokumen" : "Dokumen Grup Kosong"}</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{searchQuery ? `Hasil pencarian "${searchQuery}" nihil.` : "Upload dokumen PDF untuk mulai."}</p>
                </div>
              )}

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
                      enableSelection={activeTab === "personal"}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* --- FLOATING ACTION BAR (Hanya Personal) --- */}
      {activeTab === "personal" && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto shadow-2xl w-full sm:w-auto">
            <BatchActionBar selectedCount={selectedDocIds.size} onClear={clearSelection} onSign={startBatchSigning} isSubmitting={isSubmittingBatch} />
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {isManagementModalOpen && (
        <DocumentManagementModal
          mode={modalMode}
          initialDocument={selectedDocument}
          currentUser={currentUser}
          onClose={() => setManagementModalOpen(false)}
          onSuccess={() => fetchDocuments(searchQuery)}
          onViewRequest={(url) => {
            setSelectedDocumentUrl(url);
            setViewModalOpen(true);
          }}
        />
      )}

      {isUploadModalOpen && <DocumentManagementModal mode="create" onClose={() => setIsUploadModalOpen(false)} onSuccess={() => fetchDocuments(searchQuery)} />}

      <ViewDocumentModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} url={selectedDocumentUrl} />

      <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Hapus Dokumen" message="Dokumen ini akan dihapus permanen?" confirmButtonColor="bg-red-600" />
    </div>
  );
};

export default DashboardDocuments;
