/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom"; // [1] Import useNavigate
import { documentService } from "../../services/documentService.js";
import { useCanPerformAction } from "../../hooks/useCanPerformAction";
import { SoftLockError } from "../ui/SoftLockError";
import toast from "react-hot-toast";
import { FaSpinner, FaFileAlt, FaDownload, FaTrash, FaEye, FaCheckCircle, FaUndo, FaTimes, FaCloudUploadAlt, FaHistory, FaInfoCircle, FaBolt, FaWhatsapp, FaFileSignature, FaStar } from "react-icons/fa";

// Daftar pilihan tipe dokumen untuk Dropdown
const DOCUMENT_TYPES = [
  "General",
  "Surat Pernyataan",
  "Perjanjian Kerjasama",
  "Kontrak Kerja",
  "Non-Disclosure Agreement (NDA)",
  "Surat Keputusan (SK)",
  "Surat Kuasa",
  "Invoice / Tagihan",
  "Laporan Keuangan",
  "Transkrip Nilai",
  "Sertifikat",
  "Lainnya",
];

// --- 1. SUB-KOMPONEN: FEATURE INFO MODAL ---
const FeatureModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100 transition-all border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBolt className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Fitur Canggih</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Dokumen ini dilengkapi dengan fitur pelacakan versi, notifikasi WhatsApp otomatis, dan audit trail lengkap.</p>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <FaWhatsapp className="text-green-500 text-lg" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifikasi WA</p>
                <p className="text-[10px] text-slate-500">Otomatis kirim pesan saat ada update.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <FaFileSignature className="text-purple-500 text-lg" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Tanda Tangan Digital</p>
                <p className="text-[10px] text-slate-500">Legal dan terverifikasi QR Code.</p>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- 2. KOMPONEN UTAMA ---
const DocumentManagementModal = ({ mode = "view", initialDocument = null, currentUser, onClose, onSuccess, onViewRequest, initialTab = null }) => {
  const navigate = useNavigate(); // [2] Init Navigate

  // State - Gunakan initialTab jika ada, jika tidak fallback ke logic default
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab) return initialTab;
    return mode === "create" ? "upload" : "info";
  });
  const [documentTitle, setDocumentTitle] = useState(initialDocument?.title || "");
  const [selectedType, setSelectedType] = useState(initialDocument?.type || "General");
  const [file, setFile] = useState(null);

  // State Loading & Data
  const [isUploading, setIsUploading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // State Modal Info
  const [showInfo, setShowInfo] = useState(false);
  const [softLockError, setSoftLockError] = useState(null);

  // --- [LOGIC PREMIUM] ---
  const isPremium = currentUser?.userStatus === "PREMIUM";
  const MAX_VERSIONS = isPremium ? 20 : 5;
  const currentVersionCount = versions.length;
  const isLimitReached = currentVersionCount >= MAX_VERSIONS;

  // --- [HAK AKSES ROLLBACK/DELETE VERSION] ---
  // User bisa rollback/delete version HANYA jika:
  // 1. Dokumen Personal: User adalah pemilik dokumen (userId === currentUser.id)
  // 2. Dokumen Grup: User adalah admin_group ATAU pemilik dokumen (uploader)
  const canManageVersions = useMemo(() => {
    if (!initialDocument || !currentUser?.id) return false;

    const currentUserId = String(currentUser.id);
    const documentOwnerId = String(initialDocument.userId || "");

    // Cek apakah dokumen personal atau grup
    if (initialDocument.groupId || initialDocument.group) {
      // Dokumen Grup
      const isDocumentOwner = documentOwnerId === currentUserId;

      // Cek apakah user adalah admin grup
      const groupMembers = initialDocument.group?.members || [];
      const isGroupAdmin = groupMembers.some((m) => String(m.userId) === currentUserId && m.role === "admin_group");

      return isDocumentOwner || isGroupAdmin;
    } else {
      // Dokumen Personal - hanya pemilik yang bisa manage
      return documentOwnerId === currentUserId;
    }
  }, [initialDocument, currentUser]);

  // --- [SOFT LOCK CHECK] ---
  const { canPerform: canCreateVersion, reason: createVersionReason } = useCanPerformAction("create_version", currentVersionCount);
  // Fetch History saat tab "history" aktif
  useEffect(() => {
    if (activeTab === "history" && initialDocument?.id) {
      setIsLoadingHistory(true);
      documentService
        .getDocumentHistory(initialDocument.id)
        .then((data) => {
          const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
          setVersions(sorted);
        })
        .catch(() => toast.error("Gagal memuat riwayat."))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [activeTab, initialDocument]);

  // --- HANDLERS ---

  // [3] Handler Navigasi ke Pricing
  const handleUpgradeClick = () => {
    onClose(); // Tutup modal dulu
    navigate("/dashboard/pricing"); // Pindah ke halaman pricing
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      if (!documentTitle) setDocumentTitle(droppedFile.name.replace(".pdf", ""));
    } else {
      toast.error("Hanya file PDF yang diizinkan.");
    }
  };

  const handleUpload = async () => {
    if (!file || !documentTitle) return toast.error("Lengkapi data dokumen.");

    setIsUploading(true);
    try {
      await documentService.createDocument(file, selectedType);
      toast.success("Dokumen berhasil diunggah!");
      onSuccess();
      onClose();
    } catch (err) {
      // Error handling service
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!documentTitle) return toast.error("Judul tidak boleh kosong.");

    const toastId = toast.loading("Menyimpan perubahan...");
    try {
      await documentService.updateDocument(initialDocument.id, { title: documentTitle, type: selectedType });
      toast.success("Info dokumen diperbarui.", { id: toastId });
      onSuccess();
    } catch (err) {
      toast.dismiss(toastId);
    }
  };

  const handleUseVersion = async (versionId) => {
    // [SOFT LOCK CHECK]
    if (!canCreateVersion) {
      setSoftLockError({
        message: createVersionReason,
        actionType: "create_version",
      });
      return;
    }

    const toastId = toast.loading("Mengembalikan versi...");
    try {
      await documentService.useOldVersion(initialDocument.id, versionId);
      toast.success("Versi berhasil dipulihkan!", { id: toastId });

      onSuccess();

      const updatedHistory = await documentService.getDocumentHistory(initialDocument.id);
      const sorted = Array.isArray(updatedHistory) ? updatedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setVersions(sorted);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal restore versi.", { id: toastId });
    }
  };

  const handleDeleteVersion = async (versionId) => {
    if (!window.confirm("Hapus versi ini permanen? Tindakan ini tidak dapat dibatalkan.")) return;

    const toastId = toast.loading("Menghapus...");
    try {
      await documentService.deleteVersion(initialDocument.id, versionId);
      toast.success("Versi dihapus.", { id: toastId });
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
    } catch (err) {
      toast.dismiss(toastId);
    }
  };

  const handleDownload = async () => {
    const toastId = toast.loading("Menyiapkan unduhan...");
    try {
      await documentService.downloadDocument(initialDocument.id);
      toast.dismiss(toastId);
    } catch (e) {
      toast.error("Gagal mengunduh.", { id: toastId });
    }
  };

  const getVersionStatus = (version) => {
    if (version.signedFileHash) return { label: "FINAL (SIGNED)", color: "text-green-600 bg-green-50 border-green-200" };
    if (initialDocument?.currentVersionId === version.id) return { label: "AKTIF", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { label: "ARSIP", color: "text-slate-500 bg-slate-50 border-slate-200" };
  };

  // --- RENDER CONTENT ---
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {mode === "create" ? (
              <>
                <FaCloudUploadAlt className="text-blue-500" /> Upload Dokumen Baru
              </>
            ) : activeTab === "history" ? (
              <>
                <FaHistory className="text-blue-500" /> Riwayat Versi
              </>
            ) : (
              <>
                <FaFileAlt className="text-blue-500" /> Kelola Dokumen
              </>
            )}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <FaTimes />
          </button>
        </div>

        {/* TABS (Only for View Mode) */}
        {mode === "view" && (
          <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 gap-6 bg-white dark:bg-slate-900">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "info" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaInfoCircle /> Informasi
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "history" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaHistory /> Riwayat Versi
              </div>
            </button>
          </div>
        )}

        {/* MAIN BODY */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-900">
          {/* --- MODE UPLOAD --- */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  file ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
              >
                {file ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <FaFileAlt className="text-4xl text-blue-500 mb-3" />
                    <p className="font-semibold text-slate-800 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={() => setFile(null)} className="mt-4 text-xs text-red-500 hover:underline">
                      Ganti File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <FaCloudUploadAlt className="text-3xl text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag & drop file PDF di sini</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">atau</p>
                    <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                      Pilih File
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setFile(e.target.files[0]);
                            setDocumentTitle(e.target.files[0].name.replace(".pdf", ""));
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Judul Dokumen</label>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Contoh: Kontrak Kerja 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipe Dokumen</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaCheckCircle /> Upload Dokumen
                  </>
                )}
              </button>
            </div>
          )}

          {/* --- MODE VIEW: INFO --- */}
          {activeTab === "info" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-4 items-start">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <FaFileAlt className="text-2xl text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">{initialDocument?.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Dibuat pada: {new Date(initialDocument?.createdAt).toLocaleDateString("id-ID", { dateStyle: "full" })}</p>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowInfo(true)} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                      <FaBolt /> Lihat Fitur Dokumen
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ubah Judul</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={handleUpdateInfo} className="px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors">
                      Simpan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Aksi Cepat</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownload}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FaDownload /> Download PDF
                    </button>
                    <button
                      onClick={() => onViewRequest && onViewRequest(null)}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FaEye /> Lihat Dokumen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- MODE VIEW: HISTORY --- */}
          {activeTab === "history" && (
            <div className="animate-fade-in">
              {/* --- [4] UI PREMIUM ALERT BAR --- */}
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className={!canCreateVersion ? "text-red-500" : "text-slate-600 dark:text-slate-300"}>{!canCreateVersion ? "Batas Versi Tercapai" : "Penggunaan Slot Versi"}</span>
                  <span className="text-slate-500">
                    {currentVersionCount} / {MAX_VERSIONS}
                  </span>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${!canCreateVersion ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${Math.min((currentVersionCount / MAX_VERSIONS) * 100, 100)}%` }} />
                </div>

                {/* TOMBOL UPGRADE MUNCUL DI SINI */}
                {!isPremium && !canCreateVersion && canManageVersions && (
                  <div className="mt-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <FaStar className="text-amber-500 animate-pulse text-sm" />
                      <span>Kuota versi habis (Max 5). Restore versi terbuka untuk Premium.</span>
                    </div>
                    <button onClick={handleUpgradeClick} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap">
                      Upgrade Pro
                    </button>
                  </div>
                )}

                {/* INFO UNTUK SIGNER TANPA AKSES ROLLBACK */}
                {!canManageVersions && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <FaInfoCircle className="text-slate-400 text-sm flex-shrink-0" />
                      <span>Anda hanya dapat melihat riwayat versi. Rollback dan hapus versi hanya tersedia untuk pemilik dokumen atau admin grup.</span>
                    </div>
                  </div>
                )}
              </div>

              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FaSpinner className="animate-spin text-2xl mb-2" />
                  <p className="text-xs">Memuat riwayat...</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Belum ada riwayat versi.</p>
                </div>
              ) : (
                <ul className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {versions.map((version, index) => {
                    const status = getVersionStatus(version);
                    const isCurrent = initialDocument?.currentVersionId === version.id;

                    return (
                      <li key={version.id} className="relative pl-10 group">
                        {/* Dot Indicator */}
                        <div
                          className={`absolute left-[13px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 transition-all ${
                            isCurrent ? "bg-blue-500 scale-125 ring-4 ring-blue-100 dark:ring-blue-900/30" : "bg-slate-400"
                          }`}
                        />

                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Versi {versions.length - index}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${status.color}`}>{status.label}</span>
                              </div>
                              <p className="text-xs text-slate-400">{new Date(version.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p>
                            </div>

                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onViewRequest && onViewRequest(version.url)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Lihat Versi Ini"
                              >
                                <FaEye />
                              </button>

                              {/* Tombol Rollback - HANYA untuk pemilik dokumen atau admin grup */}
                              {!isCurrent && canManageVersions && (
                                <button
                                  onClick={() => handleUseVersion(version.id)}
                                  disabled={!canCreateVersion}
                                  className={`p-2 rounded-lg transition-colors ${!canCreateVersion ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"}`}
                                  title={!canCreateVersion ? "Soft lock: upgrade untuk restore" : "Pulihkan Versi Ini"}
                                >
                                  <FaUndo />
                                </button>
                              )}

                              {/* Tombol Delete Version - HANYA untuk pemilik dokumen atau admin grup */}
                              {!isCurrent && canManageVersions && (
                                <button onClick={() => handleDeleteVersion(version.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Versi Permanen">
                                  <FaTrash />
                                </button>
                              )}
                            </div>
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
      <FeatureModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      <SoftLockError isOpen={!!softLockError} onClose={() => setSoftLockError(null)} errorMessage={softLockError?.message} actionType={softLockError?.actionType} feature="versions" />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DocumentManagementModal;
