/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { useGetGroupById } from "../../hooks/useGroups";
import { GroupDocuments } from "./GroupDocuments";
import { GroupMembers } from "./GroupMembers";
import { GroupSettings } from "./GroupSettings";
import { HiOutlineDocumentText, HiOutlineUsers, HiOutlineCog } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";

// ✅ Komponen TabButton: Teks disembunyikan di mobile (hanya icon) agar muat, kecuali jika aktif
const TabButton = ({ icon, label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center sm:justify-start gap-2 py-3 px-4 border-b-2 font-semibold text-sm flex-1 sm:flex-none
      transition-all duration-200 
      ${
        isActive
          ? "border-blue-600 bg-blue-50 dark:bg-slate-700/50 text-blue-700 dark:text-blue-300"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600"
      }
    `}
  >
    <div className="flex items-center gap-2">
      {icon}
      {/* Trik responsif: Di mobile label muncul hanya jika space cukup, atau sembunyikan jika mau minimalis */}
      <span className={`${isActive ? "inline" : "hidden"} sm:inline`}>{label}</span>
    </div>

    {typeof count !== "undefined" && (
      <span
        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-bold
          ${isActive ? "bg-blue-600 text-white dark:bg-blue-500/80" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}
        `}
      >
        {count}
      </span>
    )}
  </button>
);

const GroupDetailPage = ({ theme }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useOutletContext();
  const { data: group, isLoading, error } = useGetGroupById(Number(groupId));
  const [currentTab, setCurrentTab] = useState("documents");

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] gap-4 bg-slate-50 dark:bg-slate-900/50">
        <ImSpinner9 className="animate-spin h-12 w-12 text-blue-600" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Memuat detail grup...</p>
      </div>
    );
  }

  if (error) {
    // Error component (sama seperti sebelumnya, dipersingkat di sini)
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>; 
  }

  return (
    // ✅ CONTAINER UTAMA: 
    // px-2 (mobile) -> px-8 (desktop) agar di HP space-nya lebih maksimal
    <div className="h-[calc(100vh-64px)] flex flex-col mx-auto max-w-screen-xl px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* 1. HEADER GRUP */}
      <div className="flex-none bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-3 sm:mb-4">
        <div className="p-4 sm:p-6">
          {/* Judul responsif: text-2xl di HP, 3xl di Desktop */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">{group.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-2">
            Dikelola oleh: <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">{group.admin.name}</span>
          </p>
        </div>

        {/* Tab Navigation Wrapper: overflow-x-auto agar bisa digeser di layar sangat kecil */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-2 sm:px-6 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-6 -mb-px min-w-max sm:min-w-0">
            <TabButton icon={<HiOutlineDocumentText className="w-5 h-5" />} label="Dokumen" count={group.documents?.length || 0} isActive={currentTab === "documents"} onClick={() => setCurrentTab("documents")} />
            <TabButton icon={<HiOutlineUsers className="w-5 h-5" />} label="Anggota" count={group.members?.length || 0} isActive={currentTab === "members"} onClick={() => setCurrentTab("members")} />
            {currentUser && group.adminId === currentUser.id && <TabButton icon={<HiOutlineCog className="w-5 h-5" />} label="Pengaturan" isActive={currentTab === "settings"} onClick={() => setCurrentTab("settings")} />}
          </nav>
        </div>
      </div>

      {/* 2. KONTEN TAB UTAMA */}
      <div className="flex-1 min-h-0 relative">
        {currentTab === "documents" && currentUser && (
            <GroupDocuments 
                documents={group.documents || []} 
                groupId={group.id} 
                members={group.members || []} 
                currentUserId={currentUser.id} 
            />
        )}

        {currentTab === "members" && currentUser && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
                <GroupMembers members={group.members || []} groupId={group.id} adminId={group.adminId} />
            </div>
        )}

        {currentTab === "settings" && currentUser && group.adminId === currentUser.id && (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 h-full overflow-y-auto">
                <GroupSettings group={group} currentUserId={currentUser.id} />
             </div>
        )}
      </div>

    </div>
  );
};

export default GroupDetailPage;