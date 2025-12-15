import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { HiX, HiCheck } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { groupService } from "../../services/groupService";

export const ManageSignersModal = ({ isOpen, onClose, groupId, documentId, currentSigners = [], members = [], onUpdateSuccess }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Inisialisasi state dengan signer yang sudah ada saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // Ambil ID user dari list request yang ada
      const existingIds = currentSigners.map(s => s.userId);
      setSelectedUserIds(existingIds);
    }
  }, [isOpen, currentSigners]);

  const toggleUser = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Pilih setidaknya satu penanda tangan.");
      return;
    }

    setIsSaving(true);
    try {
      await groupService.updateDocumentSigners(groupId, documentId, selectedUserIds);
      toast.success("Daftar penanda tangan diperbarui!");
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui daftar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl">
          
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">Kelola Penanda Tangan</Dialog.Title>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><HiX size={20} /></button>
          </div>

          <p className="text-sm text-slate-500 mb-4">Pilih anggota yang wajib menandatangani dokumen ini.</p>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
            {members.map((member) => (
              <div 
                key={member.user.id} 
                onClick={() => toggleUser(member.user.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUserIds.includes(member.user.id) 
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.user.name}</p>
                    <p className="text-xs text-slate-500">{member.role === 'admin_group' ? 'Admin' : 'Anggota'}</p>
                  </div>
                </div>
                {selectedUserIds.includes(member.user.id) && <HiCheck className="text-blue-600" />}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
};