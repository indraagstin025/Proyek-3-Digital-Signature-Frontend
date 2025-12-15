// File: src/components/CreateGroupModal/CreateGroupModal.jsx

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <--- 1. IMPORT PORTAL

const CreateGroupModal = ({ isOpen, onClose, onGroupCreate, isLoading }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCreate = () => {
    if (isLoading) return;
    onGroupCreate({ name: groupName, description: groupDescription });
  };

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setGroupDescription("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 2. Simpan konten Modal ke dalam variabel
  const modalContent = (
    // Gunakan z-[9999] untuk memastikan di atas Sidebar
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 relative">
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          Buat Grup Baru
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">
              Nama Grup
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              placeholder="Contoh: Tim Marketing"
            />
          </div>
          
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">
              Deskripsi
            </label>
            <textarea
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 transition-all"
              placeholder="Deskripsi singkat grup..."
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading || !groupName.trim()} // Validasi sederhana: nama tidak boleh kosong
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? "Membuat..." : "Buat"}
          </button>
        </div>
      </div>
    </div>
  );

  // 3. Render ke document.body menggunakan Portal
  return createPortal(modalContent, document.body);
};

export default CreateGroupModal;