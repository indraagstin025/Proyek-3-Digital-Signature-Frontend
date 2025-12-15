// File: src/pages/DashboardPage/DashboardWorkspaces.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa"; // Opsional: Untuk icon loading cantik
import CreateGroupModal from "../../components/CreateGroupModal/CreateGroupModal";
import { useGetGroups, useCreateGroup } from "../../hooks/useGroups";

const DashboardWorkspaces = ({ theme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook Data
  const { data: groups, isLoading, error } = useGetGroups();
  
  // Hook Mutation
  const { mutate: createGroup, isLoading: isCreatingGroup } = useCreateGroup();

  const handleCreateGroup = (groupDataFromModal) => {
    if (!groupDataFromModal || !groupDataFromModal.name) return;
    createGroup(groupDataFromModal.name, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  // 1. Loading State (Full Height Center)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-transparent">
        <div className="flex flex-col items-center gap-3">
            {/* Gunakan FaSpinner atau LoadingSpinner component anda */}
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
            <p className="text-slate-500 text-sm font-medium animate-pulse">Memuat workspaces Anda...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="h-full w-full p-8 flex justify-center">
        <div className="w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
          <p className="font-bold mb-1">Gagal Memuat Data</p>
          <p className="text-sm">Terjadi kesalahan: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    // SOLUSI: WRAPPER SCROLLABLE
    // Pastikan ini menggantikan Fragment <>...</>
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      
      {/* Container Konten 
          - pt-6: Cukup kecil karena header parent sudah turun 80px
          - pb-24: Jarak bawah lega
      */}
      <div id="tab-workspaces" className="mx-auto max-w-screen-xl px-4 pt-6 pb-24 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Workspace Anda</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Berkolaborasi dengan tim dalam grup kerja.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isCreatingGroup}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingGroup ? (
                <FaSpinner className="animate-spin h-5 w-5" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            )}
            <span>{isCreatingGroup ? "Membuat..." : "Buat Grup Baru"}</span>
          </button>
        </div>

        {/* Grid Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              <Link
                key={group.id}
                to={`../group/${group.id}`} // Relative path navigation
                className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl 
                           flex flex-col justify-between min-h-[200px] transition-all duration-300 
                           hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1"
              >
                {/* Decorative Pattern Background (Optional) */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5z"/></svg>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {group.name}
                  </h4>
                  {/* Placeholder Deskripsi jika API belum ada */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {group.description || "Workspace kolaborasi tim."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">{group.docs_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{group.members_count || 1}</span>
                    </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-3">
                 <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-200">Belum ada Workspace</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm">
                Mulai dengan membuat grup baru untuk berkolaborasi dengan tim Anda.
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreate={handleCreateGroup}
        isLoading={isCreatingGroup}
        theme={theme}
      />
    </div>
  );
};

export default DashboardWorkspaces;