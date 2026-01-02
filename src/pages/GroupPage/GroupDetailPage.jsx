// File: pages/GroupDetail/GroupDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useGetGroupById } from "../../hooks/Group/useGroups";
import { socketService } from "../../services/socketService";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";

import { GroupDocuments } from "./GroupDocuments";
import { GroupMembers } from "./GroupMembers";
import { GroupSettings } from "./GroupSettings";
import { HiOutlineDocumentText, HiOutlineUsers, HiOutlineCog } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";

// --- KOMPONEN TAB BUTTON (Tidak Berubah) ---
const TabButton = ({ icon, label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative group flex items-center justify-center sm:justify-start gap-2.5 py-4 px-5 font-medium text-sm flex-1 sm:flex-none
      transition-all duration-300 ease-out
      ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}
    `}
  >
    <div className={`relative z-10 flex items-center gap-2 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
      {icon}
      <span className={`${isActive ? "inline font-bold" : "hidden sm:inline"}`}>{label}</span>
    </div>
    {typeof count !== "undefined" && (
      <span
        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-all
          ${isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 translate-x-1" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}
        `}
      >
        {count}
      </span>
    )}
    {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full shadow-[0_-2px_6px_rgba(59,130,246,0.4)]"></span>}
  </button>
);

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useOutletContext();
  const queryClient = useQueryClient();

  // Fetch Data Group
  const { data: group, isLoading, error } = useGetGroupById(Number(groupId));

  const [currentTab, setCurrentTab] = useState("documents");

  // Simpan currentUser.id di ref untuk menghindari re-subscribe socket
  const currentUserIdRef = React.useRef(currentUser?.id);
  React.useEffect(() => {
    currentUserIdRef.current = currentUser?.id;
  }, [currentUser?.id]);

  // --- SOCKET IO LOGIC ---
  useEffect(() => {
    if (!groupId) return;

    const socket = socketService.connect();
    const gId = Number(groupId);

    const joinGroup = () => {
      socketService.joinGroupRoom(gId);
    };

    if (socket.connected) joinGroup();
    socket.on("connect", joinGroup);

    // Event Handlers
    const handleMemberUpdate = () => queryClient.invalidateQueries(["group", gId]);
    const handleDocumentUpdate = (data) => {
      queryClient.invalidateQueries(["group", gId]);

      // Cek apakah user saat ini adalah actor (gunakan actorId dari backend)
      const isActor = data.actorId && currentUserIdRef.current === data.actorId;

      // Lookup nama dari cache group members
      const groupData = queryClient.getQueryData(["group", gId]);
      const actorMember = groupData?.members?.find((m) => m.userId === data.actorId);
      const actorName = actorMember?.user?.name || data.uploaderName || "Anggota";

      if (data.action === "new_document" && !isActor) {
        toast.success(`${actorName} menambahkan dokumen baru.`, {
          id: `new-doc-${data.document?.id || Date.now()}`,
        });
      } else if (data.action === "removed_document" && !isActor) {
        // Backend mengirim action "removed_document" saat delete
        const docTitle = data.document?.title || data.documentTitle || "Dokumen";
        toast.success(`${actorName} menghapus dokumen "${docTitle}".`, {
          id: `delete-doc-${data.document?.id || data.documentId || Date.now()}`,
          icon: "🗑️",
        });
      } else if (data.action === "finalized" && !isActor) {
        // Gunakan ID yang sama dengan hook useFinalizeDocument agar tidak duplicate
        const docId = data.document?.id || data.documentId;
        toast.success(`Dokumen "${data.document?.title || "Dokumen"}" telah difinalisasi!`, {
          id: `finalize-${docId}`,
          icon: "✅",
        });
      }
    };
    const handleInfoUpdate = (data) => {
      queryClient.setQueryData(["group", gId], (old) => (old ? { ...old, name: data.group.name } : old));
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
  }, [groupId, queryClient]); // Hapus currentUser dari dependency

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] gap-4 bg-slate-50 dark:bg-slate-900/50">
        <ImSpinner9 className="animate-spin h-12 w-12 text-blue-600" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Memuat detail grup...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
        <h3 className="text-xl font-bold text-red-500 mb-2">Gagal memuat grup</h3>
        <p className="text-slate-500">{error.message || "Terjadi kesalahan saat mengambil data."}</p>
        <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col mx-auto max-w-screen-xl px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* 1. HEADER GRUP */}
      <div className="flex-none bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 mb-5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate tracking-tight">{group.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2 overflow-hidden">{group.admin && <UserAvatar user={group.admin} className="h-6 w-6 text-[10px] ring-2 ring-white dark:ring-slate-800" />}</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Dikelola oleh <span className="font-semibold text-slate-700 dark:text-slate-200">{group.admin?.name || "Admin"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-2 sm:px-7 border-t border-slate-100 dark:border-slate-700/50">
          <nav className="flex space-x-1 min-w-max sm:min-w-0">
            <TabButton icon={<HiOutlineDocumentText className="w-5 h-5" />} label="Dokumen" count={group.documents?.length || 0} isActive={currentTab === "documents"} onClick={() => setCurrentTab("documents")} />
            <TabButton icon={<HiOutlineUsers className="w-5 h-5" />} label="Anggota" count={group.members?.length || 0} isActive={currentTab === "members"} onClick={() => setCurrentTab("members")} />
            {currentUser && group.adminId === currentUser.id && <TabButton icon={<HiOutlineCog className="w-5 h-5" />} label="Pengaturan" isActive={currentTab === "settings"} onClick={() => setCurrentTab("settings")} />}
          </nav>
        </div>
      </div>

      {/* 2. KONTEN TAB UTAMA */}
      <div className="flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* TAB DOKUMEN */}
        {currentTab === "documents" && currentUser && (
          <GroupDocuments
            documents={group.documents || []}
            groupId={group.id}
            groupData={group} // [PENTING] Kirim data lengkap untuk cek limit
            members={group.members || []}
            currentUser={currentUser}
            currentUserId={currentUser.id}
          />
        )}

        {/* TAB ANGGOTA */}
        {currentTab === "members" && currentUser && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
            <GroupMembers
              members={group.members || []}
              groupId={group.id}
              adminId={group.adminId}
              groupData={group} // [PENTING] Tambahkan ini agar bisa cek limit member
            />
          </div>
        )}

        {/* TAB PENGATURAN */}
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
