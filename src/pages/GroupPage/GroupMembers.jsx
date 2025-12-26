import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useCreateInvitation, useRemoveMember } from "../../hooks/Group/useGroups";
import { HiOutlineTrash, HiOutlineClipboardCopy, HiPlus } from "react-icons/hi";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import toast from "react-hot-toast";
import { InvitationLinkModal } from "../../components/InvitiationGrupModal/InvitationLinkModal";

export const GroupMembers = ({ members, groupId, adminId }) => {
  const { user: currentUser } = useOutletContext();
  const [role, setRole] = useState("viewer");
  const [generatedLink, setGeneratedLink] = useState(null);
  const { mutate: createInvite, isLoading: isInviting } = useCreateInvitation();
  const { mutate: removeMember, isLoading: isRemoving } = useRemoveMember();

  const memberDataOfCurrentUser = members.find((m) => m.userId === currentUser?.id);
  const isUserAdmin = currentUser?.id === adminId || memberDataOfCurrentUser?.role === "admin_group";

  const handleInvite = () => {
    createInvite({ groupId, role }, { onSuccess: (data) => setGeneratedLink(data.invitationLink), onError: (error) => toast.error(`Gagal: ${error.message}`) });
  };
  const handleRemove = (userIdToRemove) => {
    if (confirm("Keluarkan anggota ini?")) {
      removeMember({ groupId, userIdToRemove }, { onSuccess: () => toast.success("Berhasil dikeluarkan."), onError: (error) => toast.error(`Gagal: ${error.message}`) });
    }
  };

  return (
    <div className="h-full w-full">
      <InvitationLinkModal isOpen={!!generatedLink} onClose={() => setGeneratedLink(null)} link={generatedLink} />

      <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-3">
              Anggota Tim
              <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-2.5 py-1 rounded-md">{members.length}</span>
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">Kelola akses dan peran anggota grup.</p>
          </div>

          {isUserAdmin && (
            <div className="w-full xl:w-auto p-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row gap-2">
              <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-transparent border-0 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-2 pl-3">
                <option value="viewer">Viewer</option>
                <option value="signer">Signer</option>
                <option value="admin_group">Admin</option>
              </select>
              {/* 🔥 TOMBOL INVITE GRADASI */}
              <button
                onClick={handleInvite}
                disabled={isInviting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md transition-all"
              >
                <HiPlus className="w-4 h-4" />
                {isInviting ? "..." : "Buat Link"}
              </button>
            </div>
          )}
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {members.map((member) => (
              <li key={member.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors flex flex-col sm:flex-row justify-between items-center gap-4 group">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  
                  {/* ✅ FIX: Wrapper Gradient dikembalikan agar bulat sempurna */}
                  <div className="flex-shrink-0 h-12 w-12 rounded-full p-[2px] bg-gradient-to-br from-blue-400 to-indigo-400">
                    <UserAvatar 
                      user={member.user} 
                      className="h-full w-full border-2 border-white dark:border-slate-800" 
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