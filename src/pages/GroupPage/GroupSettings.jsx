/* eslint-disable no-unused-vars */
import React, { useState } from 'react'; // ✅ Impor useState
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ✅ Impor hook baru kita
import { useUpdateGroup, useDeleteGroup } from '../../hooks/useGroups'; 

/**
 * @param {object} group - Objek detail grup
 * @param {string} currentUserId - ID user yang sedang login (wajib)
 */
export const GroupSettings = ({ group, currentUserId }) => {
  const navigate = useNavigate();
  
  // State untuk input nama
  const [name, setName] = useState(group.name);

  // Gunakan hook mutasi
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup();

  // Cek apakah user ini adalah admin
  // Backend akan cek lagi, tapi ini bagus untuk menyembunyikan UI
  const isAdmin = group.members.some(m => m.userId === currentUserId && m.role === 'admin_group');
  // Cek admin utama (hanya dia yang bisa hapus)
  const isMainAdmin = group.adminId === currentUserId;

  // Handler Ganti Nama
  const handleUpdateName = () => {
    if (name.trim() === "" || name === group.name) {
      setName(group.name); // Reset jika kosong atau tidak berubah
      return;
    }
    updateGroup({ groupId: group.id, name });
  };

  // Handler Hapus Grup
  const handleDeleteGroup = () => {
    if (confirm(`Anda yakin ingin menghapus grup "${group.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteGroup(group.id);
    }
  };

  // ✅ JIKA BUKAN ADMIN, jangan tampilkan pengaturan
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
        <h4 className="font-semibold text-lg text-yellow-800 dark:text-yellow-300">
          Akses Terbatas
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Hanya admin grup yang dapat mengubah pengaturan.
        </p>
      </div>
    );
  }

  // ✅ JIKA ADMIN, tampilkan ini:
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Pengaturan Grup</h3>
      
      {/* Ganti Nama Grup */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 rounded-lg shadow">
        <h4 className="font-semibold text-lg text-slate-800 dark:text-white mb-3">Nama Grup</h4>
        <input 
          type="text" 
          value={name} // Gunakan state
          onChange={(e) => setName(e.target.value)} // Perbarui state
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          className="mt-3 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          onClick={handleUpdateName}
          disabled={isUpdating || name === group.name} // Nonaktifkan jika sedang loading atau nama sama
        >
          {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* Zona Berbahaya (Hanya untuk ADMIN UTAMA) */}
      {isMainAdmin && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg shadow">
          <h4 className="font-semibold text-lg text-red-800 dark:text-red-300 mb-3">Zona Berbahaya</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Hanya pemilik utama yang dapat menghapus grup. Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
          </p>
          <button 
            onClick={handleDeleteGroup}
            disabled={isDeleting} // Nonaktifkan jika sedang loading
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : "Hapus Grup Ini"}
          </button>
        </div>
      )}
    </div>
  );
};