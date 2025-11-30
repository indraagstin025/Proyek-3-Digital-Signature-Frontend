import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

import logoWhite from "../../assets/images/LogoLightMode.jpg";
import logoDark from "../../assets/images/LogoDarkMode.jpg";

const Sidebar = ({ userName, userEmail, userAvatar, isOpen, activePage, onClose, theme }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navLinks = [
    { id: "overview", path: "/dashboard", label: "Overview", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l1-1a1 1 0 011.414 0l1 1V17a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293-.293a1 1 0 000-1.414l-7-7z" /></svg> },
    { id: "documents", path: "/dashboard/documents", label: "Dokumen", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H9z" /><path d="M4 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" /></svg> },
    { id: "workspaces", path: "/dashboard/workspaces", label: "Workspace", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> },
    { id: "history", path: "/dashboard/history", label: "Riwayat", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg> },
    { id: "profile", path: "/dashboard/profile", label: "Profil", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg> }
  ];

  const handleLogoutClick = () => setIsModalOpen(true);

  const confirmLogout = async () => {
    await authService.logout();
    setIsModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        // PERBAIKAN DI SINI:
        // 1. Hapus 'h-[100dvh]' dan 'max-h-[100dvh]'
        // 2. Gunakan 'fixed inset-y-0 left-0'
        //    Ini artinya: "Tempel ke Atas (0), Bawah (0), dan Kiri (0)"
        className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-white/10 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        
        {/* 'flex-1' akan mengisi ruang yang tersisa antara logo dan footer
            'min-h-0' memastikan area ini BISA mengecil (shrink) dan memunculkan scrollbar 
             jika layar terlalu pendek */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          
          <div className="px-4 pt-6 mb-4">
            <img 
              src={theme === 'dark' ? logoDark : logoWhite} 
              alt="Signify Logo" 
              className="h-30 w-auto ml-2" 
            />
          </div>
          
          <div className="px-4 space-y-2 pb-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  navigate(link.path);
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-lg font-semibold transition-colors ${
                  activePage === link.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 'shrink-0' mencegah footer gepeng */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 shrink-0 z-20 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={userAvatar || `https://i.pravatar.cc/40?u=${userEmail}`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
            />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white truncate">{userName || 'Loading...'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || '...'}</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar?"
        confirmText="Ya, Logout"
        theme={theme}
      />
    </>
  );
};

export default Sidebar;