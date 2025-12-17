import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCreateInvitation, useRemoveMember } from '../../hooks/useGroups';
import { HiOutlineTrash, HiOutlineClipboardCopy } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { InvitationLinkModal } from '../../components/InvitiationGrupModal/InvitationLinkModal';

export const GroupMembers = ({ members, groupId, adminId }) => {
  const { user: currentUser } = useOutletContext();
  const [role, setRole] = useState('viewer');
  const [generatedLink, setGeneratedLink] = useState(null);
  const { mutate: createInvite, isLoading: isInviting } = useCreateInvitation();
  const { mutate: removeMember, isLoading: isRemoving } = useRemoveMember();

  const memberDataOfCurrentUser = members.find(m => m.userId === currentUser?.id);
  const isUserAdmin = (currentUser?.id === adminId) || (memberDataOfCurrentUser?.role === 'admin_group');

  const handleInvite = () => {
    createInvite({ groupId, role }, {
      onSuccess: (data) => setGeneratedLink(data.invitationLink),
      onError: (error) => toast.error(`Gagal: ${error.message}`)
    });
  };

  const handleRemove = (userIdToRemove) => {
    if (confirm("Keluarkan anggota ini?")) {
      removeMember({ groupId, userIdToRemove }, {
        onSuccess: () => toast.success("Berhasil dikeluarkan."),
        onError: (error) => toast.error(`Gagal: ${error.message}`)
      });
    }
  };

  return (
    <div className="h-full w-full py-0 sm:py-1 px-0 sm:px-1">
      <InvitationLinkModal isOpen={!!generatedLink} onClose={() => setGeneratedLink(null)} link={generatedLink} />

      {/* ✅ Card Container */}
      <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-0 sm:border border-slate-200 dark:border-slate-700/60 sm:rounded-xl shadow-none sm:shadow-sm overflow-hidden">
        
        {/* 1. HEADER - Menggunakan flex-col di mobile */}
        <div className="flex-none px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          
          <div className="w-full xl:w-auto">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              Anggota Grup
              <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {members.length}
              </span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
               Daftar rekan tim di grup ini.
            </p>
          </div>

          {isUserAdmin && (
            // Form Invite: Full width di mobile
            <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-2">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full sm:w-auto bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="signer">Signer</option>
                <option value="admin_group">Admin</option>
              </select>
              <button 
                onClick={handleInvite} 
                disabled={isInviting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <HiOutlineClipboardCopy className="w-4 h-4" />
                {isInviting ? "Membuat..." : "Buat Link"}
              </button>
            </div>
          )}
        </div>

        {/* 2. LIST SECTION */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {members.map(member => (
              <li 
                key={member.id} 
                // Flex col di mobile (stack ke bawah), Flex row di desktop
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center font-bold text-lg text-blue-600">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base truncate">{member.user.name}</span>
                      {member.userId === adminId && (
                         <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                           Pemilik
                         </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{member.user.email}</p>
                  </div>
                </div>

                {/* Role & Actions - Width full di mobile untuk perataan */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pl-[3.25rem] sm:pl-0">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 bg-slate-100 border border-slate-200 rounded-md dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                    {member.role.replace('_', ' ')}
                  </span>
                  
                  {isUserAdmin && member.userId !== adminId && (
                    <button 
                      onClick={() => handleRemove(member.user.id)}
                      disabled={isRemoving}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
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