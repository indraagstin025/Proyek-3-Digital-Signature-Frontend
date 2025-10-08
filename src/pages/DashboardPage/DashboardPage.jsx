import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { userService } from "../../services/userService"; // 1. Aktifkan kembali import ini

import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";

const DashboardPage = ({ theme, toggleTheme, onSessionExpired }) => {
  const location = useLocation();

  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [userError, setUserError] = useState(""); // State ini sekarang akan kita gunakan
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });

  // 2. Aktifkan kembali useEffect untuk sinkronisasi data
  useEffect(() => {
    const syncUserData = async () => {
      try {
        // Hapus error lama sebelum mencoba sinkronisasi
        setUserError(""); 
        
        const freshData = await userService.getMyProfile();
        
        // Cek apakah ada perubahan sebelum update state untuk menghindari re-render yang tidak perlu
        if (JSON.stringify(freshData) !== localStorage.getItem('authUser')) {
          setUserData(freshData);
          localStorage.setItem('authUser', JSON.stringify(freshData));
        }
      } catch (error) {
        // 3. GUNAKAN setUserError DI SINI!
        // Jangan redirect atau logout, cukup tampilkan pesan error.
        // Pengguna masih bisa menggunakan data lama dari localStorage.
        console.error("Gagal sinkronisasi data pengguna:", error);
        setUserError("Gagal menyinkronkan data terbaru. Menampilkan data offline.");
      }
    };

    syncUserData();
  }, [onSessionExpired]); // Dijalankan sekali saat komponen dimuat

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  };

  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter((p) => p);
    if (pathParts.length === 1 && pathParts[0] === "dashboard") return "overview";
    if (pathParts[0] === "dashboard" && pathParts.length > 1) return pathParts[1];
    return "overview";
  };

  const activePage = getActivePageFromPath(location.pathname);

  return (
    // Menggunakan min-h-screen agar konten bisa scroll jika melebihi tinggi layar.
    // Menghapus h-screen dari root div adalah praktik yang lebih fleksibel.
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
      
      {/* Sidebar */}
      <Sidebar 
        userName={userData?.name} 
        userEmail={userData?.email} 
        userAvatar={userData?.profilePictureUrl} 
        isOpen={isSidebarOpen} 
        activePage={activePage} 
        onClose={() => setIsSidebarOpen(false)} 
        theme={theme} 
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0"} overflow-x-hidden`}>
        
        {/* Header */}
        <DashboardHeader 
          activePage={activePage} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          user={userData} 
          onProfileUpdate={handleProfileUpdate} 
        />

        {/* Konten halaman (Area yang dapat digulir) */}
        {/* Mengurangi padding horizontal/vertikal ke p-4, 
            Memastikan overflow-y-auto, dan Menerapkan hide-scrollbar. 
            Menggunakan pt-20 untuk memberi ruang di bawah header.
        */}
        <main className="flex-1 p-4 overflow-y-auto pt-20 **hide-scrollbar**">
          {userError ? (
            <div className="text-red-500 text-center font-medium">{userError}</div>
          ) : (
            <Outlet context={{ user: userData, onProfileUpdate: handleProfileUpdate }} />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
