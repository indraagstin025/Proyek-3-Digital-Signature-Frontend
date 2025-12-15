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
    // ✅ WRAPPER UTAMA: Padding kecil agar shadow card tidak terpotong
    <div className="h-full w-full py-1 px-1">
      
      {/* --- MODAL (Undangan) --- */}
      <InvitationLinkModal
        isOpen={!!generatedLink}
        onClose={() => setGeneratedLink(null)} 
        link={generatedLink}
      />

      {/* ✅ SATU CARD BESAR (Header + List) */}
      <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        
        {/* 1. HEADER SECTION (Statis di dalam Card) */}
        <div className="flex-none px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 z-10 flex flex-col xl:flex-row justify-between items-center gap-4">
          
          {/* Judul & Info */}
          <div className="w-full xl:w-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              Anggota Grup
              <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600/50">
                {members.length}
              </span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
               Daftar rekan tim yang memiliki akses ke grup ini.
            </p>
          </div>

          {/* Form Undangan (Hanya Admin) */}
          {isUserAdmin && (
            <div className="w-full xl:w-auto flex gap-2">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <option value="viewer">Viewer</option>
                <option value="signer">Signer</option>
                <option value="admin_group">Admin</option>
              </select>
              <button 
                onClick={handleInvite} 
                disabled={isInviting}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-sm disabled:opacity-70 whitespace-nowrap"
              >
                <HiOutlineClipboardCopy className="w-4 h-4" />
                {isInviting ? "Membuat..." : "Buat Link"}
              </button>
            </div>
          )}
        </div>

        {/* 2. LIST SECTION (Scrollable) */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {members.map(member => (
              <li 
                key={member.id} 
                // Item List Style: Simple row dengan hover effect
                className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
              >
                <div className="flex items-center gap-4">
                   {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 flex items-center justify-center font-bold text-lg text-blue-600 dark:text-blue-400">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Info User */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-white text-base">{member.user.name}</span>
                      {/* Tag Pemilik / Admin */}
                      {member.userId === adminId && (
                         <span className="text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                           Pemilik
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.user.email}</p>
                  </div>
                </div>

                {/* Role & Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md">
                    {member.role.replace('_', ' ')}
                  </span>
                  
                  {/* Tombol Hapus */}
                  {isUserAdmin && member.userId !== adminId && (
                    <>
                      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                      <button 
                        onClick={() => handleRemove(member.user.id)}
                        disabled={isRemoving}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Keluarkan anggota"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};