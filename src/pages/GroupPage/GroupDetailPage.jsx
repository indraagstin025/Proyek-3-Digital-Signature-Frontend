/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { useGetGroupById } from "../../hooks/useGroups";

import { GroupDocuments } from "./GroupDocuments";
import { GroupMembers } from "./GroupMembers";
import { GroupSettings } from "./GroupSettings";

import { HiOutlineDocumentText, HiOutlineUsers, HiOutlineCog } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";

const GroupDetailPage = ({ theme }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useOutletContext();
  const { data: group, isLoading, error } = useGetGroupById(Number(groupId));
  const [currentTab, setCurrentTab] = useState("documents");

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <ImSpinner9 className="animate-spin h-10 w-10 text-blue-500" />
        <p className="text-slate-500 dark:text-slate-400">Memuat detail grup...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="max-w-md w-full text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error: {error.message}</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">Grup mungkin telah dihapus atau Anda tidak memiliki izin untuk melihatnya.</p>
          <Link to="/dashboard/workspaces" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Kembali ke Daftar Grup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl pt-4 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md overflow-hidden mb-6 border border-slate-200/80 dark:border-slate-700/50">
        {/* Header Halaman Detail */}
        <div className="p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{group.name}</h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dikelola oleh:
            <span className="font-medium text-slate-700 dark:text-slate-300"> {group.admin.name}</span>
          </p>
        </div>

        {/* Navigasi Tab Internal (di dalam card) */}
        <div className="border-t border-slate-200 dark:border-slate-700">
          <nav className="flex -mb-px space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
            <TabButton icon={<HiOutlineDocumentText className="w-5 h-5" />} label="Dokumen" count={group.documents?.length || 0} isActive={currentTab === "documents"} onClick={() => setCurrentTab("documents")} />
            <TabButton icon={<HiOutlineUsers className="w-5 h-5" />} label="Anggota" count={group.members?.length || 0} isActive={currentTab === "members"} onClick={() => setCurrentTab("members")} />
            <TabButton icon={<HiOutlineCog className="w-5 h-5" />} label="Pengaturan" isActive={currentTab === "settings"} onClick={() => setCurrentTab("settings")} />
          </nav>
        </div>
      </div>

      {/* --- KONTEN TAB YANG SUDAH DIPERBAIKI --- */}
      <div className="min-h-[400px]">
        {/* Tab Dokumen (Sudah benar) */}
        {currentTab === "documents" && currentUser && <GroupDocuments documents={group.documents || []} groupId={group.id} members={group.members || []} currentUserId={currentUser.id} />}

        {/* ✅ PERBAIKAN 1: Tab Anggota */}
        {currentTab === "members" && currentUser && (
          <GroupMembers // <--- Seharusnya GroupMembers
            members={group.members || []}
            groupId={group.id}
            adminId={group.adminId}
            // 'currentUserId' tidak diperlukan karena GroupMembers menggunakan useOutletContext
            // tapi tidak apa-apa jika tetap ada.
          />
        )}

        {/* ✅ PERBAIKAN 2: Tab Pengaturan (Blok ini hilang) */}
        {currentTab === "settings" && currentUser && <GroupSettings group={group} currentUserId={currentUser.id} />}
      </div>
    </div>
  );
};

// --- Komponen TabButton (Tidak berubah) ---
const TabButton = ({ icon, label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm
      ${isActive ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"}
      transition-all duration-150
    `}
  >
    {icon}
    <span>{label}</span>
    {typeof count !== "undefined" && (
      <span
        className={`px-2 py-0.5 rounded-full text-xs
        ${isActive ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"}
      `}
      >
        {count}
      </span>
    )}
  </button>
);

export default GroupDetailPage;
