import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import ViewDocumentModal from "../../components/ViewDocumentModal/ViewDocumentModal.jsx";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";
import { Toaster, toast } from "react-hot-toast";
import { FaPlus, FaCog, FaEye, FaTrashAlt, FaSpinner, FaPenSquare, FaFileSignature } from "react-icons/fa";

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
            setError(err.message || "Gagal memuat dokumen.");
            toast.error(err.message || "Gagal memuat dokumen.");
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect untuk memuat data pertama kali
    useEffect(() => {
        fetchDocuments();
    }, []);

    // useEffect untuk menangani refresh otomatis setelah TTD
    useEffect(() => {
        if (location.state?.refresh) {
            toast.success("Daftar dokumen diperbarui.");
            fetchDocuments();
            // Hapus state agar tidak refresh terus-menerus
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

    const handleViewDocument = (document) => {
        let urlToView = null;
        if (document.status === 'completed' && document.signedFileUrl) {
            urlToView = document.signedFileUrl;
        } else if (document.currentVersion && document.currentVersion.url) {
            urlToView = document.currentVersion.url;
        }

        if (urlToView) {
            setSelectedDocumentUrl(urlToView);
            setViewModalOpen(true);
        } else {
            toast.error("URL dokumen tidak dapat ditemukan.");
        }
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
            toast.error(err.message || "Gagal menghapus dokumen.", { id: toastId });
        } finally {
            setIsConfirmOpen(false);
            setDocumentToDelete(null);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
            case "completed":
                return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400";
            case "draft":
            default:
                return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400";
        }
    };

    // --- FUNGSI BARU UNTUK MEMPERBAIKI STATUS ---
    const getDerivedStatus = (doc) => {
        // Cek apakah versi yang sedang aktif memiliki tanda tangan
        const isCurrentVersionSigned = doc.currentVersion?.signaturesPersonal?.length > 0;
        
        // Jika status dari backend "completed" TAPI versi aktifnya TIDAK ditandatangani,
        // maka anggap statusnya "draft" untuk ditampilkan di UI.
        if (doc.status === 'completed' && !isCurrentVersionSigned) {
            return 'draft';
        }

        // Jika tidak, gunakan status asli dari backend.
        return doc.status;
    };

    return (
        <div id="tab-documents">
            <Toaster position="top-center" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Semua Dokumen</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kelola semua dokumen Anda di satu tempat.</p>
                </div>
                <button
                    onClick={() => openManagementModal("create")}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-4 rounded-full hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 w-full sm:w-auto"
                >
                    <FaPlus />
                    <span>Tambah Dokumen</span>
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-3xl text-blue-500" />
                    <p className="ml-3 text-slate-500 dark:text-slate-400">Memuat dokumen...</p>
                </div>
            )}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!isLoading && !error && (
                <div className="space-y-4">
                    {documents.map((doc) => {
                        // --- GUNAKAN FUNGSI BARU DI SINI ---
                        const displayedStatus = getDerivedStatus(doc);

                        return (
                            <div key={doc.id} className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-800 dark:text-white">{doc.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Diperbarui: {formatDate(doc.updatedAt)}</p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {/* --- GUNAKAN STATUS YANG SUDAH DIPERBAIKI --- */}
                                    <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${getStatusClass(displayedStatus)}`}>{displayedStatus}</span>
                                    <button
                                        onClick={() => handleViewDocument(doc)}
                                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                        title={displayedStatus === 'completed' ? "Lihat Hasil TTD" : "Lihat Versi Aktif"}
                                    >
                                        {displayedStatus === 'completed' ? <FaFileSignature /> : <FaEye />}
                                    </button>
                                    <button
                                        onClick={() => openManagementModal("update", doc)}
                                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                        title="Kelola & Riwayat"
                                    >
                                        <FaCog />
                                    </button>
                                    {/* --- KONDISI JUGA MENGGUNAKAN STATUS BARU --- */}
                                    {displayedStatus !== 'completed' && (
                                        <button
                                            onClick={() => navigate(`/documents/${doc.id}/sign`)}
                                            className="p-2 text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                            title="Tanda Tangani Dokumen"
                                        >
                                            <FaPenSquare />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                        title="Hapus Dokumen"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {isManagementModalOpen && 
            <DocumentManagementModal mode={modalMode} document={selectedDocument} onClose={closeManagementModal} onSuccess={handleSuccess} onViewRequest={handleViewRequestFromModal}  />}
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
                confirmText="Hapus"
                cancelText="Batal"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

export default DashboardDocuments;