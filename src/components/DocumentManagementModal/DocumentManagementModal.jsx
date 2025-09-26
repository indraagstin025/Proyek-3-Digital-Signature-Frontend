import React, { useState, useEffect } from "react";
import { documentService } from "../../services/documentService.js";
import toast from "react-hot-toast";
import { FaClock, FaUndo, FaTrash, FaSpinner, FaDownload, FaFileAlt, FaEye, FaCheckCircle } from "react-icons/fa";

const DocumentManagementModal = ({ mode, document, onClose, onSuccess, onViewRequest }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState([]);
  const [isHistoryLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!document) return;
      setHistoryLoading(true);
      try {
        const historyData = await documentService.getDocumentHistory(document.id);
        setVersions(historyData);
      } catch (err) {
        toast.error(err.message || "Gagal memuat riwayat.");
      } finally {
        setHistoryLoading(false);
      }
    };

    if (mode === "update" && document) {
      setTitle(document.title);
      fetchHistory();
    } else {
      setTitle("");
      setFile(null);
      setVersions([]);
    }
  }, [document, mode]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      return setError("Judul dokumen wajib diisi.");
    }
    if (mode === "create" && !file) {
      return setError("File wajib diunggah untuk dokumen baru.");
    }
    setIsLoading(true);
    try {
      if (mode === "create") {
        await documentService.createDocument(title, file);
        toast.success("Dokumen berhasil dibuat!");
      } else {
        await documentService.updateDocument(document.id, { title }, file);
        toast.success("Dokumen berhasil diperbarui!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.message || "Terjadi kesalahan.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseVersion = async (versionId) => {
    const toastId = toast.loading("Mengganti versi aktif...");
    try {
      await documentService.useOldVersion(document.id, versionId);
      toast.success("Versi berhasil diganti!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus versi ini secara permanen?")) return;
    const toastId = toast.loading("Menghapus versi...");
    try {
      if (versionId === document.currentVersionId) {
        toast.error("Tidak dapat menghapus versi yang sedang aktif.", { id: toastId });
        return;
      }
      await documentService.deleteVersion(document.id, versionId);
      toast.success("Versi berhasil dihapus!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handlePreviewClick = (version) => {
    onViewRequest(version.url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl border border-slate-200/80 dark:border-slate-700/50 flex flex-col">
        <div className="p-6 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{mode === "create" ? "Unggah Dokumen Baru" : `Kelola Dokumen`}</h2>
          {mode === "update" && <p className="text-sm text-slate-500 dark:text-slate-400">{document?.title}</p>}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Judul Dokumen
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {mode === "create" ? "Pilih File" : "Unggah Versi Baru (Opsional)"}
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf"
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60"
                disabled={isLoading}
              />
              {file && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">File terpilih: {file.name}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-teal-400 rounded-full hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : mode === "create" ? "Unggah Dokumen" : "Simpan Perubahan"}
            </button>
          </form>

          {mode === "update" && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-t dark:border-slate-700 pt-6">Riwayat Versi</h3>
              {isHistoryLoading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {versions.map((version, index) => {
                    const isActive = version.id === document.currentVersionId;
                    const isSigned = version.signaturesPersonal && version.signaturesPersonal.length > 0;
                    const isCompleted = document.status === "completed";

                    return (
                      <li key={version.id} className={`p-3 rounded-lg flex items-center justify-between transition-colors ${isActive ? "bg-blue-100 dark:bg-blue-900/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                        <div className="flex items-center space-x-4">
                          <FaFileAlt className="text-slate-500 text-xl" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
                              <span>Versi {versions.length - index}</span>
                              {isActive && <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full">Aktif</span>}
                              {isSigned && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  <FaCheckCircle />
                                  Ditandatangani
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                              <FaClock className="mr-1.5" />
                              {new Date(version.createdAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handlePreviewClick(version)}
                            className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            title={isCompleted ? "Lihat Hasil TTD" : "Lihat Versi Ini"}
                          >
                            <FaEye />
                          </button>
                          <a
                            href={version.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            title={`Unduh Versi ${versions.length - index}`}
                          >
                            <FaDownload />
                          </a>
                          {!isActive && (
                            <>
                              <button
                                onClick={() => handleUseVersion(version.id)}
                                className="p-2 text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Gunakan Versi Ini"
                              >
                                <FaUndo />
                              </button>
                              <button
                                onClick={() => handleDeleteVersion(version.id)}
                                className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Hapus Versi Ini"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementModal;
