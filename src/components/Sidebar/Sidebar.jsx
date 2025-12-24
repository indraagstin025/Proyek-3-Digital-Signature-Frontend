import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";

import logoWhite from "../../assets/images/WeSignLightMode.png";
import logoDark from "../../assets/images/WeSignDarkMode.png";

const Sidebar = ({ userName, userEmail, userAvatar, isOpen, activePage, onClose, theme }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State dropdown workspace
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

  // Efek samping: Jika user masuk ke halaman detail grup, otomatis buka dropdown workspace
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/group")) {
      setIsWorkspaceOpen(true);
    }
  }, [location.pathname]);

  const navLinks = [

    { 
    id: "shortcuts", 
    path: "/dashboard/shortcuts", 
    label: "Pintasan", 
    // Ikon Grid / Menu
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> 
  },
    { 
      id: "overview", 
      path: "/dashboard", 
      label: "Overview", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l1-1a1 1 0 011.414 0l1 1V17a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293-.293a1 1 0 000-1.414l-7-7z" /></svg> 
    },
    { 
      id: "documents", 
      path: "/dashboard/documents", 
      label: "Dokumen", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H9z" /><path d="M4 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" /></svg> 
    },
    { 
      id: "workspaces", 
      label: "Workspace", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
      children: [
        { id: "workspace-list", path: "/dashboard/workspaces", label: "Daftar Grup" },
      ]
    },
    { 
      id: "history", 
      path: "/dashboard/history", 
      label: "Riwayat", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg> 
    },
    { 
      id: "profile", 
      path: "/dashboard/profile", 
      label: "Profil", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg> 
    }
  ];

  const handleLogoutClick = () => setIsModalOpen(true);

  const confirmLogout = async () => {
    await authService.logout();
    setIsModalOpen(false);
    navigate("/login");
  };

  const handleLinkClick = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
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
        className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-white/10 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          
          <div className="px-4 pt-6 mb-4">
            <img 
              src={theme === 'dark' ? logoDark : logoWhite} 
              alt="Signify Logo" 
              className="h-30 w-auto ml-2" 
            />
          </div>
          
          <div className="px-4 space-y-2 pb-4">
            {navLinks.map((link) => {
              // 🔥 LOGIKA BARU: Cek Active State
              const isActive = 
                activePage === link.id || 
                (link.children && link.children.some(child => location.pathname === child.path)) ||
                // Tambahan: Jika link adalah workspaces DAN kita sedang buka detail grup (/dashboard/group/...)
                (link.id === "workspaces" && location.pathname.startsWith("/dashboard/group"));

              if (link.children) {
                // RENDER PARENT WITH CHILDREN (WORKSPACE)
                return (
                  <div key={link.id} className="space-y-1">
                    <button
                      onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                      className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg font-semibold transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {link.icon}
                        <span>{link.label}</span>
                      </div>
                      {isWorkspaceOpen ? (
                        <HiChevronDown className="w-4 h-4" />
                      ) : (
                        <HiChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {isWorkspaceOpen && (
                      <div className="pl-4 space-y-1">
                        {link.children.map((child) => {
                           const isChildActive = location.pathname === child.path;
                           return (
                            <button
                              key={child.id}
                              onClick={() => handleLinkClick(child.path)}
                              className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                isChildActive
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isChildActive ? 'bg-white' : 'bg-slate-400'}`}></span>
                              <span>{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.path)}
                  className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-lg font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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