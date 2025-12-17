// file: src/pages/DashboardPage/DashboardPage.jsx (atau DashboardOverview)
import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
// [1] IMPORT Toaster
import toast, { Toaster } from "react-hot-toast";

import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";
import { AcceptInviteLinks } from "../../components/InvitiationGrupModal/AcceptInviteLinks.jsx";

const DashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const toastShownRef = useRef(false);

  // --- State Manajemen ---
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [pendingToken, setPendingToken] = useState(null);
  const [userError, setUserError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  // --- Effects ---
  useEffect(() => {
    const message = location.state?.message;
    if (message && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("pendingInviteToken");
    if (token) setPendingToken(token);
  }, []);

  useEffect(() => {
    const syncUserData = async () => {
      if (!userData) return;
      try {
        setUserError("");
        const freshData = await userService.getMyProfile();
        if (JSON.stringify(freshData) !== localStorage.getItem("authUser")) {
          setUserData(freshData);
          localStorage.setItem("authUser", JSON.stringify(freshData));
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Gagal sinkronisasi data pengguna:", error);
          setUserError("Gagal menyinkronkan data terbaru. Menampilkan data offline.");
        }
      }
    };
    syncUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
  };

  const handleInviteDone = () => {
    localStorage.removeItem("pendingInviteToken");
    setPendingToken(null);
  };

  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter((p) => p);
    if (pathParts[0] === "dashboard") {
      if (pathParts.length >= 3 && pathParts[1] === "workspaces" && pathParts[2] === "group") return "workspaces";
      if (pathParts.length > 1) return pathParts[1];
      return "overview";
    }
    return "overview";
  };

  const activePage = getActivePageFromPath(location.pathname);

  return (
    <div
      className="flex h-screen w-full overflow-hidden relative 
                    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
                    dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 
                    transition-colors duration-300"
    >
      {/* [2] PASANG TOASTER GLOBAL DI SINI */}
      {/* zIndex 99999 (5 angka 9) menjamin selalu di atas Modal (biasanya 9999) */}
      <Toaster 
        position="top-center" 
        containerStyle={{ 
           zIndex: 99999 
        }} 
      />

      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {pendingToken && <AcceptInviteLinks token={pendingToken} onDone={handleInviteDone} />}

      <Sidebar userName={userData?.name} userEmail={userData?.email} userAvatar={userData?.profilePictureUrl} isOpen={isSidebarOpen} activePage={activePage} onClose={() => setIsSidebarOpen(false)} theme={theme} />

      <div
        className={`
          flex-1 flex flex-col h-full
          transition-all duration-300 
          ml-0 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"} 
          relative z-10 
        `}
      >
        <DashboardHeader activePage={activePage} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} theme={theme} toggleTheme={toggleTheme} />

        {/* MAIN CONTENT */}
        <main className="flex-1 pt-20 h-full overflow-hidden flex flex-col relative">
          <div className="w-full h-full relative">
            {userError ? (
              <div className="p-8 text-red-500 text-center font-medium bg-red-50 rounded-lg m-4">{userError}</div>
            ) : (
              <Outlet
                context={{
                  user: userData,
                  onProfileUpdate: handleProfileUpdate,
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;