import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import ViewDocumentModal from "../../components/ViewDocumentModal/ViewDocumentModal.jsx";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";
import { Toaster, toast } from "react-hot-toast";
import { FaPlus, FaCog, FaEye, FaTrashAlt, FaSpinner, FaSignature, FaFileAlt } from "react-icons/fa";

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

  const navigate = useNavigate();
  const location = useLocation();

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const fetchedDocuments = await documentService.getAllDocuments();
      setDocuments(fetchedDocuments);
    } catch (err) {
      if (err.response?.status !== 401) {
        const message = err.message || "Gagal memuat dokumen.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      toast.success("Daftar dokumen diperbarui.");
      fetchDocuments();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const openManagementModal = (mode, document = null) => {
    setModalMode(mode);
    setSelectedDocument(document);
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
  // Cukup arahkan ke route yang sudah Anda siapkan di App.jsx
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
    const toastId = toast.loading("Menghapus dokumen...");
    try {
      await documentService.deleteDocument(documentToDelete);
      toast.success("Dokumen berhasil dihapus!", { id: toastId });
      fetchDocuments();
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.message || "Gagal menghapus dokumen.", { id: toastId });
      }
    } finally {
      setIsConfirmOpen(false);
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
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
    const isCurrentVersionSigned = doc.currentVersion?.signaturesPersonal?.length > 0;
    if (doc.status === "completed" && !isCurrentVersionSigned) {
      return "draft";
    }
    return doc.status;
  };

  return (
    <div id="tab-documents" className="p-0 sm:p-4">
      <Toaster />
      {/* --- Header Dashboard --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Manajemen Dokumen</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola, tanda tangani, dan lacak status semua dokumen Anda.</p>
        </div>
        <button
          onClick={() => openManagementModal("create")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-4 rounded-full hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 w-full sm:w-auto shadow-lg shadow-blue-500/40"
        >
          {/* Menggunakan FaPlus agar konsisten dengan react-icons/fa */}
          <FaPlus className="w-4 h-4" />
          <span className="text-sm">Dokumen Baru</span>
        </button>
      </div>

      {/* --- Loading & Error --- */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-3xl text-blue-500" />
          <p className="ml-3 text-slate-500 dark:text-slate-400">Memuat daftar dokumen...</p>
        </div>
      )}
      {error && <p className="text-center text-red-500 p-8 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700">{error}</p>}

      {/* --- Tampilan Utama Dokumen --- */}
      {!isLoading && !error && (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-20 px-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              <FaFileAlt className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
              <h4 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-200">Belum Ada Dokumen di Sini</h4>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Klik tombol di bawah untuk mulai mengunggah dan memproses dokumen pertama Anda.</p>
              <button onClick={() => openManagementModal("create")} className="mt-6 flex items-center mx-auto gap-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
                <FaPlus />
                <span>Buat Dokumen</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {documents.map((doc) => {
                const displayedStatus = getDerivedStatus(doc);
                return (
                  <div key={doc.id} className="relative p-5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:border-blue-400 group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Kolom Kiri: Info Dokumen & Aksi Sekunder */}
                      <div className="flex items-start gap-4 flex-grow min-w-0">
                        <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <FaFileAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="font-bold text-lg text-slate-800 dark:text-white truncate" title={doc.title}>
                            {doc.title}
                          </p>

                          {/* Detail Status & Tanggal */}
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusClass(displayedStatus)}`}>{displayedStatus}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Diperbarui: {formatDate(doc.updatedAt)}</span>
                          </div>

                          {/* --- REVISI 1: Aksi Sekunder Selalu Terlihat (Hapus kelas opacity-0 group-hover:opacity-100) --- */}
                          <div className="mt-3 flex items-center gap-1.5 ">
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="flex items-center gap-1.5 p-2 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                              title={displayedStatus === "completed" ? "Lihat Hasil TTD" : "Lihat Versi Aktif"}
                            >
                              <FaEye className="w-4 h-4" />
                              <span className="hidden sm:inline">Lihat</span>
                            </button>
                            <button
                              onClick={() => openManagementModal("update", doc)}
                              className="flex items-center gap-1.5 p-2 text-xs text-slate-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-gray-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Kelola & Riwayat"
                            >
                              <FaCog className="w-4 h-4" />
                              <span className="hidden sm:inline">Kelola</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="flex items-center gap-1.5 p-2 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                              title="Hapus Dokumen"
                            >
                              <FaTrashAlt className="w-4 h-4" />
                              <span className="hidden sm:inline">Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Kolom Kanan: Aksi Utama */}
                      <div className="flex-shrink-0 flex justify-end md:justify-center w-full md:w-auto mt-4 md:mt-0">
                        {/* --- REVISI 2: Posisi Tombol Tanda Tangani Lebih Rapi --- */}
                        {displayedStatus !== "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/documents/${doc.id}/sign`);
                            }}
                            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors duration-300 shadow-lg shadow-green-500/40 w-full md:w-auto"
                            title="Lanjutkan Proses Tanda Tangan"
                          >
                            <FaSignature className="w-4 h-4" />
                            <span>Tanda Tangani</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* --- Modal-modal --- */}
      {isManagementModalOpen && <DocumentManagementModal 
      mode={modalMode} 
      document={selectedDocument} 
      onClose={closeManagementModal} 
      onSuccess={handleSuccess} 
      onViewRequest={handleViewRequestFromModal} />}
      <ViewDocumentModal 
      isOpen={isViewModalOpen} 
      onClose={() => setViewModalOpen(false)} url={selectedDocumentUrl} />
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
