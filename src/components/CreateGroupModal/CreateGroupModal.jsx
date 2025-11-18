// File: src/components/CreateGroupModal/CreateGroupModal.jsx

import React, { useState } from 'react';

// ✅ 1. Terima prop 'isLoading'
const CreateGroupModal = ({ isOpen, onClose, onGroupCreate, isLoading }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCreate = () => {
    // Jangan lakukan apa-apa jika sedang loading
    if (isLoading) return;
    
    onGroupCreate({ name: groupName, description: groupDescription });
    
    // ✅ 2. HAPUS baris-baris ini
    // setGroupName('');
    // setGroupDescription('');
    // onClose(); 
    // Biarkan komponen induk (DashboardWorkspaces) yang menutup modal
    // dan mereset state saat modal dibuka kembali.
  };

  // ✅ Tambahan: Reset state saat modal dibuka
  // Ini memastikan form selalu kosong saat modal muncul
  React.useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setGroupDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Gunakan 'fixed' dan 'inset-0' untuk overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* (Ganti bg-gray-900 dengan dark mode Anda jika perlu) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-sm border border-slate-200 dark:border-slate-700">
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Buat Grup Baru</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Nama Grup</label>
            <input 
              type="text" 
              id="groupName" 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)} 
              // ✅ 3. Nonaktifkan saat loading
              disabled={isLoading}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" 
            />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Deskripsi</label>
            <textarea 
              id="groupDescription" 
              value={groupDescription} 
              onChange={(e) => setGroupDescription(e.target.value)} 
              // ✅ 4. Nonaktifkan saat loading
              disabled={isLoading}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            // ✅ 5. Nonaktifkan tombol Batal saat loading
            disabled={isLoading}
            className="bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={handleCreate} 
            // ✅ 6. Nonaktifkan tombol Buat saat loading
            disabled={isLoading}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* ✅ 7. Ubah teks tombol saat loading */}
            {isLoading ? "Membuat..." : "Buat"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGroupModal;