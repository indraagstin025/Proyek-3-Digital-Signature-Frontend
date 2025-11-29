import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService.js";
import ConfirmationModal from "../../shared/ConfirmationModal.jsx";
import logoWhite from "../../../assets/images/LogoLightMode.jpg";
import logoDark from "../../../assets/images/LogoDarkMode.jpg";

const AdminSidebar = ({ userName, userEmail, userAvatar, isOpen, activePage, onClose, theme }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navLinks = [
    { id: "dashboard", path: "/admin/dashboard", label: "Dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 00-1-1H3a1 1 0 00-1 1v16a1 1 0 001 1h6a1 1 0 001-1V2zm4 18a1 1 0 001-1V9a1 1 0 00-1-1h-2a1 1 0 00-1 1v10a1 1 0 001 1h2z" /></svg> },
    { id: "users", path: "/admin/users", label: "Manajemen Pengguna", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.518 6.94a5.002 5.002 0 00-2.964 0A5 5 0 001 16.5V18a1 1 0 001 1h6a1 1 0 001-1v-1.5a5 5 0 00-4.518-4.56zM15.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2 6a2 2 0 11-4 0 2 2 0 014 0zM15 13a5 5 0 00-2.48 1.002a5.987 5.987 0 00-1.02 0A5.002 5.002 0 0113 18v1h3.5v-1.5a5 5 0 00-1.5-3.5z" /></svg> },
  ];

  const handleLogoutClick = () => setIsModalOpen(true);

  const confirmLogout = async () => {
    await authService.logout();
    setIsModalOpen(false);
    navigate("/login");
  };

 return (
    <>
      {/* Overlay untuk mobile (sudah benar) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* --- PERUBAHAN KRUSIAL DI SINI --- */}
      <div
        className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-white/10 
                   flex flex-col justify-between h-screen fixed top-0 left-0 z-50 
                   transition-transform duration-300 ease-in-out
                   ${isOpen ? "translate-x-0" : "-translate-x-full"}`} // <-- Logika disederhanakan
      >
        {/* Konten sidebar (logo, menu, logout) tidak perlu diubah */}
        <div>
          <div className="px-4 pt-6 mb-4">
            <img 
              src={theme === 'dark' ? logoDark : logoWhite} 
              alt="Signify Logo" 
              className="h-30 w-auto ml-2" 
            />
          </div>
          <div className="px-4 space-y-2">
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

        <div className="p-4 border-t border-slate-200/80 dark:border-white/10">
           <div className="flex items-center gap-3 mb-4">
            <img
              src={userAvatar || `https://i.pravatar.cc/40?u=${userEmail}`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
            />
            <div>
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

export default AdminSidebar;