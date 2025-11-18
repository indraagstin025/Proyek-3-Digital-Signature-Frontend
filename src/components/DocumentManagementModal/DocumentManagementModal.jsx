/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { documentService } from "../../services/documentService.js";
import toast from "react-hot-toast";
import { FaSpinner, FaFileAlt, FaDownload, FaTrash, FaEye, FaCheckCircle, FaClock, FaUndo } from "react-icons/fa";

const DocumentManagementModal = ({ mode, initialDocument, onClose, onSuccess, onViewRequest }) => {
  console.log("📄 RENDER DocumentManagementModal:", { mode, initialDocument });

  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState([]);
  const [isHistoryLoading, setHistoryLoading] = useState(true);

  /**
   * 🔹 Fetch document version history when in "update" mode
   */
  useEffect(() => {
    const fetchHistory = async () => {
      if (!initialDocument) {
        console.log("⏭️ Skipping fetchHistory: no document data.");
        return;
      }

      setHistoryLoading(true);
      console.log("🔍 Fetching history for document ID:", initialDocument.id);

      try {
        const historyData = await documentService.getDocumentHistory(initialDocument.id);
        console.log("✅ History fetched:", historyData);

        const updated = historyData.map((v) => ({
          ...v,
          isActive: v.id === initialDocument.currentVersionId,
        }));
        setVersions(updated);
      } catch (err) {
        console.error("❌ Failed to fetch history:", err);
        toast.error(err.message || "Gagal memuat riwayat dokumen.");
      } finally {
        setHistoryLoading(false);
      }
    };

    if (mode === "update" && initialDocument) {
      fetchHistory();
    } else {
      setFile(null);
      setVersions([]);
      setHistoryLoading(false);
    }
  }, [initialDocument, mode]);

  /**
   * 🔹 File input handler
   */
  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  /**
   * 🔹 Handle document upload (create)
   */
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
      const errorMessage = err.message || "Terjadi kesalahan.";
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔹 Set an old version as the active version
   */
  const handleUseVersion = async (versionId) => {
    const toastId = toast.loading("Mengganti versi aktif...");
    try {
      await documentService.useOldVersion(initialDocument.id, versionId);
      toast.success("Versi berhasil diganti!", { id: toastId });

      setVersions((prev) => prev.map((v) => ({ ...v, isActive: v.id === versionId })));
      onSuccess();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  /**
   * 🔹 Download a specific document version
   */
  const handleDownloadVersion = async (version) => {
    const toastId = toast.loading("Mempersiapkan unduhan...");
    try {
      const signedUrl = await documentService.getDocumentVersionFileUrl(initialDocument.id, version.id);

      // Dapatkan nama file dari parameter URL ?download=...
      let filename = `version-${version.versionNumber || version.id}.pdf`;
      try {
        const urlObj = new URL(signedUrl);
        const filenameParam = urlObj.searchParams.get("download");
        if (filenameParam) filename = filenameParam;
      } catch (_) {
        // Abaikan kesalahan parsing URL
      }

      // Buat elemen link download
      const link = window.document.createElement("a");
      link.href = signedUrl;
      link.setAttribute("download", filename);
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Unduhan dimulai!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Gagal mengunduh versi dokumen.", {
        id: toastId,
      });
    }
  };

  /**
   * 🔹 Delete a specific version
   */
  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus versi ini?")) return;

    const toastId = toast.loading("Menghapus versi...");
    try {
      await documentService.deleteVersion(initialDocument.id, versionId);
      toast.success("Versi berhasil dihapus!", { id: toastId });
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      onSuccess();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  /**
   * 🔹 Preview a version
   */
  const handlePreviewClick = async (version) => {
    if (!onViewRequest) {
      console.error("❗ onViewRequest prop is missing.");
      return;
    }

    const toastId = toast.loading("Mempersiapkan pratinjau...");
    try {
      const signedUrl = await documentService.getDocumentVersionFileUrl(initialDocument.id, version.id);
      onViewRequest(signedUrl);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error(error.message || "Gagal memuat pratinjau.", { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl h-full max-h-[90vh] border border-slate-200/80 dark:border-slate-700/50 flex flex-col relative">
        <header className="p-4 px-6 flex justify-between items-center border-b dark:border-slate-700 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{mode === "create" ? "Unggah Dokumen Baru" : `Kelola Dokumen`}</h2>
            {mode === "update" && <p className="text-sm text-slate-500 dark:text-slate-400 truncate pr-10">{initialDocument?.title}</p>}
          </div>
        </header>

        <button
          onClick={onClose}
          className="absolute top-4 right-6 z-10 px-3 py-1.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
        >
          Tutup
        </button>

        <main className="p-4 px-6 flex-1 overflow-y-auto">
          {mode === "create" && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto pt-10">
              <div>
                <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pilih File Dokumen (.pdf)
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
                disabled={isLoading || !file}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-teal-400 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <FaSpinner className="animate-spin" />}
                {isLoading ? "Mengunggah..." : "Unggah Dokumen"}
              </button>
            </form>
          )}

          {mode === "update" && (
            <div className="w-full">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Riwayat Versi</h3>
              {isHistoryLoading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
              ) : (
                <ul className="space-y-3">
                  {versions.map((version, index) => {
                    // 1. Identifikasi Versi
                    const isLatestVersion = index === 0; // Versi paling atas (Terbaru/V2)
                    const isFirstVersion = index === versions.length - 1; // Versi paling bawah (V1/Asli)

                    // 2. Cek Data Real dari Database (Personal / Paket)
                    const hasPersonalSig = version.signaturesPersonal && version.signaturesPersonal.length > 0;
                    const hasPackageSig = version.packages && version.packages.some((pkg) => pkg.signatures && pkg.signatures.length > 0);
                    const hasRealSignatureData = hasPersonalSig || hasPackageSig;

                    // 3. Cek Status Dokumen Induk
                    // Apakah dokumen utama sudah selesai? (Status dari database Dashboard)
                    const isDocumentCompleted = initialDocument?.status === "completed";

                    // 4. LOGIKA FINAL (KOMBINASI)
                    // Tampilkan badge "Ditandatangani" JIKA:
                    // A. Ada data tanda tangan asli di versi ini (hasRealSignatureData)
                    //    ATAU
                    // B. Dokumen statusnya "Completed" DAN ini adalah versi terbaru (isLatestVersion)
                    //    (Ini menangani kasus Paket dimana data signature tertinggal di V1)
                    //
                    // DAN SYARAT MUTLAK: BUKAN Versi 1 (!isFirstVersion)
                    const showSignedBadge = (hasRealSignatureData || (isDocumentCompleted && isLatestVersion)) && !isFirstVersion;

                    // Label Versi
                    const versionNumber = versions.length - index;

                    return (
                      <li key={version.id} className={`p-3 rounded-lg flex items-center justify-between transition-colors ${version.isActive ? "bg-blue-100 dark:bg-blue-900/50" : "bg-slate-50 dark:bg-slate-700/50"}`}>
                        <div className="flex items-center space-x-4 min-w-0">
                          <FaFileAlt className="text-slate-500 text-xl flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
                              <span className="truncate">Versi {versionNumber}</span>

                              {/* Badge AKTIF */}
                              {version.isActive && <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">Aktif</span>}

                              {/* Badge DITANDATANGANI (Sesuai Logika Final di atas) */}
                              {showSignedBadge && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded-full flex-shrink-0">
                                  <FaCheckCircle /> Ditandatangani
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                              <FaClock className="mr-1.5" />
                              {new Date(version.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </div>
                        </div>

                        {/* Tombol Aksi (Biarkan tetap sama seperti kode Anda) */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => handlePreviewClick(version)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            {" "}
                            <FaEye />{" "}
                          </button>
                          <button
                            onClick={() => handleDownloadVersion(version)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            {" "}
                            <FaDownload />{" "}
                          </button>

                          {/* Tombol Rollback & Hapus hanya muncul jika BUKAN versi aktif */}
                          {!version.isActive && (
                            <>
                              <button
                                onClick={() => handleUseVersion(version.id)}
                                className="p-2 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              >
                                {" "}
                                <FaUndo />{" "}
                              </button>

                              {/* Tombol Hapus disembunyikan untuk Versi 1 */}
                              {!isFirstVersion && (
                                <button
                                  onClick={() => handleDeleteVersion(version.id)}
                                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                  {" "}
                                  <FaTrash />{" "}
                                </button>
                              )}
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
        </main>
      </div>
    </div>
  );
};

export default DocumentManagementModal;
