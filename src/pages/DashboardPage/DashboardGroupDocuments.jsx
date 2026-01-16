import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 🔥 UPDATE IMPORT ICON: Gunakan FA agar konsisten dengan Search Bar & Halaman Workspace
import { FaUsers, FaSearch, FaSpinner, FaBuilding, FaFileAlt, FaPenNib, FaEye } from "react-icons/fa";
import { HiCheckCircle, HiExclamation, HiUserGroup } from "react-icons/hi";

// Hooks
import { useDashboardDocuments } from "../../hooks/Documents/useDashboardDocuments";

const DashboardGroupDocuments = () => {
  const navigate = useNavigate();
  
  // 1. Ambil data global (Semua Dokumen Grup)
  const {
    groupDocuments,
    isLoading,
    isSearching,
    currentUser,
    searchQuery,
    setSearchQuery
  } = useDashboardDocuments();

  const pageTitle = "Arsip Grup";
  const pageDescription = "Kumpulan dokumen dari seluruh workspace tim Anda.";
  
  // 🔥 UPDATE ICON BOX (Agar sama dengan Workspace)
  const pageIcon = (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-center shadow-sm">
        <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-500"/>
    </div>
  );

  const handleNavigate = (doc) => {
    navigate(`/documents/${doc.id}/group-sign`);
  };

  const handleGoToWorkspace = () => {
    navigate("/dashboard/workspaces");
  };

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar relative bg-transparent">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 px-3 sm:px-8 pt-2 sm:pt-4 pb-2">
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md -z-10 shadow-sm border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" />
        
        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            
            {/* Bagian Kiri */}
            <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2">
                <div className="flex items-center gap-3">
                    {pageIcon}
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                            {pageTitle}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{pageDescription}</p>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div className="relative w-full sm:max-w-md group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearching ? <FaSpinner className="animate-spin text-blue-500"/> : <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors"/>}
                   </div>
                   <input 
                    type="text" 
                    placeholder="Cari dokumen grup..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
                   />
                </div>
            </div>

            {/* Bagian Kanan */}
            <div className="flex shrink-0">
               <button
                onClick={handleGoToWorkspace}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-5 rounded-lg shadow-sm shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
               >
                 <FaBuilding className="text-xs" /> 
                 <span>Ke Workspace</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="px-3 sm:px-8 pb-32 max-w-7xl mx-auto mt-2 sm:mt-4">
        {isLoading && groupDocuments.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20">
             <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
             <span className="text-slate-500">Memuat arsip grup...</span>
           </div>
        )}

        {!isLoading && groupDocuments.length === 0 && (
           <div className="text-center py-20 px-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
             <div className="bg-slate-50 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <FaUsers className="text-2xl text-blue-400" />
             </div>
             <h4 className="text-lg font-bold text-slate-800 dark:text-white">
               {searchQuery ? "Tidak ditemukan" : "Belum Ada Dokumen Grup"}
             </h4>
             <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
               {searchQuery ? `Hasil pencarian "${searchQuery}" tidak ditemukan.` : "Anda belum memiliki dokumen di grup manapun."}
             </p>
           </div>
        )}

        {!isLoading && groupDocuments.length > 0 && (
          <ul className="grid grid-cols-1 gap-3">
            {groupDocuments.map((doc) => {
              const signersList = doc.signerRequests || doc.groupSigners || [];
              const totalSigners = signersList.length;
              const signedCount = signersList.filter((s) => s.status === "SIGNED").length;
              const isDocCompleted = doc.status === "completed" || doc.status === "archived";
              const isAllSigned = totalSigners > 0 && signedCount === totalSigners;
              const isWaitingForFinalization = isAllSigned && !isDocCompleted;
              const myRequest = signersList.find((req) => req.userId === currentUser?.id);
              const myStatus = myRequest ? myRequest.status : null;
              const showSignButton = myStatus === "PENDING" && !isDocCompleted;
              const groupName = doc.group?.name || "Unknown Group";

              return (
                <li key={doc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                          <FaFileAlt className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link to={`/documents/${doc.id}/view`} className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 transition-colors block truncate">
                              {doc.title}
                            </Link>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 font-medium whitespace-nowrap">
                              {groupName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${isDocCompleted ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                              <span className="capitalize">{doc.status || "Draft"}</span> • {new Date(doc.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-3 sm:pl-[3rem]">
                        {showSignButton && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/60">Perlu TTD</span>}
                        {(myStatus === "SIGNED" || isDocCompleted) && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <HiCheckCircle className="w-3.5 h-3.5" /> {isDocCompleted ? "Selesai" : "Sudah TTD"}
                          </span>
                        )}
                        {isWaitingForFinalization && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-50 text-yellow-700 border border-yellow-200/60">
                            <HiExclamation className="w-3.5 h-3.5" /> Finalisasi
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium">
                            <HiUserGroup className="w-3.5 h-3.5" /> {signedCount}/{totalSigners} Signed
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700 mt-2 sm:mt-0">
                      {showSignButton ? (
                        <button onClick={() => handleNavigate(doc)} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                          <FaPenNib className="w-3 h-3" /> <span>TTD Sekarang</span>
                        </button>
                      ) : (
                        <Link to={`/documents/${doc.id}/view`} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 transition-colors">
                          <FaEye className="w-4 h-4" /> <span>Lihat</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardGroupDocuments;