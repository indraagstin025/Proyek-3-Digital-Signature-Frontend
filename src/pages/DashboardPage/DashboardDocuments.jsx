import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import { packageService } from "../../services/packageService.js";
import ViewDocumentModal from "../../components/ViewDocumentModal/ViewDocumentModal.jsx";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";
import { Toaster, toast } from "react-hot-toast";
import { FaPlus, FaCog, FaEye, FaTrashAlt, FaSpinner, FaSignature, FaFileAlt, FaCheck } from "react-icons/fa";

const DashboardDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isManagementModalOpen, setManagementModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const refreshToastShownRef = useRef(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetched = await documentService.getAllDocuments();
      setDocuments(fetched || []);
      setError(null);
    } catch (err) {
      if (err?.response?.status !== 401) {
        const message = err?.message || "Gagal memuat dokumen.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (location.state?.refresh && !refreshToastShownRef.current) {
      refreshToastShownRef.current = true;
      toast.success("Daftar dokumen diperbarui.");
      fetchDocuments();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, fetchDocuments]);

  const openManagementModal = (mode, doc = null) => {
    setModalMode(mode);
    setSelectedDocument(doc);
    setManagementModalOpen(true);
  };

  const closeManagementModal = () => {
    setManagementModalOpen(false);
    setSelectedDocument(null);
  };

  const handleSuccess = () => {
    fetchDocuments();
  };

  const handleViewDocument = (doc) => {
    navigate(`/documents/${doc.id}/view`);
  };

  const handleDeleteDocument = (documentId) => {
    setDocumentToDelete(documentId);
    setIsConfirmOpen(true);
  };

  const handleViewRequestFromModal = (url) => {
    setSelectedDocumentUrl(url);
    setViewModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    toast
      .promise(documentService.deleteDocument(documentToDelete), {
        loading: "Menghapus dokumen...",
        success: <b>Dokumen berhasil dihapus!</b>,
        error: (err) => err.message || "Gagal menghapus dokumen.",
      })
      .then(() => fetchDocuments());
    setIsConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-orange-500/10 text-orange-600 ring-1 ring-inset ring-orange-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 ring-1 ring-inset ring-green-500/20";
      case "draft":
      default:
        return "bg-slate-500/10 text-slate-500 ring-1 ring-inset ring-slate-500/20";
    }
  };

  const getDerivedStatus = (doc) => {
    const currentVer = doc.currentVersion;

    if (!currentVer) return doc.status || "draft";

    const isPersonalSigned = currentVer.signaturesPersonal && currentVer.signaturesPersonal.length > 0;

    const isPackageSigned =
      currentVer.packages &&
      currentVer.packages.some((p) => {
        return p.package && (p.package.status === "completed" || p.package.status === "COMPLETED");
      });

    if (isPersonalSigned || isPackageSigned) return "completed";

    if (doc.status === "pending") return "pending";

    return "draft";
  };

  const handleSelectDocument = (docId) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    const displayedStatus = getDerivedStatus(doc);

    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else {
        if (displayedStatus !== "completed") next.add(docId);
        else {
          toast.error("Dokumen yang sudah 'completed' tidak bisa dipilih.");
        }
      }
      return next;
    });
  };

  const handleBatchSignClick = async () => {
    setIsSubmittingBatch(true);
    const toastId = toast.loading("Mempersiapkan paket tanda tangan...");

    try {
      const docIds = Array.from(selectedDocIds);
      if (docIds.length === 0) {
        throw new Error("Tidak ada dokumen yang dipilih.");
      }
      const packageTitle = `Paket ${docIds.length} Dokumen - ${new Date().toLocaleDateString("id-ID")}`;

      const newPackage = await packageService.createPackage(docIds, packageTitle);
      if (!newPackage?.id) throw new Error("Gagal mendapatkan ID Paket dari server.");

      toast.dismiss(toastId);
      navigate(`/packages/sign/${newPackage.id}`);
      setSelectedDocIds(new Set());
    } catch (err) {
      toast.error(err.message || "Gagal memulai sesi tanda tangan batch.", { id: toastId });
      setIsSubmittingBatch(false);
    }
  };

  return (
    <div id="tab-documents" className="pt-15 sm:pt-20 p-5 sm:p-6 max-w-full overflow-x-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Manajemen Dokumen</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola, tanda tangani, dan lacak status semua dokumen Anda.</p>
        </div>

        <div className="w-full sm:w-auto">
          <button
            onClick={() => openManagementModal("create")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-4 rounded-full hover:opacity-95 w-full sm:w-auto shadow-lg"
            aria-label="Buat Dokumen Baru"
          >
            <FaPlus className="w-4 h-4" />
            <span className="text-sm">Dokumen Baru</span>
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <FaSpinner className="animate-spin text-3xl text-blue-500" />
          <span className="ml-3 text-slate-500">Memuat daftar dokumen...</span>
        </div>
      )}
      {error && <div className="text-center text-red-500 p-4 rounded bg-red-50 dark:bg-red-900/10 border border-red-200">{error}</div>}

      {/* Batch bar (mobile fixed bottom, desktop static) */}
      {selectedDocIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:static sm:mb-6 z-40 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/50 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-blue-800 dark:text-blue-200">{selectedDocIds.size} dokumen dipilih</span>
            <button onClick={() => setSelectedDocIds(new Set())} className="py-1 px-3 text-xs text-slate-700 dark:text-slate-300 rounded-md bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700">
              Batal
            </button>
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <button onClick={handleBatchSignClick} disabled={isSubmittingBatch} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md w-full sm:w-auto">
              {isSubmittingBatch ? <FaSpinner className="animate-spin" /> : <FaSignature className="w-4 h-4" />}
              <span>Tanda Tangani ({selectedDocIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && documents.length === 0 && (
        <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <FaFileAlt className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
          <h4 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">Belum Ada Dokumen di Sini</h4>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Klik tombol di bawah untuk mulai mengunggah dan memproses dokumen pertama Anda.</p>
          <button onClick={() => openManagementModal("create")} className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-full shadow-md">
            <FaPlus />
            <span>Buat Dokumen</span>
          </button>
        </div>
      )}

      {/* List (FULL WIDTH horizontal rows) */}
      {!isLoading && documents.length > 0 && (
        <div className="space-y-4 mt-2">
          {documents.map((doc) => {
            const displayedStatus = getDerivedStatus(doc);
            const isSelected = selectedDocIds.has(doc.id);
            const isCompleted = displayedStatus === "completed";

            return (
              <article
                key={doc.id}
                className={`w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 
                  bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200
                  ${isSelected ? "ring-2 ring-blue-500 border-transparent shadow-lg" : "hover:shadow-md dark:hover:border-slate-600"}
                `}
                onClick={!isCompleted ? () => handleSelectDocument(doc.id) : undefined}
                aria-label={`Dokumen ${doc.title}`}
              >
                {/* Left group: Button + icon + info */}
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto sm:flex-1 min-w-0">
                  {/* --- CUSTOM SELECTION BUTTON --- */}
                  <div className="flex-shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isCompleted) handleSelectDocument(doc.id);
                      }}
                      disabled={isCompleted}
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 focus:outline-none
                        ${isSelected ? "bg-blue-500 border-blue-500 text-white shadow-md transform scale-105" : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-300 hover:border-blue-400 hover:text-blue-400"}
                        ${isCompleted ? "opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800" : "cursor-pointer"}
                      `}
                      title={isSelected ? "Batalkan Pilihan" : isCompleted ? "Sudah Selesai" : "Pilih Dokumen"}
                    >
                      {isSelected ? <FaCheck className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* ------------------------------- */}

                  {/* Icon File */}
                  <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <FaFileAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Title + meta + secondary actions */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-snug break-words"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(displayedStatus)}`}>{displayedStatus}</span>
                      <span className="text-slate-500 dark:text-slate-400">Diperbarui: {formatDate(doc.updatedAt)}</span>
                    </div>

                    {/* Action Buttons (Lihat, Kelola, Hapus) */}
                    <div className="mt-3 flex items-center gap-2 sm:gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(doc);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Lihat"
                      >
                        <FaEye className="w-4 h-4" />
                        <span className="hidden sm:inline">Lihat</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openManagementModal("update", doc);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Kelola"
                      >
                        <FaCog className="w-4 h-4" />
                        <span className="hidden sm:inline">Kelola</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 dark:hover:bg-red-900/20 dark:text-red-400 transition-colors"
                        title="Hapus"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: primary action (Sign) */}
                <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  {displayedStatus !== "completed" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/documents/${doc.id}/sign`);
                      }}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg"
                      title="Lanjutkan Proses Tanda Tangan"
                    >
                      <FaSignature className="w-4 h-4" />
                      <span>Tanda Tangani</span>
                    </button>
                  ) : (
                    <div className="text-sm text-slate-400 italic">Selesai</div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isManagementModalOpen && <DocumentManagementModal mode={modalMode} initialDocument={selectedDocument} onClose={closeManagementModal} onSuccess={handleSuccess} onViewRequest={handleViewRequestFromModal} />}

      <ViewDocumentModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} url={selectedDocumentUrl} />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus dokumen ini beserta semua riwayatnya? Aksi ini tidak dapat dibatalkan."
        confirmText="Hapus Permanen"
        cancelText="Batal"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default DashboardDocuments;
