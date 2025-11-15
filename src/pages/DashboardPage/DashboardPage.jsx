import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import toast from "react-hot-toast";

import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";

// ✅ 1. Impor komponen modal (sesuaikan path jika perlu)
import { AcceptInviteLinks } from "../../components/InvitiationGrupModal/AcceptInviteLinks.jsx"; 
// ✅ Opsional: Jika Anda ingin me-refresh daftar grup setelah menerima
// import { useQueryClient } from "@tanstack/react-query";

const DashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const toastShownRef = useRef(false);
  // const queryClient = useQueryClient(); // <-- Opsional

  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ✅ 2. State baru untuk menyimpan token undangan yang tertunda
  const [pendingToken, setPendingToken] = useState(null);

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

  // ✅ 3. useEffect baru untuk mengecek token saat dashboard dimuat
  useEffect(() => {
    // Cek localStorage HANYA SEKALI saat komponen dimuat
    const token = localStorage.getItem('pendingInviteToken');
    if (token) {
      setPendingToken(token); // Jika ada, tampilkan modal
    }
  }, []); // <-- Array dependensi kosong [] penting!

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

  // ✅ 4. Fungsi handler untuk menutup modal
  const handleInviteDone = () => {
    localStorage.removeItem('pendingInviteToken'); // Hapus token
    setPendingToken(null); // Sembunyikan modal
    
    // ✅ Opsional: Segarkan daftar grup Anda di sidebar
    // queryClient.invalidateQueries({ queryKey: ['groups'] });
  };

  const getActivePageFromPath = (pathname) => {
    // ... (logika Anda sudah benar)
    const pathParts = pathname.split("/").filter((p) => p);
    if (pathParts.length === 2 && pathParts[1] === "group") return "workspaces"; 
    if (pathParts.length === 1 && pathParts[0] === "dashboard") return "overview";
    if (pathParts[0] === "dashboard" && pathParts.length > 1) return pathParts[1];
    return "overview";
  };

  const activePage = getActivePageFromPath(location.pathname);

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
      
      {/* ✅ 5. Render Modal secara kondisional di atas segalanya */}
      {pendingToken && (
        <AcceptInviteLinks 
          token={pendingToken} 
          onDone={handleInviteDone} 
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        userName={userData?.name} 
        // ... (sisa props Anda)
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
          // ... (sisa props Anda)
          activePage={activePage} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
        
        <main className="flex-1 p-4 overflow-y-auto pt-10 "> 
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