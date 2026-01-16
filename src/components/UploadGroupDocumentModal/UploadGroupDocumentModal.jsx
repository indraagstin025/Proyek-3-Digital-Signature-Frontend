import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUploadGroupDocument } from "../../hooks/Group/useGroups";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useCanPerformAction } from "../../hooks/useCanPerformAction";
// 1. Tambahkan FaWhatsapp
import { HiOutlineUpload, HiX, HiUserGroup } from "react-icons/hi"; 
import { FaWhatsapp } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { toast } from "react-hot-toast";

export const UploadGroupDocumentModal = ({ isOpen, onClose, groupId, members = [], currentDocCount = 0 }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedSigners, setSelectedSigners] = useState([]);

  const { validateFileSize, maxFileSizeLabel } = useFileUpload();
  const { canPerform: canCreateDoc, reason: createDocReason } = useCanPerformAction("create_document", currentDocCount);
  const { mutate: uploadDoc, isPending } = useUploadGroupDocument();

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setTitle("");
      setSelectedSigners([]);
    }
  }, [isOpen]);

  const handleToggleSigner = (userId) => {
    setSelectedSigners((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedSigners.length === members.length) {
      setSelectedSigners([]);
    } else {
      setSelectedSigners(members.map((m) => m.userId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canCreateDoc) {
      toast.error(createDocReason, { duration: 5000, icon: "🔒" });
      onClose();
      return;
    }

    if (!file) {
      toast.error("Pilih file PDF terlebih dahulu.");
      return;
    }

    const validation = validateFileSize(file);
    if (!validation.valid) {
      toast.error(validation.error, { duration: 5000, icon: "📁" });
      return;
    }

    if (!title.trim()) {
      toast.error("Judul dokumen wajib diisi.");
      return;
    }

    uploadDoc(
      {
        groupId,
        file,
        title,
        signerUserIds: selectedSigners,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={!isPending ? onClose : undefined}
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File PDF
                <span className="text-xs text-slate-500 ml-1">({maxFileSizeLabel} maksimal)</span>
              </label>
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

            {/* Checklist Anggota dengan Icon WA */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <HiUserGroup /> Siapa yang harus tanda tangan?
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaWhatsapp className="w-3 h-3" /> Notifikasi WA
                    </span>
                    <button type="button" onClick={handleSelectAll} disabled={isPending} className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50 ml-2">
                        {selectedSigners.length === members.length && members.length > 0 ? "Batal Semua" : "Pilih Semua"}
                    </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 space-y-2 custom-scrollbar">
                {members.length > 0 ? (
                  members.map((member) => {
                    const isSelected = selectedSigners.includes(member.userId);
                    return (
                        <label
                            key={member.userId}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${
                                isSelected 
                                ? "bg-white dark:bg-slate-800 border-green-400 shadow-sm" 
                                : "border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800"
                            } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    value={member.userId}
                                    checked={isSelected}
                                    onChange={() => !isPending && handleToggleSigner(member.userId)}
                                    disabled={isPending}
                                    className="peer w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                                        {member.user?.name?.charAt(0) || "?"}
                                    </div>
                                    <span className={`text-sm font-semibold ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {member.user?.name}
                                    </span>
                                    {isSelected && (
                                        <FaWhatsapp className="text-green-500 w-4 h-4 animate-in fade-in zoom-in duration-200" title="Akan dikirim notifikasi WA" />
                                    )}
                                </div>
                            </div>

                            {/* Status Label Kecil */}
                            {isSelected && <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">Akan dinotifikasi</span>}
                        </label>
                    );
                  })
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
            disabled={isPending || !file || !title}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <ImSpinner9 className="animate-spin" /> Mengupload...
              </>
            ) : (
              // Teks Tombol Diubah
              "Upload & Kirim WA"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};