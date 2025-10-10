import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import toast from "react-hot-toast";

import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";

const DashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const toastShownRef = useRef(false);

  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [userError, setUserError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const message = location.state?.message;

    if (message && !toastShownRef.current) {
      toastShownRef.current = true;

      toast.success(message);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

 useEffect(() => {
  const syncUserData = async () => {
    try {
      setUserError("");
      const freshData = await userService.getMyProfile();
      if (JSON.stringify(freshData) !== localStorage.getItem("authUser")) {
        setUserData(freshData);
        localStorage.setItem("authUser", JSON.stringify(freshData));
      }
    } catch (error) {
      // SOLUSINYA: Tambahkan pengecekan status 401 di sini
      if (error.response?.status !== 401) {
        console.error("Gagal sinkronisasi data pengguna:", error);
        setUserError("Gagal menyinkronkan data terbaru. Menampilkan data offline.");
      }
      // Jika error 401, blok catch ini tidak akan melakukan apa-apa.
    }
  };

  syncUserData();

}, []); 

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
  };

  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter((p) => p);
    if (pathParts.length === 1 && pathParts[0] === "dashboard") return "overview";
    if (pathParts[0] === "dashboard" && pathParts.length > 1) return pathParts[1];
    return "overview";
  };

  const activePage = getActivePageFromPath(location.pathname);

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
      {/* Sidebar */}
      <Sidebar userName={userData?.name} userEmail={userData?.email} userAvatar={userData?.profilePictureUrl} isOpen={isSidebarOpen} activePage={activePage} onClose={() => setIsSidebarOpen(false)} theme={theme} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0"} overflow-x-hidden`}>
        {/* Header */}
        <DashboardHeader activePage={activePage} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} theme={theme} toggleTheme={toggleTheme} user={userData} onProfileUpdate={handleProfileUpdate} />
        <main className="flex-1 p-4 overflow-y-auto pt-20 **hide-scrollbar**">
          {userError ? <div className="text-red-500 text-center font-medium">{userError}</div> : <Outlet context={{ user: userData, onProfileUpdate: handleProfileUpdate }} />}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
