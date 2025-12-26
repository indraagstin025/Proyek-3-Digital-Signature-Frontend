import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUploadGroupDocument } from "../../hooks/Group/useGroups";
import { HiOutlineUpload, HiX, HiUserGroup, HiCheck } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";
import { toast } from "react-hot-toast";

export const UploadGroupDocumentModal = ({ isOpen, onClose, groupId, members = [] }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  // State untuk menyimpan ID anggota yang dipilih (Checklist)
  const [selectedSigners, setSelectedSigners] = useState([]);

  // Hook Mutation (yang sudah dilengkapi Direct Cache Update)
  const { mutate: uploadDoc, isPending } = useUploadGroupDocument();

  // Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setTitle("");
      setSelectedSigners([]);
    }
  }, [isOpen]);

  // Handle Checkbox Change
  const handleToggleSigner = (userId) => {
    setSelectedSigners((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Pilih Semua Anggota
  const handleSelectAll = () => {
    if (selectedSigners.length === members.length) {
      setSelectedSigners([]);
    } else {
      setSelectedSigners(members.map((m) => m.userId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Pilih file PDF terlebih dahulu.");
      return;
    }
    if (!title.trim()) {
      toast.error("Judul dokumen wajib diisi.");
      return;
    }
    // Jika user lupa memilih signer, kita bisa ingatkan (Opsional, tergantung rules bisnis)
    // Di sini kita izinkan upload tanpa signer (dokumen viewer only), tapi jika diwajibkan:
    /* if (selectedSigners.length === 0) {
      toast.error("Harap pilih minimal satu penanda tangan.");
      return;
    }
    */

    uploadDoc(
      {
        groupId,
        file,
        title,
        signerUserIds: selectedSigners,
      },
      {
        onSuccess: () => {
          // Modal ditutup hanya jika sukses (karena upload butuh waktu loading)
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={!isPending ? onClose : undefined} // Cegah tutup saat loading
    >
      <div
        className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh] transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HiOutlineUpload className="text-blue-600" />
            Upload Dokumen Grup
          </h3>
          <button onClick={onClose} disabled={isPending} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 disabled:opacity-50">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Input Judul */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Dokumen</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Laporan Keuangan Q1"
                disabled={isPending}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800"
                required
              />
            </div>

            {/* Input File */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">File PDF</label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer group transition-colors ${
                  file ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800" : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  required={!file}
                />

                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  {file ? (
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                      <HiCheck className="w-5 h-5 text-green-500" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <HiOutlineUpload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Klik untuk pilih file PDF</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist Anggota */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <HiUserGroup /> Siapa yang harus tanda tangan?
                </label>
                <button type="button" onClick={handleSelectAll} disabled={isPending} className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50">
                  {selectedSigners.length === members.length && members.length > 0 ? "Batal Semua" : "Pilih Semua"}
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1 custom-scrollbar">
                {members.length > 0 ? (
                  members.map((member) => (
                    <label
                      key={member.userId}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        selectedSigners.includes(member.userId) ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" : "hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent"
                      } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">{member.user?.name?.charAt(0) || "?"}</div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{member.user?.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        value={member.userId}
                        checked={selectedSigners.includes(member.userId)}
                        onChange={() => !isPending && handleToggleSigner(member.userId)}
                        disabled={isPending}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-500 py-4">Tidak ada anggota lain.</p>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">*Anggota yang dipilih akan menerima notifikasi via WhatsApp.</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
            Batal
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={isPending || !file || !title} // Disable jika belum lengkap
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <ImSpinner9 className="animate-spin" /> Mengupload...
              </>
            ) : (
              "Upload & Kirim Notifikasi"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
