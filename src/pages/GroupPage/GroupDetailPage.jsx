/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { useGetGroupById } from "../../hooks/useGroups";

// Import komponen-komponen anak (diasumsikan sudah benar)
import { GroupDocuments } from "./GroupDocuments";
import { GroupMembers } from "./GroupMembers";
import { GroupSettings } from "./GroupSettings";

// Icon yang digunakan
import { HiOutlineDocumentText, HiOutlineUsers, HiOutlineCog } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";

// --- Komponen TabButton yang Diperbarui ---
// Dibuat lebih modern dengan fokus pada hover/active state dan sedikit padding
const TabButton = ({ icon, label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center sm:justify-start gap-2 py-3 px-4 sm:px-0 border-b-2 font-semibold text-sm w-full sm:w-auto
      transition-all duration-200 rounded-t-lg sm:rounded-none
      ${isActive 
        ? "border-blue-600 bg-blue-50 dark:bg-slate-700/50 text-blue-700 dark:text-blue-300" 
        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600"}
      sm:hover:bg-transparent sm:bg-transparent
    `}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label}</span> {/* Tampilkan label penuh di mobile */}
    </div>
    
    {typeof count !== "undefined" && (
      <span
        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-bold
          ${isActive 
            ? "bg-blue-600 text-white dark:bg-blue-500/80" 
            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}
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
  // Menggunakan 'group' sebagai alias untuk data
  const { data: group, isLoading, error } = useGetGroupById(Number(groupId)); 
  const [currentTab, setCurrentTab] = useState("documents");

  // Periksa apakah pengguna adalah admin grup
  const isAdmin = group && currentUser && group.adminId === currentUser.id;

  // --- State Loading ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen-minus-header gap-4 bg-slate-50 dark:bg-slate-900/50">
        <ImSpinner9 className="animate-spin h-12 w-12 text-blue-600" />
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Memuat detail grup...</p>
      </div>
    );
  }

  // --- State Error ---
  if (error) {
    return (
      <div className="flex justify-center items-center py-20 px-4 bg-slate-50 dark:bg-slate-900/50 min-h-screen-minus-header">
        <div className="max-w-xl w-full text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-red-200 dark:border-red-800">
          <h2 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mb-3">Terjadi Kesalahan!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Grup tidak dapat dimuat. Grup mungkin telah dihapus atau Anda tidak memiliki izin.
            <br />
            Detail: <span className="font-mono text-sm text-red-500 dark:text-red-300">{error.message}</span>
          </p>
          <Link 
            to="/dashboard/workspaces" 
            className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Kembali ke Daftar Grup
          </Link>
        </div>
      </div>
    );
  }

  // --- Tampilan Utama Grup ---
  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* HEADER GRUP DAN NAVIGASI TAB */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 mb-6">
        
        {/* Detail Dasar Grup */}
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white truncate">
            {group.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Dikelola oleh:
            <span className="font-medium text-blue-600 dark:text-blue-400 ml-1"> {group.admin.name}</span>
          </p>
        </div>

        {/* Navigasi Tab (Lebih responsive) */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-8">
          <nav className="flex space-x-0 sm:space-x-8 -mb-px overflow-x-auto" aria-label="Tabs">
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
            {/* Hanya tampilkan Pengaturan jika pengguna adalah admin atau memiliki izin */}
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

      {/* KONTEN UTAMA TAB */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 min-h-[500px] border border-slate-100 dark:border-slate-700">
        
        {/* Tab Dokumen */}
        {currentTab === "documents" && currentUser && (
          <GroupDocuments 
            documents={group.documents || []} 
            groupId={group.id} 
            members={group.members || []} 
            currentUserId={currentUser.id} 
          />
        )}

        {/* Tab Anggota */}
        {currentTab === "members" && currentUser && (
          <GroupMembers
            members={group.members || []}
            groupId={group.id}
            adminId={group.adminId}
            currentUserId={currentUser.id} // Ditambahkan untuk konsistensi
          />
        )}

        {/* Tab Pengaturan (Hanya untuk Admin) */}
        {currentTab === "settings" && currentUser && group.adminId === currentUser.id && (
          <GroupSettings 
            group={group} 
            currentUserId={currentUser.id} 
          />
        )}
      </div>
    </div>
  );
};

// Ekspor komponen utama
export default GroupDetailPage;