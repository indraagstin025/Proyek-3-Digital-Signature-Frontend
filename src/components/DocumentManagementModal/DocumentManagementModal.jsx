/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { documentService } from "../../services/documentService.js";
import toast from "react-hot-toast";
// 🔥 Tambahkan FaInfoCircle, FaBolt, FaWhatsapp, FaFileSignature untuk Modal Info
import { 
  FaSpinner, FaFileAlt, FaDownload, FaTrash, FaEye, FaCheckCircle, 
  FaUndo, FaTimes, FaCloudUploadAlt, FaHistory, FaInfoCircle, 
  FaBolt, FaWhatsapp, FaFileSignature 
} from "react-icons/fa";

// --- 1. SUB-KOMPONEN: FEATURE INFO MODAL ---
const FeatureModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform scale-100 transition-all">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" />
            Fitur Dokumen
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Feature 1 */}
          <div className="flex gap-3">
            <div className="mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              <FaBolt className="text-sm" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Live Status</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau status tanda tangan secara <strong>real-time</strong> tanpa perlu refresh halaman.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-3">
            <div className="mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <FaWhatsapp className="text-sm" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifikasi WhatsApp</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Notifikasi otomatis dikirim ke WhatsApp saat dokumen diunggah atau ditandatangani.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-3">
            <div className="mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FaFileSignature className="text-sm" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Versi & Riwayat</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Setiap perubahan disimpan sebagai versi baru. Anda bisa kembali ke versi sebelumnya kapan saja.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- 2. KOMPONEN UTAMA: DOCUMENT MANAGEMENT MODAL ---
const DocumentManagementModal = ({ mode, initialDocument, onClose, onSuccess, onViewRequest }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState([]);
  const [isHistoryLoading, setHistoryLoading] = useState(true);
  
  // State untuk Info Modal
  const [showInfo, setShowInfo] = useState(false);

  const [activeVersionId, setActiveVersionId] = useState(initialDocument?.currentVersionId);

  useEffect(() => {
    if (initialDocument) {
      setActiveVersionId(initialDocument.currentVersionId);
    }
  }, [initialDocument]);

  const fetchHistory = useCallback(async () => {
    if (!initialDocument?.id) return;
    setHistoryLoading(true);
    try {
      const historyData = await documentService.getDocumentHistory(initialDocument.id);
      const updated = historyData.map((v) => ({
        ...v,
        isActive: v.id === activeVersionId,
      }));
      setVersions(updated);
    } catch (err) {
      console.error("❌ Failed to fetch history:", err);
      toast.error(err.message || "Gagal memuat riwayat dokumen.");
    } finally {
      setHistoryLoading(false);
    }
  }, [initialDocument, activeVersionId]);

  useEffect(() => {
    if (mode === "update" && initialDocument) {
      fetchHistory();
    } else {
      setFile(null);
      setVersions([]);
      setHistoryLoading(false);
    }
  }, [mode, initialDocument, fetchHistory]);

  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode !== "create" || !file) {
      if (!file) setError("File wajib diunggah.");
      return;
    }
    const toastId = toast.loading("Mengunggah dokumen...");
    setIsLoading(true);
    try {
      await documentService.createDocument(file);
      toast.success("Dokumen berhasil diunggah!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
      toast.error(err.message || "Terjadi kesalahan.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseVersion = async (versionId) => {
    const toastId = toast.loading("Mengganti versi aktif...");
    try {
      const updatedDoc = await documentService.useOldVersion(initialDocument.id, versionId);
      toast.success("Versi berhasil diganti!", { id: toastId });
      setActiveVersionId(updatedDoc.currentVersionId);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDownloadVersion = async (version) => {
    const toastId = toast.loading("Mempersiapkan unduhan...");
    try {
      const signedUrl = await documentService.getDocumentVersionFileUrl(initialDocument.id, version.id);
      let filename = `version-${version.versionNumber || version.id}.pdf`;
      try {
        const urlObj = new URL(signedUrl);
        const filenameParam = urlObj.searchParams.get("download");
        if (filenameParam) filename = filenameParam;
      } catch (_) {}

      const link = window.document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Unduhan dimulai!", { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm("Hapus versi ini?")) return;
    const toastId = toast.loading("Menghapus versi...");
    try {
      await documentService.deleteVersion(initialDocument.id, versionId);
      toast.success("Versi dihapus!", { id: toastId });
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handlePreviewClick = async (version) => {
    if (!onViewRequest) return;
    const toastId = toast.loading("Mempersiapkan pratinjau...");
    try {
      const signedUrl = await documentService.getDocumentVersionFileUrl(initialDocument.id, version.id);
      onViewRequest(signedUrl);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const getVersionStatus = (version, index, totalVersions) => {
    const isFirstVersion = index === totalVersions - 1;
    const isPackageSigned = version.packages?.length > 0;
    const isManualSigned = version.signaturesPersonal?.length > 0;
    const hasGroupSignatures = version.signaturesGroup?.length > 0;
    const hasSignedHash = !!version.signedFileHash;
    const isSigned = isManualSigned || isPackageSigned || hasGroupSignatures || hasSignedHash;

    return {
      showSignedBadge: isSigned && !isFirstVersion,
      isSigned,
    };
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9990] p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] border border-slate-200 dark:border-slate-700 flex flex-col relative overflow-hidden transition-all duration-300 transform scale-100">
        
        {/* --- HEADER --- */}
        <header className="px-5 py-4 flex justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate">
              {mode === "create" ? "Upload Dokumen" : "Riwayat Versi"}
            </h2>
            {/* Responsif Truncate untuk Judul Panjang */}
            {mode === "update" && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate w-full" title={initialDocument?.title}>
                {initialDocument?.title || "Dokumen"}.pdf
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 -mr-2">
            {/* 🔥 BUTTON INFO FITUR */}
            <button 
              onClick={() => setShowInfo(true)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-full transition-colors"
              title="Info Fitur"
            >
              <FaInfoCircle className="w-5 h-5" />
            </button>

            {/* BUTTON CLOSE */}
            <button 
              onClick={onClose} 
              className="p-2 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
              title="Tutup"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* --- CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          
          {mode === "create" && (
            <div className="flex flex-col items-center justify-center py-4">
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="w-full">
                  <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Pilih File PDF
                  </label>

                  <div
                    className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                    ${file 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" 
                      : "border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}
                  >
                    <input type="file" onChange={handleFileChange} accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isLoading} />
                    <div className="flex flex-col items-center pointer-events-none">
                      <div className={`p-4 rounded-full mb-3 transition-colors ${file ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50'}`}>
                         {file ? <FaFileAlt className="text-2xl" /> : <FaCloudUploadAlt className="text-3xl" />}
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[250px]">
                        {file ? file.name : "Klik untuk jelajah file"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Maksimal 10MB (PDF)</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 border border-red-100 dark:border-red-800 rounded-xl text-sm text-center font-medium animate-pulse">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : <><FaCloudUploadAlt /> Unggah Sekarang</>}
                </button>
              </form>
            </div>
          )}

          {mode === "update" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FaHistory /> Timeline
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                  {versions.length} Versi
                </span>
              </div>

              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <FaSpinner className="animate-spin text-2xl" />
                  <span className="text-xs">Memuat data...</span>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-slate-500 text-sm">Tidak ada riwayat versi.</p>
                </div>
              ) : (
                <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                  {versions.map((version, index) => {
                    const versionNumber = versions.length - index;
                    const { showSignedBadge } = getVersionStatus(version, index, versions.length);

                    return (
                      <li
                        key={version.id}
                        className={`relative z-10 group flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 
                          ${version.isActive
                            ? "bg-blue-50/80 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md"
                          }`}
                      >
                        {/* KIRI: Info Versi */}
                        <div className="flex items-start gap-4 min-w-0 w-full sm:w-auto">
                          <div className={`p-2.5 rounded-lg flex-shrink-0 mt-1 sm:mt-0
                            ${version.isActive ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                            <FaFileAlt className="text-lg" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 dark:text-white text-sm">
                                Versi {versionNumber}
                              </span>
                              {version.isActive && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/10 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-900">
                                  AKTIF
                                </span>
                              )}
                              {showSignedBadge && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                  <FaCheckCircle className="text-[10px]" /> SIGNED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {new Date(version.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </div>
                        </div>

                        {/* KANAN: Action Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 sm:w-auto w-full">
                          <div className="flex gap-2 w-full sm:w-auto">
                             <button onClick={() => handlePreviewClick(version)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Lihat">
                                <FaEye /> <span className="sm:hidden">Lihat</span>
                             </button>
                             <button onClick={() => handleDownloadVersion(version)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Unduh">
                                <FaDownload /> <span className="sm:hidden">Unduh</span>
                             </button>
                          </div>

                          {!version.isActive && (
                            <div className="flex gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                              <button onClick={() => handleUseVersion(version.id)} className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Rollback">
                                <FaUndo />
                              </button>
                              
                              {index !== versions.length - 1 && (
                                <button onClick={() => handleDeleteVersion(version.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Hapus">
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 🔥 Render Feature Modal jika showInfo true */}
      <FeatureModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DocumentManagementModal;