import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import ReportForm from "../Report/ReportForm"; // Import ReportForm
import { HiChevronDown, HiChevronRight, HiStar, HiClock, HiExclamationCircle } from "react-icons/hi";

import logoWhite from "../../assets/images/WeSignLightMode.png";
import logoDark from "../../assets/images/WeSignDarkMode.png";

const Sidebar = ({ userName, userEmail, userAvatar, isOpen, activePage, onClose, theme, isPremium, premiumUntil }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // State untuk Report Modal
  const [imgError, setImgError] = useState(false); // Fix: State untuk handle error gambar

  // --- EFFECT: Auto Open Dropdown berdasarkan URL ---
  useEffect(() => {
    const path = location.pathname;

    // Logic Workspace
    if (path.startsWith("/dashboard/group") || path.startsWith("/dashboard/workspaces")) {
      setIsWorkspaceOpen(true);
    }

    // Logic Documents
    if (path.startsWith("/dashboard/documents") || path.startsWith("/dashboard/packages")) {
      setIsDocumentsOpen(true);
    }
  }, [location.pathname]);

  // --- DATA MENU ---
  const navLinks = [
    {
      id: "shortcuts",
      path: "/dashboard/shortcuts",
      label: "Pintasan",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "overview",
      path: "/dashboard",
      label: "Overview",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l1-1a1 1 0 011.414 0l1 1V17a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293-.293a1 1 0 000-1.414l-7-7z" />
        </svg>
      ),
    },

    // --- MENU DOKUMEN (Dengan Path Parent) ---
    {
      id: "documents",
      label: "File & Dokumen",
      path: "/dashboard/documents", // 🔥 Path Parent
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      ),
      children: [
        { id: "doc-personal", path: "/dashboard/documents/personal", label: "Arsip Pribadi" },
        { id: "doc-group", path: "/dashboard/documents/group", label: "Arsip Grup" },
        { id: "doc-packages", path: "/dashboard/packages", label: "Riwayat Paket" },
      ],
    },

    // --- MENU WORKSPACE ---
    {
      id: "workspaces",
      label: "Workspace",
      // Workspace tidak punya path parent (hanya toggle)
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      ),
      children: [{ id: "workspace-list", path: "/dashboard/workspaces", label: "Daftar Grup" }],
    },
    {
      id: "history",
      path: "/dashboard/history",
      label: "Aktivitas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "profile",
      path: "/dashboard/profile",
      label: "Profil",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  // --- HANDLERS ---
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

  const toggleDropdown = (id) => {
    if (id === "workspaces") setIsWorkspaceOpen(!isWorkspaceOpen);
    if (id === "documents") setIsDocumentsOpen(!isDocumentsOpen);
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* SIDEBAR MAIN CONTAINER */}
      <div
        className={`w-64 h-[100dvh] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-white/10 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* === 1. BAGIAN LOGO === */}
        <div className="px-4 pt-6 pb-2 shrink-0 bg-white dark:bg-slate-900 z-10">
          <img src={theme === "dark" ? logoDark : logoWhite} alt="Signify Logo" className="h-30 w-auto ml-2" />
        </div>

        {/* === 2. BAGIAN MENU === */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 space-y-2 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {navLinks.map((link) => {
            // Logic Active State (Parent)
            const isActive = activePage === link.id || (link.children && link.children.some((child) => location.pathname.startsWith(child.path))) || (link.id === "documents" && location.pathname.startsWith("/dashboard/packages"));

            // --- RENDER JIKA MEMILIKI SUB-MENU (Documents & Workspaces) ---
            if (link.children) {
              const isDropdownOpen = link.id === "workspaces" ? isWorkspaceOpen : isDocumentsOpen;

              return (
                <div key={link.id} className="space-y-1">
                  <button
                    id={`sidebar-nav-${link.id}`}
                    onClick={() => {
                      // 1. Toggle Dropdown (selalu)
                      toggleDropdown(link.id);

                      // 2. 🔥 PERBAIKAN UTAMA: Jika punya path, navigasi juga!
                      if (link.path) {
                        handleLinkClick(link.path);
                      }
                    }}
                    className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg font-semibold transition-colors ${isActive ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.label}</span>
                    </div>
                    {isDropdownOpen ? <HiChevronDown className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />}
                  </button>

                  {/* Render Anak Menu */}
                  {isDropdownOpen && (
                    <div className="pl-4 space-y-1 animate-fade-in">
                      {link.children.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleLinkClick(child.path)}
                            className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isChildActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isChildActive ? "bg-white" : "bg-slate-400"}`}></span>
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // --- RENDER MENU BIASA (Tanpa Sub-menu) ---
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.path)}
                className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-lg font-semibold transition-colors ${isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}

          {/* --- INFO PREMIUM --- */}
          {isPremium && premiumUntil && (
            <div className="mt-4 mb-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-1">
                <HiStar className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Premium Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-500/80">
                <HiClock className="w-3 h-3" />
                <span>
                  Berakhir: <b>{formatExpiryDate(premiumUntil)}</b>
                </span>
              </div>
            </div>
          )}

          {/* --- INFO UPGRADE (FREE USER) --- */}
          {!isPremium && (
            <div className="mt-4 mb-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                <p className="text-xs font-bold mb-1 opacity-80 uppercase tracking-widest">Upgrade Pro</p>
                <p className="text-[10px] leading-tight mb-3 font-medium">Dapatkan akses tak terbatas dan legalitas penuh.</p>
                <button onClick={() => handleLinkClick("/pricing")} className="w-full py-2 bg-white text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm">
                  Upgrade Sekarang
                </button>
              </div>
            </div>
          )}
        </div>

        <div id="sidebar-profile-section" className="p-4 pb-6 border-t border-slate-200/80 dark:border-white/10 shrink-0 z-20 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
            {/* Logic: 1. Jika ada URL & Tidak Error -> Render Img. 2. Jika Tidak ada URL atau Error -> Render Inisial */}
            {userAvatar && userAvatar.trim() !== "" && !imgError ? (
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userName ? userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "?"}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white truncate">{userName || "Loading..."}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || "..."}</p>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-2 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>

          {/* Tombol Lapor Masalah (Dipindah ke Paling Bawah) */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm"
          >
            <HiExclamationCircle className="w-4 h-4" />
            <span>Lapor Masalah</span>
          </button>
        </div>
      </div>

      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmLogout} title="Konfirmasi Logout" message="Apakah Anda yakin ingin keluar?" confirmText="Ya, Logout" theme={theme} />

      {/* Report Modal */}
      {isReportModalOpen && <ReportForm onClose={() => setIsReportModalOpen(false)} />}

    </>
  );
};

export default Sidebar;