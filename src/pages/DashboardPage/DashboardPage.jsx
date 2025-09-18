import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { userService } from "../../services/userService";

import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";

const DashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [userError, setUserError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const data = await userService.getMyProfile();
            setUserData(data);
        } catch (error) {
            console.error("Gagal mengambil data profil:", error);
            setUserError(error.message || "Tidak dapat memuat data pengguna.");
        }
    };
    fetchUserData();
  }, []);

  // 👇 1. Buat fungsi untuk menerima data baru dari komponen anak
  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
  };

  const getActivePageFromPath = (pathname) => {
      const pathParts = pathname.split('/').filter(p => p);
      if (pathParts.length < 2) return 'overview';
      return pathParts[1];
  }
  
  const activePage = getActivePageFromPath(location.pathname);
  const pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1);

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
      <Sidebar
        userName={userData?.name}
        userEmail={userData?.email}
        userAvatar={userData?.profilePictureUrl}
        isOpen={isSidebarOpen}
        activePage={activePage}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0"
        }`}
      >
        <DashboardHeader
          activePage={pageTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="flex-1 p-6 overflow-y-auto">
            {userError 
              ? <div className="text-red-500 text-center font-medium">{userError}</div> 
              // 👇 2. Kirim state dan fungsi update ke komponen anak melalui 'context'
              : <Outlet context={{ user: userData, onProfileUpdate: handleProfileUpdate }} />
            }
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;