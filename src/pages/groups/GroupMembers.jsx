import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // ✅ Diimpor untuk mendapatkan currentUser
import { useCreateInvitation, useRemoveMember } from '../../hooks/useGroups';
import { HiOutlineTrash, HiOutlineClipboardCopy } from 'react-icons/hi';
import toast from 'react-hot-toast';

// Impor Modal baru
import { InvitationLinkModal } from '../../components/InvitiationGrupModal/InvitationLinkModal';

// Terima props dari GroupDetailPage
export const GroupMembers = ({ members, groupId, adminId }) => {
  // Dapatkan 'user' (currentUser) dari DashboardPage
  const { user: currentUser } = useOutletContext(); 
  
  const [role, setRole] = useState('viewer');
  
  // State untuk mengelola modal link
  const [generatedLink, setGeneratedLink] = useState(null); // (null atau string link)
  
  // Gunakan hook mutasi
  const { mutate: createInvite, isLoading: isInviting } = useCreateInvitation();
  const { mutate: removeMember, isLoading: isRemoving } = useRemoveMember();

  // Cek apakah user saat ini adalah admin grup
  const memberDataOfCurrentUser = members.find(m => m.userId === currentUser?.id);
  const isUserAdmin = (currentUser?.id === adminId) || (memberDataOfCurrentUser?.role === 'admin_group');

  const handleInvite = () => {
    createInvite({ groupId, role }, {
      onSuccess: (data) => {
        // Set link ke state, ini akan otomatis membuka Modal
        setGeneratedLink(data.invitationLink); 
      },
      onError: (error) => {
        toast.error(`Gagal: ${error.message}`);
      }
    });
  };

  const handleRemove = (userIdToRemove) => {
    if (confirm("Anda yakin ingin mengeluarkan anggota ini?")) {
      removeMember({ groupId, userIdToRemove }, {
        onSuccess: () => {
          toast.success("Anggota berhasil dikeluarkan.");
        },
        onError: (error) => {
          toast.error(`Gagal: ${error.message}`);
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Bagian Tambah Anggota / Undangan (Hanya tampil jika user admin) */}
      {isUserAdmin && (
        <div className="mb-6 p-4 bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 rounded-lg shadow">
          <h4 className="font-semibold text-lg text-slate-800 dark:text-white mb-3">Undang Anggota Baru</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="viewer">Viewer (Hanya Melihat)</option>
              <option value="signer">Signer (Melihat & TTD)</option>
              <option value="admin_group">Admin (Mengelola Grup)</option>
            </select>
            <button 
              onClick={handleInvite} 
              disabled={isInviting}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <HiOutlineClipboardCopy className="w-5 h-5" />
              {isInviting ? "Membuat..." : "Buat Link Undangan"}
            </button>
          </div>
        </div>
      )}

      {/* Daftar Anggota */}
      <div className="bg-white dark:bg-slate-800/50 shadow rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700/50">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {members.map(member => (
            <li key={member.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 {/* Placeholder Avatar */}
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-slate-800 dark:text-white">{member.user.name}</span>
                  {/* Tampilkan tag 'Pemilik' jika dia adminId */}
                  {member.userId === adminId && (
                    <span className="ml-2 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Pemilik</span>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{member.role.replace('_', ' ')}</span>
                
                {/* Tampilkan tombol Hapus HANYA JIKA:
                    1. User saat ini adalah admin (isUserAdmin)
                    2. User yang akan dihapus BUKAN Admin Utama (pemilik)
                */}
                {isUserAdmin && member.userId !== adminId && (
                  <button 
                    onClick={() => handleRemove(member.user.id)}
                    disabled={isRemoving}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
                    title="Keluarkan anggota"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Render Modal (akan otomatis tampil saat 'generatedLink' berisi string) */}
      <InvitationLinkModal
        isOpen={!!generatedLink}
        onClose={() => setGeneratedLink(null)} // Saat ditutup, reset link-nya
        link={generatedLink}
      />
    </div>
  );
}