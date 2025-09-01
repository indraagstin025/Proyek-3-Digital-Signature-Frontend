import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

const Sidebar = ({ userName, userEmail, isOpen, activePage, setActivePage, onClose }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navLinks = [
    { id: "overview", label: "Overview", icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2.586l1-1a1 1 0 011.414 0l1 1V17a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293-.293a1 1 0 000-1.414l-7-7z"></path>
        </svg>
      ) },
    { id: "documents", label: "Dokumen", icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0013.586 6L10 2.414A2 2 0 008.586 2H4z"></path>
        </svg>
      ) },
    { id: "workspaces", label: "Workspace", icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12h6v2H9v-2zM9 8h6v2H9V8z"></path>
        </svg>
      ) },
    { id: "history", label: "Riwayat", icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 12V9H7v1h1v2h1z"></path>
        </svg>
      ) },
  ];

  const handleLogoutClick = () => setIsModalOpen(true);

  const confirmLogout = async () => {
    await authService.logout();
    setIsModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* 🔹 Overlay untuk mobile */}
{isOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onClick={onClose}
  />
)}


      {/* 🔹 Sidebar */}
<div
  className={`w-64 bg-gray-900 shadow-lg flex flex-col justify-between h-screen fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0 lg:translate-x-0" : "-translate-x-full lg:-translate-x-64"}`}
>


        {/* Navigation */}
        <div className="p-4 pt-8 space-y-2">
          <h1 className="text-2xl font-bold text-white px-4 mb-8">DigiSign.</h1>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActivePage(link.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-colors ${
                activePage === link.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-gray-800 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://placehold.co/40x40/0284c7/white?text=${userName.charAt(0)}`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-white">{userName}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg font-medium bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari sesi ini?"
        confirmText="Ya, Logout"
      />
    </>
  );
};

export default Sidebar;
