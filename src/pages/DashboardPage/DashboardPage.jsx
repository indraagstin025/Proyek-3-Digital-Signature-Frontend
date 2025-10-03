import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { userService } from "../../services/userService";

import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";

const DashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [userError, setUserError] = useState("");

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
        if (error.response?.status !== 401) {
          setUserError(error.message || "Tidak dapat memuat data pengguna.");
        }
      }
    };
    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
  };

  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter((p) => p);

    if (pathParts.length === 1 && pathParts[0] === "dashboard") {
      return "overview";
    }
    if (pathParts[0] === "dashboard" && pathParts.length > 1) {
      return pathParts[1];
    }
    return "overview";
  };

  const activePage = getActivePageFromPath(location.pathname);

  return (
    <div className={`flex h-screen ${theme === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <Sidebar userName={userData?.name} userEmail={userData?.email} userAvatar={userData?.profilePictureUrl} isOpen={isSidebarOpen} activePage={activePage} onClose={() => setIsSidebarOpen(false)} theme={theme} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0"}`}>
        {/* Header */}
        <DashboardHeader activePage={activePage} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} theme={theme} toggleTheme={toggleTheme} user={userData} onProfileUpdate={handleProfileUpdate} />

        {/* Konten halaman */}
        <main className="flex-1 p-6 overflow-y-auto pt-20">{userError ? <div className="text-red-500 text-center font-medium">{userError}</div> : <Outlet context={{ user: userData, onProfileUpdate: handleProfileUpdate }} />}</main>
      </div>
    </div>
  );
};

export default DashboardPage;
