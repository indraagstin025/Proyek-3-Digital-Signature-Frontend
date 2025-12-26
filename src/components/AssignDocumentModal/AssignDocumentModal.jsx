// File: components/Group/AssignDocumentModal.jsx

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom"; // 1. Import createPortal
import toast from "react-hot-toast";
import { HiX, HiCheck, HiOutlineDocumentText } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";
import { useGetMyDocuments } from "../../hooks/Documents/useDocumentGroup";
import { useAssignDocumentToGroup } from "../../hooks/Group/useGroups";

/**
 * @param {boolean} isOpen - Tampilkan/sembunyikan modal
 * @param {function} onClose - Fungsi untuk menutup modal
 * @param {number} groupId - ID grup target
 * @param {Array} documentsAlreadyInGroup - Daftar dokumen yang sudah ada di grup
 * @param {Array} members - Daftar anggota grup
 */
export const AssignDocumentModal = ({ isOpen, onClose, groupId, documentsAlreadyInGroup = [], members = [] }) => {
  // State
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedSigners, setSelectedSigners] = useState([]);

  // Ambil Data & Mutasi
  const { data: allMyDocuments, isLoading: isLoadingDocs } = useGetMyDocuments();
  const { mutate: assignDocument, isPending: isAssigning } = useAssignDocumentToGroup();

  // Filter Dokumen
  const availableDocuments = useMemo(() => {
    const existingIds = new Set(documentsAlreadyInGroup.map((doc) => doc.id));
    return allMyDocuments?.filter((doc) => !existingIds.has(doc.id) && !doc.groupId) || [];
  }, [allMyDocuments, documentsAlreadyInGroup]);

  // Handler Checkbox
  const handleCheckboxChange = (userId) => {
    setSelectedSigners((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  // Handler Submit
  const handleAssign = () => {
    if (!selectedDocumentId) {
      toast.error("Silakan pilih dokumen terlebih dahulu.");
      return;
    }

    assignDocument(
      {
        groupId,
        documentId: selectedDocumentId,
        signerUserIds: selectedSigners,
      },
      {
        onSuccess: () => {
          setSelectedDocumentId(null);
          setSelectedSigners([]);
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  // 2. Bungkus Konten Modal ke dalam variabel
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // Menutup modal jika backdrop diklik
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ambil dari Draft</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pindahkan dokumen pribadi ke grup ini.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500">
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* BAGIAN 1: PILIH DOKUMEN */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">1. Pilih Dokumen</h4>

            {isLoadingDocs ? (
              <div className="flex justify-center py-8 text-slate-500">
                <ImSpinner9 className="animate-spin mr-2" /> Memuat dokumen...
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">Tidak ada dokumen draft yang tersedia.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all flex items-start gap-3 group ${
                      selectedDocumentId === doc.id
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedDocumentId === doc.id ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                      <HiOutlineDocumentText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${selectedDocumentId === doc.id ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>{doc.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                    </div>
                    {selectedDocumentId === doc.id && <HiCheck className="text-blue-600 w-5 h-5" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BAGIAN 2: PILIH SIGNER */}
          {selectedDocumentId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">2. Siapa yang wajib tanda tangan?</h4>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                {members.length > 0 ? (
                  members.map((member) => (
                    <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSigners.includes(member.userId)}
                          onChange={() => handleCheckboxChange(member.userId)}
                          className="peer w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{member.user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{member.role.replace("_", " ")}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">Tidak ada anggota lain di grup ini.</p>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">*Dokumen akan berstatus "Pending" sampai user terpilih melakukan tanda tangan.</p>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Batal
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedDocumentId || isAssigning}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
          >
            {isAssigning ? (
              <>
                <ImSpinner9 className="animate-spin h-5 w-5" /> Memproses...
              </>
            ) : (
              <>
                <HiCheck className="w-5 h-5" /> Tetapkan ke Grup
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // 3. Render ke document.body
  return createPortal(modalContent, document.body);
};
