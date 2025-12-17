/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { documentService } from "../../services/documentService.js";
import toast from "react-hot-toast";
import { FaSpinner, FaFileAlt, FaDownload, FaTrash, FaEye, FaCheckCircle, FaUndo, FaTimes } from "react-icons/fa";

const DocumentManagementModal = ({ mode, initialDocument, onClose, onSuccess, onViewRequest }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState([]);
  const [isHistoryLoading, setHistoryLoading] = useState(true);

  // State lokal untuk melacak versi aktif secara real-time
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
    const isSigned = (isManualSigned || isPackageSigned || hasGroupSignatures || hasSignedHash);

    return { 
        showSignedBadge: isSigned && !isFirstVersion, 
        isSigned 
    };
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9990] p-4 animate-fadeIn">
      {/* ✅ UPDATE DARK MODE: 
         - bg-white dark:bg-slate-800 (Background adaptif)
         - text-slate-800 dark:text-slate-200 (Teks adaptif)
         - border-slate-200 dark:border-slate-700 (Border adaptif)
      */}
      <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[85vh] border border-slate-200 dark:border-slate-700 flex flex-col relative overflow-hidden transition-colors duration-300">
        
        {/* HEADER */}
        {/* ✅ Header adaptif: Light (slate-50) / Dark (slate-800) */}
        <header className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {mode === "create" ? "Unggah Dokumen Baru" : "Kelola Versi Dokumen"}
            </h2>
            {mode === "update" && <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">{initialDocument?.title}.pdf</p>}
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 rounded-full transition-colors" 
            title="Tutup"
          >
            <FaTimes />
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {mode === "create" && (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="w-full">
                  <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih File Dokumen (.pdf)</label>
                  
                  {/* ✅ Input File Area Adaptif */}
                  <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors 
                    ${file 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" 
                        : "border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}>
                    <input type="file" onChange={handleFileChange} accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isLoading} />
                    <div className="flex flex-col items-center pointer-events-none">
                      <FaFileAlt className={`text-4xl mb-3 ${file ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{file ? file.name : "Klik atau seret file ke sini"}</p>
                    </div>
                  </div>
                </div>

                {error && <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-lg text-sm text-center">{error}</div>}

                <button type="submit" disabled={isLoading || !file} className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30">
                  {isLoading ? <FaSpinner className="animate-spin mx-auto" /> : "Unggah Dokumen"}
                </button>
              </form>
            </div>
          )}

          {mode === "update" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">Riwayat Versi</h3>
                <span className="text-xs font-medium px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Total: {versions.length} Versi</span>
              </div>

              {isHistoryLoading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin text-3xl text-blue-600 dark:text-blue-500" />
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">Belum ada riwayat versi.</div>
              ) : (
                <ul className="space-y-3">
                  {versions.map((version, index) => {
                    const versionNumber = versions.length - index; 
                    const { showSignedBadge } = getVersionStatus(version, index, versions.length);

                    return (
                      <li
                        key={version.id}
                        // ✅ List Item Adaptif: Putih vs Abu Gelap
                        className={`group relative p-4 rounded-xl border transition-all duration-200 
                          ${version.isActive 
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 dark:border-blue-700/50" 
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500 shadow-sm"}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Icon Box */}
                            <div className={`p-3 rounded-lg flex-shrink-0 
                                ${version.isActive 
                                    ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" 
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                }`}>
                              <FaFileAlt className="text-xl" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-800 dark:text-white text-base">Versi {versionNumber}</span>
                                
                                {version.isActive && (
                                  <span className="text-[10px] font-bold text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-500/20 px-2 py-0.5 rounded-full animate-pulse border border-green-200 dark:border-transparent">
                                    AKTIF
                                  </span>
                                )}
                                
                                {showSignedBadge && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-200 dark:border-transparent">
                                    <FaCheckCircle className="text-xs" /> SIGNED
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Dibuat: {new Date(version.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button onClick={() => handlePreviewClick(version)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Lihat">
                              <FaEye size={18} />
                            </button>
                            <button onClick={() => handleDownloadVersion(version)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Unduh">
                              <FaDownload size={18} />
                            </button>

                            {!version.isActive && (
                              <>
                                <button onClick={() => handleUseVersion(version.id)} className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" title="Gunakan Versi Ini (Rollback)">
                                  <FaUndo size={16} />
                                </button>
                                
                                {index !== versions.length - 1 && (
                                  <button onClick={() => handleDeleteVersion(version.id)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Hapus Versi">
                                    <FaTrash size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
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
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DocumentManagementModal;