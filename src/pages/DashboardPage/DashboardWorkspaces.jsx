/* eslint-disable no-unused-vars */
// File: src/pages/DashboardPage/DashboardWorkspaces.jsx

import React, { useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { FaSpinner, FaUsers, FaHandshake, FaWhatsapp, FaBolt, FaFileSignature, FaArrowRight } from "react-icons/fa";
import { HiLockClosed, HiPlus } from "react-icons/hi";
import { toast } from "react-hot-toast";

import CreateGroupModal from "../../components/CreateGroupModal/CreateGroupModal";
import { useGetGroups, useCreateGroup } from "../../hooks/Group/useGroups";

// --- 1. KOMPONEN: UPGRADE BANNER (PROFESIONAL - CLEAN DESIGN) ---
const UpgradeBanner = () => (
  <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6 group isolate">
    {/* Background Glow yang Halus & Elegan */}
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent blur-[100px] -z-10 pointer-events-none"></div>
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-900/10 to-transparent blur-[80px] -z-10 pointer-events-none"></div>

    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6">
      <div className="flex-1 text-center md:text-left">
        {/* Badge Label Sederhana */}
        <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-3">Limit Akses Free</div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          Beralih ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">Premium Workspace</span>
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
          Hilangkan batasan limit Anda. Dapatkan <strong>100 Slot Dokumen</strong>, <strong>10 Workspace</strong>, dan <strong>Anggota Tim Tak Terbatas</strong>.
        </p>
      </div>

      <div className="flex-shrink-0">
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          <span>Upgrade Sekarang</span>
          <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  </div>
);

// --- 2. KOMPONEN: INFO CARD LAMA (Desain Biru Favorit Anda) ---
const WorkspaceInfoCard = () => {
  return (
    <div
      className="mb-8 relative overflow-hidden rounded-2xl 
      bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700
      dark:from-slate-900 dark:via-blue-950 dark:to-slate-900
      dark:border dark:border-blue-500/30 dark:shadow-blue-900/20
      px-6 py-5 text-white shadow-lg shadow-blue-500/20 animate-fade-in transition-colors duration-300"
    >
      {/* Dekorasi Background: Efek Gelombang Halus */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-cyan-400 opacity-20 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* BAGIAN KIRI: Teks & Fitur */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
              Kolaborasi di <span className="text-cyan-100 drop-shadow-sm">Workspace</span>
            </h2>
            {/* Tag New / Info Kecil */}
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold border border-white/20 backdrop-blur-sm">FITUR BARU</span>
          </div>

          <p className="text-blue-50 dark:text-slate-300 text-sm mb-5 leading-relaxed font-medium max-w-2xl opacity-90">
            Kelola dokumen tim dan persetujuan dalam satu tempat. Nikmati fitur <strong>Live Signing</strong> dan notifikasi instan via <strong>WhatsApp</strong>.
          </p>

          {/* FITUR HORIZONTAL (Pills) */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaUsers className="text-cyan-200 text-xs" />
              <span className="text-xs font-semibold">Tim Terpusat</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaFileSignature className="text-cyan-200 text-xs" />
              <span className="text-xs font-semibold">TTD Kolektif</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaBolt className="text-yellow-300 text-xs" />
              <span className="text-xs font-semibold">Live Status</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaWhatsapp className="text-green-300 text-xs" />
              <span className="text-xs font-semibold">Notifikasi WA</span>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: Ilustrasi */}
        <div className="hidden md:flex flex-shrink-0 relative pr-4">
          <div className="absolute inset-0 bg-white blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <FaHandshake className="relative z-10 text-[7rem] text-white/20 dark:text-cyan-500/20 -rotate-12 transform transition-transform duration-700 hover:rotate-0 drop-shadow-xl" />
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const DashboardWorkspaces = ({ theme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Ambil Context User
  const context = useOutletContext();
  const user = context?.user;

  const { data: groups, isLoading, error } = useGetGroups();
  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateGroup();

  // Logic Limit Grup (Free: 1, Premium: 10)
  const isPremium = user?.userStatus === "PREMIUM" || user?.userStatus === "PREMIUM_YEARLY";
  const MAX_GROUPS = isPremium ? 10 : 1;
  const currentGroupCount = groups?.length || 0;
  const isLimitReached = currentGroupCount >= MAX_GROUPS;

  const handleOpenCreateModal = () => {
    if (isLimitReached) {
      if (!isPremium) {
        toast.error("Free Tier hanya bisa membuat 1 Workspace.", { icon: "🔒" });
      } else {
        toast.error("Batas maksimum 10 Workspace tercapai.", { icon: "🔒" });
      }
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateGroup = (groupDataFromModal) => {
    if (!groupDataFromModal || !groupDataFromModal.name) return;
    createGroup(groupDataFromModal.name, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-transparent min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Memuat workspaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full p-8 flex justify-center">
        <div className="w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
          <p className="font-bold">Gagal Memuat Data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      <div id="tab-workspaces" className="mx-auto max-w-screen-xl px-4 pt-6 pb-24 sm:px-6 lg:px-8">
        {/* LOGIKA TAMPILAN:
            1. Jika FREE: Tampilkan Upgrade Banner (Atas) + Info Card Biru (Bawah)
            2. Jika PREMIUM: Hanya tampilkan Info Card Biru
        */}
        {!isPremium && <UpgradeBanner />}
        <WorkspaceInfoCard />

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700/60 pb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Daftar Grup
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  isLimitReached
                    ? "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                {currentGroupCount} / {MAX_GROUPS}
              </span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pilih grup untuk mulai bekerja.</p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            disabled={isCreatingGroup}
            className={`
                flex items-center gap-2 font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all duration-300 w-full sm:w-auto hover:-translate-y-0.5 active:scale-95 text-sm
                ${
                  isLimitReached
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 shadow-none"
                    : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-blue-500/20"
                }
            `}
          >
            {isCreatingGroup ? (
              <FaSpinner className="animate-spin h-4 w-4" />
            ) : isLimitReached ? (
              <HiLockClosed className="h-4 w-4" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{isLimitReached ? (isPremium ? "Batas Tercapai" : "Limit Free Penuh") : "Buat Grup Baru"}</span>
          </button>
        </div>

        {/* Grid Card List (Desain Lama dengan Sentuhan Premium) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              <Link
                key={group.id}
                to={`../group/${group.id}`}
                className="group relative flex flex-col justify-between bg-white dark:bg-slate-800/40 backdrop-blur-sm 
                           border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 
                           min-h-[160px] transition-all duration-300
                           hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5
                           hover:border-blue-300 dark:hover:border-blue-500/40 hover:-translate-y-1"
              >
                {/* Accent Gradient Line (Muncul saat hover) */}
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Header Card */}
                <div className="relative z-10 pl-2">
                  <div className="flex justify-between items-start mb-3">
                    {/* Icon Box */}
                    <div
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 
                                    group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-400 group-hover:text-white 
                                    transition-all duration-300 shadow-sm"
                    >
                      <FaUsers className="text-lg" />
                    </div>

                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2">{group.name}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 pr-2">{group.description || "Ruang kerja kolaborasi tim."}</p>
                </div>

                {/* Footer Card */}
                <div className="relative z-10 mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between pl-2">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <FaFileSignature className="text-sm" />
                    <span className="font-bold">{group.docs_count || 0}</span>
                    <span className="hidden sm:inline">Dokumen</span>
                  </div>

                  <div className="flex items-center -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">A</div>
                    <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/50 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-pink-600 dark:text-pink-300 font-bold">B</div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] text-slate-600 dark:text-slate-300 font-bold">
                      +{group.members_count || 1}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Empty State
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3 shadow-inner">
                <FaUsers className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">Belum ada Workspace</h4>
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1 max-w-xs">Buat grup baru di atas untuk mulai berkolaborasi.</p>
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGroupCreate={handleCreateGroup} isLoading={isCreatingGroup} theme={theme} currentGroupCount={currentGroupCount} />
    </div>
  );
};

export default DashboardWorkspaces;
