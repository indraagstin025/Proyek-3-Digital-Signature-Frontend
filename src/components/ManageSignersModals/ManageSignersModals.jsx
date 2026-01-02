import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { HiX, HiCheck, HiLockClosed } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im";

import { useUpdateDocumentSigners } from "../../hooks/Group/useGroups";

export const ManageSignersModal = ({ isOpen, onClose, groupId, documentId, currentSigners = [], members = [] }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Hook Optimistic
  const { mutate: updateSigners, isPending: isSaving } = useUpdateDocumentSigners();

  const signedUserIds = useMemo(() => {
    return new Set(currentSigners.filter((s) => s.status === "SIGNED").map((s) => s.userId));
  }, [currentSigners]);

  useEffect(() => {
    if (isOpen) {
      const existingIds = currentSigners.map((s) => s.userId);
      setSelectedUserIds(existingIds);
    }
  }, [isOpen, currentSigners]);

  const toggleUser = (userId) => {
    if (signedUserIds.has(userId)) {
      toast.error("User ini sudah tanda tangan, tidak bisa dihapus.", { id: "locked-signer" });
      return;
    }
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  // [LOGIC BARU] Cek apakah tombol harus dinonaktifkan
  const isSaveDisabled = selectedUserIds.length === 0;

  const handleSave = () => {
    if (isSaveDisabled) return; // Double check logic

    // 1. Eksekusi Mutasi
    updateSigners(
      {
        groupId,
        documentId,
        signerUserIds: selectedUserIds,
        members: members,
      },
      {
        onError: () => {
          toast.error("Gagal menyimpan, silakan coba lagi.");
        },
      }
    );

    // 2. Tutup Modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">Kelola Penanda Tangan</Dialog.Title>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <HiX size={20} />
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Centang anggota yang wajib menandatangani dokumen ini.</p>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {members.map((member) => {
              const isSelected = selectedUserIds.includes(member.user.id);
              const isLocked = signedUserIds.has(member.user.id);

              return (
                <div
                  key={member.user.id}
                  onClick={() => toggleUser(member.user.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isLocked 
                      ? "cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80" 
                      : "cursor-pointer hover:shadow-sm"
                  } ${
                    isSelected && !isLocked 
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                      : "border-slate-100 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isLocked ? "bg-slate-300 text-slate-600" : "bg-blue-100 text-blue-600 dark:bg-slate-700 dark:text-blue-400"}`}>
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isLocked ? "text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>{member.user.name}</p>
                        {isLocked && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">SUDAH TTD</span>}
                      </div>
                      <p className="text-xs text-slate-500 capitalize">{member.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="text-xl">
                    {isLocked ? <HiLockClosed className="text-slate-400" /> : isSelected ? <HiCheck className="text-blue-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Batal
            </button>
            
            {/* [MODIFIKASI] Tombol Simpan */}
            <button
              onClick={handleSave}
              disabled={isSaving || isSaveDisabled}
              className={`
                flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all
                ${isSaving || isSaveDisabled
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400" // Style Disabled
                  : "text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30" // Style Active
                }
              `}
            >
              {isSaving ? (
                <>
                  <ImSpinner9 className="animate-spin" /> Memproses...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};