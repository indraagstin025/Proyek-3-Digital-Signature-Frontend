/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUpdateGroup, useDeleteGroup } from "../../hooks/Group/useGroups";

export const GroupSettings = ({ group, currentUserId }) => {
  const navigate = useNavigate();
  const [name, setName] = useState(group.name);
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup();

  const isAdmin = group.members.some((m) => m.userId === currentUserId && m.role === "admin_group");
  const isMainAdmin = group.adminId === currentUserId;

  const handleUpdateName = () => { if (name.trim() === "" || name === group.name) { setName(group.name); return; } updateGroup({ groupId: group.id, name }); };
  const handleDeleteGroup = () => { if (confirm(`Hapus grup "${group.name}"?`)) { deleteGroup(group.id); } };

  if (!isAdmin) return <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">Akses Terbatas.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
         <h3 className="text-xl font-bold text-slate-800 dark:text-white">Pengaturan Umum</h3>
         <p className="text-slate-500 text-sm mt-1">Sesuaikan informasi dasar grup ini.</p>
      </div>

      {/* Card Nama Grup */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Tampilan Grup</label>
        <div className="flex gap-3">
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-2.5 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
            onClick={handleUpdateName}
            disabled={isUpdating || name === group.name}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none transition-all"
            >
            {isUpdating ? "..." : "Simpan"}
            </button>
        </div>
      </div>

      {/* Zona Berbahaya */}
      {isMainAdmin && (
        <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl p-6">
          <h4 className="font-bold text-red-700 dark:text-red-400 text-lg mb-2">Zona Berbahaya</h4>
          <p className="text-sm text-red-600/80 dark:text-red-300/70 mb-5">
            Menghapus grup ini akan menghapus semua dokumen dan riwayat aktivitas secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
          <button
            onClick={handleDeleteGroup}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-white border border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm"
          >
            {isDeleting ? "Menghapus..." : "Hapus Grup Ini"}
          </button>
        </div>
      )}
    </div>
  );
};