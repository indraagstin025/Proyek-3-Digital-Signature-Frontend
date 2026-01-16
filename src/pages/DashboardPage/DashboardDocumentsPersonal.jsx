import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaSpinner, FaFilePdf, FaUsers, FaArrowRight, FaBuilding, FaSearch, FaBoxOpen, FaCheckSquare, FaTimes } from "react-icons/fa";
import { useDashboardDocuments } from "../../hooks/Documents/useDashboardDocuments.js";
import DocumentCard from "../../components/DashboardDocuments/DocumentCard.jsx";
import BatchActionBar from "../../components/DashboardDocuments/BatchActionBar.jsx";
import ViewDocumentModal from "../../components/ViewDocumentModal/ViewDocumentModal.jsx";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";

const GroupShortcutView = ({ onGoToWorkspace }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in bg-white/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 mt-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-full mb-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <FaUsers className="w-12 h-12 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Belum Ada Dokumen Grup</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm leading-relaxed">Anda belum tergabung dalam grup manapun atau grup Anda belum memiliki dokumen.</p>
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

const DashboardDocumentsPersonal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isGroupView = location.pathname.includes("/group");
  const isPackageView = location.pathname.includes("/packages");

  // --- KONFIGURASI HEADER ---
  let pageTitle = "Arsip Pribadi";
  let pageIcon = (
    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl border border-red-100 dark:border-red-800/50 flex items-center justify-center shadow-sm">
      <FaFilePdf className="w-6 h-6 text-red-600 dark:text-red-500" />
    </div>
  );
  let pageDescription = "Koleksi dokumen pribadi Anda.";

  if (isGroupView) {
    pageTitle = "Arsip Grup";
    pageIcon = (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-center shadow-sm">
        <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-500" />
      </div>
    );
    pageDescription = "Dokumen kolaborasi tim & workspace.";
  } else if (isPackageView) {
    pageTitle = "Riwayat Paket";
    pageIcon = (
      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-2xl border border-purple-100 dark:border-purple-800/50 flex items-center justify-center shadow-sm">
        <FaBoxOpen className="w-6 h-6 text-purple-600 dark:text-purple-500" />
      </div>
    );
    pageDescription = "Bundle dokumen batch sign.";
  }

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
    currentUser,
  } = useDashboardDocuments();

  // --- LOCAL STATE ---
  const [isManagementModalOpen, setManagementModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    clearSelection();
    setSearchQuery("");
    setIsSelectionMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // --- FILTERING ---
  let displayedDocuments = [];
  if (isGroupView) {
    displayedDocuments = groupDocuments;
  } else {
    if (isPackageView) {
      displayedDocuments = personalDocuments.filter((doc) => doc.type === "PACKAGE" || doc.isPackage);
    } else {
      displayedDocuments = personalDocuments.filter((doc) => doc.type !== "PACKAGE" && !doc.isPackage);
    }
  }

  // --- HANDLERS ---
  const handleGoToWorkspace = () => navigate("/dashboard/workspaces");

  const handleSmartNavigation = (doc, action = "sign") => {
    if (action === "view") {
      navigate(`/documents/${doc.id}/view`);
      return;
    }
    if (doc.type === "PACKAGE" || doc.isPackage) {
      navigate(`/packages/sign/${doc.id}`);
      return;
    }
    const isGroupDoc = doc.groupId || (doc.group && doc.group.id);
    if (isGroupDoc) {
      navigate(`/documents/${doc.id}/group-sign`);
    } else {
      navigate(`/documents/${doc.id}/sign`);
    }
  };

  const openManagementModal = (modeInput, docInput = null) => {
    let mode = modeInput;
    if (mode === "update") mode = "view";
    setModalMode(mode);
    setSelectedDocument(docInput);
    setManagementModalOpen(true);
  };

  const handleDeleteClick = (docId) => {
    setDocumentToDelete(docId);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    await deleteDocument(documentToDelete);
    setIsConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      clearSelection();
      setIsSelectionMode(false);
    } else {
      setIsSelectionMode(true);
    }
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
    if (type === "PACKAGE") return "bg-purple-100 text-purple-700 border-purple-200";
    if (!type || type === "General") return "bg-gray-100 text-gray-600 border-gray-200";
    return "bg-teal-100 text-teal-700 border-teal-200";
  };

  const showGroupShortcut = isGroupView && displayedDocuments.length === 0 && !searchQuery && !isLoading;
  const showEmptyState = !isGroupView && displayedDocuments.length === 0 && !searchQuery && !isLoading;

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar relative bg-transparent">
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 px-3 sm:px-8 pt-2 sm:pt-4 pb-2">
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md -z-10 shadow-sm border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" />

        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            {/* Bagian Kiri */}
            <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2">
              <div className="flex items-center gap-3">
                {pageIcon}
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{pageTitle}</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{pageDescription}</p>
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className="relative w-full sm:max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? <FaSpinner className="animate-spin text-blue-500" /> : <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />}
                </div>
                <input
                  type="text"
                  placeholder="Cari dokumen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Bagian Kanan */}
            <div className="flex shrink-0 gap-2">
              {!isGroupView && !isPackageView && (
                <>
                  <button
                    onClick={toggleSelectionMode}
                    className={`flex items-center justify-center gap-2 text-sm font-medium h-10 px-4 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap border
                      ${isSelectionMode ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200" : "bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-300"}`}
                  >
                    {isSelectionMode ? (
                      <>
                        <FaTimes className="text-xs" />
                        <span>Batal Pilih</span>
                      </>
                    ) : (
                      <>
                        <FaCheckSquare className="text-xs" />
                        <span>Pilih Banyak</span>
                      </>
                    )}
                  </button>

                  {!isSelectionMode && (
                    <button
                      onClick={() => openManagementModal("create")}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-4 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95 hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      <FaPlus className="text-xs" />
                      <span>Upload</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="px-3 sm:px-8 pb-32 max-w-7xl mx-auto mt-2 sm:mt-4">
        {isLoading && displayedDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
            <span className="text-slate-500 font-medium">Memuat data...</span>
          </div>
        )}

        {error && <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-xl mb-6">{error}</div>}

        <div className={`transition-opacity duration-300 ${isSearching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {showGroupShortcut && <GroupShortcutView onGoToWorkspace={handleGoToWorkspace} />}
          {showEmptyState && (
            <div className="text-center py-20 px-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {isPackageView ? <FaBoxOpen className="text-2xl text-purple-400" /> : <FaFilePdf className="text-2xl text-red-400" />}
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">{isPackageView ? "Belum Ada Riwayat Paket" : "Belum Ada Dokumen"}</h4>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{isPackageView ? "Buat paket baru untuk tanda tangan massal." : "Mulai dengan mengupload dokumen baru."}</p>
            </div>
          )}

          {!isLoading && displayedDocuments.length === 0 && searchQuery && (
            <div className="text-center py-20">
              <p className="text-slate-500">Tidak ditemukan hasil untuk "{searchQuery}"</p>
            </div>
          )}

          {displayedDocuments.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {displayedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  isSelected={selectedDocIds.has(doc.id)}
                  onToggle={toggleDocumentSelection}
                  onNavigate={(action) => handleSmartNavigation(doc, action)}
                  onManage={openManagementModal}
                  onDelete={handleDeleteClick}
                  getStatusClass={getStatusClass}
                  getTypeColor={getTypeColor}
                  formatDate={formatDate}
                  getDerivedStatus={getDerivedStatus}
                  enableSelection={!isGroupView && !isPackageView && isSelectionMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- BATCH ACTION BAR --- */}
      {/* LOGIKA YANG DIUBAH:
        Hanya muncul jika mode seleksi aktif (isSelectionMode)
        DAN jumlah dokumen terpilih (selectedDocIds.size) lebih atau sama dengan 2 
      */}
      {!isGroupView && !isPackageView && isSelectionMode && selectedDocIds.size >= 2 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 animate-slide-up">
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

      {isUploadModalOpen && <DocumentManagementModal mode="create" currentUser={currentUser} onClose={() => setIsUploadModalOpen(false)} onSuccess={() => fetchDocuments(searchQuery)} />}

      <ViewDocumentModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} url={selectedDocumentUrl} />
      <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Hapus Dokumen" message="Apakah Anda yakin?" confirmButtonColor="bg-red-600" />
    </div>
  );
};

export default DashboardDocumentsPersonal;
