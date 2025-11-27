import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import toast from "react-hot-toast";

// Import komponen-komponen yang digunakan
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";
import { AcceptInviteLinks } from "../../components/InvitiationGrupModal/AcceptInviteLinks.jsx";

const DashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Ref untuk menghindari toast berulang kali saat mount
  const toastShownRef = useRef(false);

  // --- State Manajemen ---
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [pendingToken, setPendingToken] = useState(null);
  const [userError, setUserError] = useState("");
  
  // Sidebar default terbuka di layar besar (>= lg)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });

  // --- Efek Toast Notifikasi Setelah Navigasi ---
  useEffect(() => {
    const message = location.state?.message;

    if (message && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(message);
      // Hapus state agar tidak muncul lagi saat refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // --- Efek Cek Token Undangan Tertunda ---
  useEffect(() => {
    const token = localStorage.getItem("pendingInviteToken");
    if (token) {
      setPendingToken(token);
    }
  }, []);

  // --- Efek Sinkronisasi Data Pengguna Terbaru ---
  useEffect(() => {
    const syncUserData = async () => {
      // Tidak sinkron jika userData belum dimuat dari localStorage (atau null)
      if (!userData) return; 

      try {
        setUserError("");
        const freshData = await userService.getMyProfile();
        
        // Cek apakah data baru berbeda dari yang disimpan
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
  }, [/* dependency userData dihapus agar tidak loop, hanya dijalankan sekali saat mount */]);

  // --- Handler Pembaruan Profil ---
  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
  };

  // --- Handler Selesai Undangan ---
  const handleInviteDone = () => {
    localStorage.removeItem("pendingInviteToken");
    setPendingToken(null);
    // Opsional: Sinkronkan ulang data untuk mendapatkan grup baru
    // syncUserData(); 
  };

  // --- Logic Penentuan Halaman Aktif untuk Sidebar ---
  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter((p) => p);
    
    if (pathParts[0] === "dashboard") {
      // dashboard/workspaces/group/:groupId
      if (pathParts.length >= 3 && pathParts[1] === "workspaces" && pathParts[2] === "group") {
        return "workspaces"; 
      }
      // dashboard/settings
      if (pathParts.length > 1) return pathParts[1]; 

      // dashboard (overview)
      return "overview";
    }
    return "overview"; // Default jika ada route lain di luar /dashboard
  };

  const activePage = getActivePageFromPath(location.pathname);
  
  // --- Tampilan Render ---
  return (
    // Kontainer Utama (Flex Row untuk Sidebar + Main Content)
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-100 text-gray-900"}`}>
      
      {/* 1. Modal Token Undangan (Render di lapisan atas) */}
      {pendingToken && <AcceptInviteLinks token={pendingToken} onDone={handleInviteDone} />}

      {/* 2. Sidebar */}
      <Sidebar 
        userName={userData?.name} 
        userEmail={userData?.email} 
        userAvatar={userData?.profilePictureUrl} 
        isOpen={isSidebarOpen} 
        activePage={activePage} 
        onClose={() => setIsSidebarOpen(false)} 
        theme={theme} 
      />

      {/* 3. Main Content Wrapper */}
      {/* Konten akan didorong ke samping saat sidebar terbuka di layar besar (lg) */}
      <div 
        className={`
          flex-1 flex flex-col 
          transition-all duration-300 
          ml-0 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"} 
          overflow-x-hidden
        `}
      >
        
        {/* 4. Header (Asumsi: Header tidak didorong, atau harus menggunakan styling fixed/sticky yang benar) */}
        <DashboardHeader 
          activePage={activePage} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />

        {/* 5. Konten Utama (Main) */}
        {/* Hapus p-4 dan pt-10 dari main, gunakan div p-4 di dalamnya untuk konsistensi */}
<main className="flex-1 overflow-y-auto">
  {/* Kontainer untuk Padding/Gutter di dalam main */}
  <div className="pt-15 p-5 sm:p-8 lg:p-8">   {/* ← Tambahkan pt-8 agar konten turun */}
    {userError ? (
      <div className="text-red-500 text-center font-medium">{userError}</div>
    ) : (
      <Outlet 
        context={{ 
          user: userData, 
          onProfileUpdate: handleProfileUpdate 
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