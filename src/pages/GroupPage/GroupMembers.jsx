// File: components/Group/GroupMembers.jsx

import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom"; // Tambah Link
import { useCreateInvitation, useRemoveMember } from "../../hooks/Group/useGroups";
import { HiOutlineTrash, HiPlus, HiLockClosed } from "react-icons/hi"; // Tambah Icon Lock
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import toast from "react-hot-toast";
import { InvitationLinkModal } from "../../components/InvitiationGrupModal/InvitationLinkModal";

export const GroupMembers = ({ members, groupId, adminId, groupData }) => {
  const { user: currentUser } = useOutletContext();
  const [role, setRole] = useState("viewer");
  const [generatedLink, setGeneratedLink] = useState(null);
  const { mutate: createInvite, isPending: isInviting } = useCreateInvitation();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const memberDataOfCurrentUser = members.find((m) => m.userId === currentUser?.id);
  const isUserAdmin = currentUser?.id === adminId || memberDataOfCurrentUser?.role === "admin_group";

  // --- LOGIC LIMIT ANGGOTA (Sesuai groupService.js) ---
  const groupOwnerStatus = groupData?.admin?.userStatus || "FREE";
  const isOwnerPremium = groupOwnerStatus === "PREMIUM" || groupOwnerStatus === "PREMIUM_YEARLY";
  
  const MAX_MEMBERS = isOwnerPremium ? 999 : 5; // Free max 5, Premium unlimited
  const currentMemberCount = members.length;
  const isLimitReached = currentMemberCount >= MAX_MEMBERS;

  const handleInvite = () => {
    if (isLimitReached) {
        if (groupData.adminId === currentUser.id) {
            toast.error("Grup Free maksimal 5 anggota. Upgrade ke Premium!", { icon: "🔒" });
        } else {
            toast.error("Grup penuh. Hubungi Admin Grup untuk upgrade.", { icon: "🔒" });
        }
        return;
    }

    createInvite({ groupId, role }, { 
        onSuccess: (data) => setGeneratedLink(data.invitationLink), 
        onError: (error) => toast.error(`Gagal: ${error.message}`) 
    });
  };
  
  const handleRemove = (userIdToRemove) => {
    if (confirm("Keluarkan anggota ini?")) {
      removeMember({ groupId, userIdToRemove });
    }
  };

  return (
    <div className="h-full w-full">
      <InvitationLinkModal isOpen={!!generatedLink} onClose={() => setGeneratedLink(null)} link={generatedLink} />

      <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        {/* HEADER */}
  {/* HEADER - UPDATED UI */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
          <div>
            <div className="flex items-center gap-3">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                 Anggota Tim
               </h3>
               <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  isLimitReached && !isOwnerPremium
                  ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" 
                  : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
               }`}>
                 {currentMemberCount} / {isOwnerPremium ? "∞" : MAX_MEMBERS}
               </span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
               <p className="text-slate-500 text-sm">Kelola akses dan peran anggota grup.</p>
               {/* Upsell Mini Text */}
               {!isOwnerPremium && isLimitReached && (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                     <HiLockClosed className="w-3 h-3" /> Penuh
                  </span>
               )}
            </div>
          </div>

          {isUserAdmin && (
            <div className="w-full xl:w-auto p-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row gap-2">
              <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-transparent border-0 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-2 pl-3">
                <option value="viewer">Viewer</option>
                <option value="signer">Signer</option>
                <option value="admin_group">Admin</option>
              </select>
              
              <button
                onClick={handleInvite}
                disabled={isInviting} // Jangan disable button secara visual agar user bisa klik dan lihat pesan error limit
                className={`flex items-center justify-center gap-2 text-sm font-bold py-2 px-4 rounded-lg shadow-md transition-all ${
                    isLimitReached 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                }`}
              >
                {isLimitReached ? <HiLockClosed className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
                {isInviting ? "..." : "Buat Link"}
              </button>
            </div>
          )}
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {members.map((member) => (
              <li key={member.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors flex flex-col sm:flex-row justify-between items-center gap-4 group">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full p-[2px] bg-gradient-to-br from-blue-400 to-indigo-400">
                    <UserAvatar 
                      user={member.user} 
                      className="h-full w-full border-2 border-white dark:border-slate-800 rounded-full" 
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white truncate">{member.user.name}</span>
                      {member.userId === adminId && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wide">Owner</span>}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-[4rem] sm:pl-0">
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-md tracking-wider ${
                      member.role === "admin_group"
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : member.role === "signer"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {member.role.replace("_", " ")}
                  </span>

                  {isUserAdmin && member.userId !== adminId && (
                    <button onClick={() => handleRemove(member.user.id)} disabled={isRemoving} className="p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
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