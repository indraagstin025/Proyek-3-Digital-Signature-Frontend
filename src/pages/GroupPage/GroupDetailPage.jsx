import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useGetGroupById } from "../../hooks/Group/useGroups";
import { socketService } from "../../services/socketService";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";

import { GroupDocuments } from "./GroupDocuments";
import { GroupMembers } from "./GroupMembers";
import { GroupSettings } from "./GroupSettings";
import { HiOutlineDocumentText, HiOutlineUsers, HiOutlineCog, HiUser } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";

// ✅ UI: Tombol Tab Modern dengan animasi underline
const TabButton = ({ icon, label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative group flex items-center justify-center sm:justify-start gap-2.5 py-4 px-5 font-medium text-sm flex-1 sm:flex-none
      transition-all duration-300 ease-out
      ${
        isActive
          ? "text-blue-600 dark:text-blue-400"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
      }
    `}
  >
    <div className={`relative z-10 flex items-center gap-2 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
      {icon}
      <span className={`${isActive ? "inline font-bold" : "hidden sm:inline"}`}>{label}</span>
    </div>

    {/* Badge Count */}
    {typeof count !== "undefined" && (
      <span
        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-all
          ${isActive 
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 translate-x-1" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-500"}
        `}
      >
        {count}
      </span>
    )}

    {/* Active Indicator (Bottom Bar) */}
    {isActive && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full shadow-[0_-2px_6px_rgba(59,130,246,0.4)]"></span>
    )}
  </button>
);

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useOutletContext();
  const queryClient = useQueryClient();

  const { data: group, isLoading, error } = useGetGroupById(Number(groupId));

  const [currentTab, setCurrentTab] = useState("documents");
  const userIdRef = useRef(null);

  useEffect(() => {
    if (currentUser?.id) {
      userIdRef.current = currentUser.id;
    }
  }, [currentUser]);

  // ... (LOGIC SOCKET TETAP SAMA SEPERTI SEBELUMNYA, TIDAK DIUBAH) ...
  useEffect(() => {
    if (!groupId) return;
    const socket = socketService.connect();
    const gId = Number(groupId);
    const joinGroup = () => { console.log("🔄 Mencoba Join Group Room:", gId); socketService.joinGroupRoom(gId); };
    if (socket.connected) joinGroup();
    socket.on("connect", joinGroup);

    const handleMemberUpdate = (data) => {
      queryClient.invalidateQueries(["group", gId]);
      const isMyAction = data.actorId === currentUser?.id;
      if (data.action === "new_member") {
        if (!isMyAction) toast.success(`${data.member?.user?.name || "Member baru"} bergabung!`, { icon: "👋", id: `socket-join-${data.member?.user?.id}` });
      } else if (data.action === "kicked") {
        if (data.userId === currentUser?.id) {
          toast.error("Anda telah dikeluarkan dari grup.", { icon: "🚫", id: "socket-kicked-self", duration: 5000 });
          navigate("/dashboard/workspaces");
        } else {
          if (!isMyAction) toast(`${data.memberName || "Anggota"} dikeluarkan dari grup.`, { icon: "user-minus", id: `socket-kick-${data.userId}` });
        }
      }
    };

    const handleDocumentUpdate = (data) => {
      queryClient.invalidateQueries(["group", gId]);
      const myId = String(userIdRef.current || "");
      const actorId = String(data.actorId || "");
      if (myId && actorId && myId === actorId) return;

      const docId = data.document?.id || "unknown";
      if (data.action === "new_document") {
        const name = data.uploaderName || "Admin";
        toast.success(`${name} mengupload dokumen baru`, { icon: "📄", id: `socket-new-doc-${docId}` });
      } else if (data.action === "removed_document") {
        const name = data.uploaderName || "Admin";
        const title = data.document?.title || "Dokumen";
        toast(`${name} menghapus dokumen "${title}"`, { icon: "🗑️", id: `socket-del-doc-${data.document?.id || data.documentId}` });
      } else if (data.action === "finalized") {
        toast.success("Dokumen selesai difinalisasi!", { icon: "✅", id: `socket-final-doc-${docId}` });
      }
    };

    const handleInfoUpdate = (data) => {
      queryClient.setQueryData(["group", gId], (old) => { if (!old) return old; return { ...old, name: data.group.name }; });
      toast.success(`Nama grup diubah: ${data.group.name}`, { icon: "✏️", id: `socket-update-group-${data.group.id}` });
    };

    socketService.onGroupMemberUpdate(handleMemberUpdate);
    socketService.onGroupDocumentUpdate(handleDocumentUpdate);
    socketService.onGroupInfoUpdate(handleInfoUpdate);

    return () => {
      socket.off("connect", joinGroup);
      socketService.leaveGroupRoom(gId);
      socketService.offGroupMemberUpdate(handleMemberUpdate);
      socketService.offGroupDocumentUpdate(handleDocumentUpdate);
      socketService.offGroupInfoUpdate(handleInfoUpdate);
    };
  }, [groupId, queryClient, currentUser, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] gap-4 bg-slate-50 dark:bg-slate-900/50">
        <ImSpinner9 className="animate-spin h-12 w-12 text-blue-600" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Memuat detail grup...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col mx-auto max-w-screen-xl px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* 1. HEADER GRUP MODERN */}
      <div className="flex-none bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 mb-5 overflow-hidden">
        {/* Background Accent Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                  {group.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2 overflow-hidden">
                     {/* Avatar Admin Mini */}
<UserAvatar 
        user={group.admin} 
        className="h-6 w-6 text-[10px] ring-2 ring-white dark:ring-slate-800" 
     />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Dikelola oleh <span className="font-semibold text-slate-700 dark:text-slate-200">{group.admin.name}</span>
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-2 sm:px-7 border-t border-slate-100 dark:border-slate-700/50">
          <nav className="flex space-x-1 min-w-max sm:min-w-0">
            <TabButton 
              icon={<HiOutlineDocumentText className="w-5 h-5" />} 
              label="Dokumen" 
              count={group.documents?.length || 0} 
              isActive={currentTab === "documents"} 
              onClick={() => setCurrentTab("documents")} 
            />
            <TabButton 
              icon={<HiOutlineUsers className="w-5 h-5" />} 
              label="Anggota" 
              count={group.members?.length || 0} 
              isActive={currentTab === "members"} 
              onClick={() => setCurrentTab("members")} 
            />
            {currentUser && group.adminId === currentUser.id && (
              <TabButton 
                icon={<HiOutlineCog className="w-5 h-5" />} 
                label="Pengaturan" 
                isActive={currentTab === "settings"} 
                onClick={() => setCurrentTab("settings")} 
              />
            )}
          </nav>
        </div>
      </div>

      {/* 2. KONTEN TAB UTAMA */}
      <div className="flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        {currentTab === "documents" && currentUser && <GroupDocuments documents={group.documents || []} groupId={group.id} members={group.members || []} currentUserId={currentUser.id} />}

        {currentTab === "members" && currentUser && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
            <GroupMembers members={group.members || []} groupId={group.id} adminId={group.adminId} />
          </div>
        )}

        {currentTab === "settings" && currentUser && group.adminId === currentUser.id && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 h-full overflow-y-auto">
            <GroupSettings group={group} currentUserId={currentUser.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;