import React, { useState } from "react";
import toast from "react-hot-toast";
import { signatureService } from "../../services/signatureService.js";

import SignatureModal from "../SignatureModal/SignatureModal.jsx";

import { FaSpinner, FaTimes, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

/**
 * @typedef {'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'} PositionPreset
 */

/**
 * Helper untuk menerjemahkan preset string ke data posisi (persentase)
 * @param {PositionPreset} preset
 * @returns {{ positionX: number, positionY: number, width: number, height: number }}
 */
const getPositionPayload = (preset) => {
  const W = 0.25;
  const H = 0.15;
  const M = 0.04;

  switch (preset) {
    case "bottom-left":
      return { positionX: M, positionY: 1 - H - M, width: W, height: H };
    case "top-right":
      return { positionX: 1 - W - M, positionY: M, width: W, height: H };
    case "top-left":
      return { positionX: M, positionY: M, width: W, height: H };
    case "center":
      return { positionX: (1 - W) / 2, positionY: (1 - H) / 2, width: W, height: H };
    case "bottom-right":
    default:
      return { positionX: 1 - W - M, positionY: 1 - H - M, width: W, height: H };
  }
};

/**
 * Modal untuk mengorkestrasi alur batch signing
 * 1. Panggil SignatureModal
 * 2. Tampilkan Form Posisi
 * 3. Kirim ke API
 */
const BatchSignModal = ({ documentIds, onClose, onSuccess }) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(true);
  const [signatureImageUrl, setSignatureImageUrl] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [positionPreset, setPositionPreset] = useState("bottom-right");
  const [includeQrCode, setIncludeQrCode] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * LANGKAH 1: Handler saat `SignatureModal` (child) ditutup
   */
  const handleSignatureCancel = () => {
    onClose();
  };

  /**
   * LANGKAH 1: Handler saat `SignatureModal` (child) sukses
   */
  const handleSignatureSave = (imageUrl) => {
    setSignatureImageUrl(imageUrl);
    setIsSignatureModalOpen(false);
  };

  /**
   * LANGKAH 2: Handler saat form posisi di-submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signatureImageUrl || documentIds.length === 0) {
      setError("Data tidak lengkap untuk memulai batch signing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const signaturePayload = {
      method: "canvas",
      signatureImageUrl: signatureImageUrl,
      pageNumber: parseInt(pageNumber, 10) || 1,
      ...getPositionPayload(positionPreset),
      displayQrCode: includeQrCode,
    };

    const toastId = toast.loading(`Memproses ${documentIds.length} dokumen...`);

    try {
      const response = await signatureService.addBatchPersonalSignatures(documentIds, signaturePayload);

      const results = response.data;

      if (results.finalStatus === "COMPLETED") {
        toast.success(`Sukses! ${results.success.length} dokumen telah ditandatangani.`, { id: toastId });
        onSuccess(`Sukses menandatangani ${results.success.length} dokumen.`);
      } else {
        toast.custom(
          (t) => (
            <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <FaExclamationTriangle className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">Proses Selesai (Sebagian Gagal)</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {results.success.length} sukses, {results.failed.length} gagal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
          { id: toastId, duration: 6000 }
        );
        onSuccess("Proses batch selesai dengan beberapa kegagalan.");
      }
    } catch (err) {
      const message = err.message || "Terjadi kesalahan server.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignatureModalOpen) {
    return <SignatureModal onClose={handleSignatureCancel} onSave={handleSignatureSave} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg border border-slate-200/80 dark:border-slate-700/50 flex flex-col relative">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <header className="p-4 px-6 flex justify-between items-center border-b dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Atur Posisi Tanda Tangan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Posisi ini akan diterapkan ke {documentIds.length} dokumen.</p>
            </div>
            <button type="button" onClick={onClose} disabled={isLoading} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">
              <FaTimes size={20} />
            </button>
          </header>

          {/* Body: Form */}
          <main className="p-4 px-6 space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Pratinjau Tanda Tangan</label>
              <div className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex justify-center items-center h-24">
                <img src={signatureImageUrl} alt="Tanda Tangan" className="max-h-full object-contain" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pageNumber" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nomor Halaman
                </label>
                <input
                  type="number"
                  id="pageNumber"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="positionPreset" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Posisi
                </label>
                <select
                  id="positionPreset"
                  value={positionPreset}
                  onChange={(e) => setPositionPreset(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="bottom-right">Kanan Bawah</option>
                  <option value="bottom-left">Kiri Bawah</option>
                  <option value="top-right">Kanan Atas</option>
                  <option value="top-left">Kiri Atas</option>
                  <option value="center">Tengah</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="qr-toggle" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Sertakan QR Code Verifikasi
              </label>
              <button
                type="button"
                id="qr-toggle"
                role="switch"
                aria-checked={includeQrCode}
                onClick={() => setIncludeQrCode(!includeQrCode)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${includeQrCode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${includeQrCode ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </main>

          {/* Footer: Tombol Aksi */}
          <footer className="p-4 px-6 flex justify-end gap-3 border-t dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white transition-colors"
            >
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50">
              {isLoading && <FaSpinner className="animate-spin" />}
              {isLoading ? "Memproses..." : `Terapkan ke ${documentIds.length} Dokumen`}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default BatchSignModal;
