// file: src/pages/DashboardPage/DashboardPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import toast, { Toaster } from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im"; // Tambahan icon loading

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

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [pendingToken, setPendingToken] = useState(null);
  const [userError, setUserError] = useState("");

  // Responsive Sidebar: Buka default hanya di layar besar (lg)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  const userStatus = userData?.userStatus || "FREE";
  const isPremium = userStatus === "PREMIUM" || userStatus === "PREMIUM_YEARLY";

  // --- Effects ---

  // 1. Handle Toast Message dari navigasi sebelumnya
  useEffect(() => {
    const message = location.state?.message;
    if (message && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success(message);
      // Bersihkan state agar toast tidak muncul lagi saat refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 2. Cek Token Undangan Pending (Real-time detection)
  useEffect(() => {
    // Initial check
    const checkPendingToken = () => {
      const token = localStorage.getItem("pendingInviteToken");
      if (token && token !== pendingToken) {
        setPendingToken(token);
      }
    };

    checkPendingToken(); // Check on mount

    // ✅ [FIX MOBILE] Listen untuk perubahan localStorage (antar-tab & same-tab via custom event)
    const handleStorageChange = (e) => {
      if (e.key === "pendingInviteToken" || !e.key) {
        // e.key null berarti clear() dipanggil, re-check semua
        checkPendingToken();
      }
    };

    // Custom event untuk same-tab detection
    const handlePendingInviteUpdate = () => {
      checkPendingToken();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pendingInviteUpdate", handlePendingInviteUpdate);

    // ✅ [CRITICAL] Polling sebagai fallback untuk mobile (beberapa browser mobile tidak trigger storage event dengan benar)
    const interval = setInterval(checkPendingToken, 1000); // Check every second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pendingInviteUpdate", handlePendingInviteUpdate);
      clearInterval(interval);
    };
  }, [pendingToken]); // ✅ Re-run kalau pendingToken berubah

  // 3. Sinkronisasi Data User (PENTING)
  useEffect(() => {
    const syncUserData = async () => {
      setIsLoadingUser(true);

      // Jika tidak ada data awal di localStorage, kita tunggu fetch selesai
      if (!userData) {
        // Tetap loading...
      }

      try {
        setUserError("");
        const freshData = await userService.getMyProfile();

        // Update state & localStorage hanya jika ada perubahan
        if (JSON.stringify(freshData) !== localStorage.getItem("authUser")) {
          setUserData(freshData);
          localStorage.setItem("authUser", JSON.stringify(freshData));
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Gagal sinkronisasi data pengguna:", error);
          // Jangan tampilkan error ke user jika data offline masih ada
          if (!userData) {
            setUserError("Gagal memuat profil. Periksa koneksi internet Anda.");
          }
        }
      } finally {
        setIsLoadingUser(false);
      }
    };
    syncUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
  };

  const handleInviteDone = () => {
    localStorage.removeItem("pendingInviteToken");
    setPendingToken(null);
  };

  // Helper untuk menentukan menu aktif di sidebar
  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter((p) => p);
    // Logika khusus untuk nested routes
    if (pathParts[0] === "dashboard") {
      if (pathParts.length >= 2 && pathParts[1] === "documents") return "documents"; // Highlight parent documents
      if (pathParts.length >= 3 && pathParts[1] === "workspaces" && pathParts[2] === "group") return "workspaces";
      if (pathParts.length > 1) return pathParts[1];
      return "overview";
    }
    return "overview";
  };

  const activePage = getActivePageFromPath(location.pathname);

  // --- TAMPILAN LOADING AWAL ---
  // Jika data user belum ada sama sekali dan sedang loading, tampilkan spinner full screen
  if (isLoadingUser && !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <ImSpinner9 className="animate-spin h-10 w-10 text-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden relative 
                 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
                 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 
                 transition-colors duration-300"
    >
      {/* TOASTER GLOBAL */}
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1e293b' : '#fff',
            color: theme === 'dark' ? '#fff' : '#334155',
          }
        }}
      />

      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Modal Invite Link (Jika ada) */}
      {pendingToken && <AcceptInviteLinks token={pendingToken} onDone={handleInviteDone} />}

      {/* SIDEBAR */}
      <Sidebar
        userName={userData?.name}
        userEmail={userData?.email}
        userAvatar={userData?.profilePictureUrl}
        isPremium={isPremium}
        premiumUntil={userData?.premiumUntil}
        isOpen={isSidebarOpen}
        activePage={activePage}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
      />

      {/* MAIN LAYOUT */}
      <div
        className={`
          flex-1 flex flex-col h-full
          transition-all duration-300 
          ml-0 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-0"} 
          relative z-10 
        `}
      >
        <DashboardHeader
          activePage={activePage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          userStatus={userStatus}
          isLoadingUser={isLoadingUser}
        />

        {/* CONTENT AREA */}
        <main className="flex-1 pt-20 h-full overflow-hidden flex flex-col relative">
          <div className="w-full h-full relative">
            {userError ? (
              <div className="flex items-center justify-center h-full">
                <div className="p-8 text-red-500 text-center font-medium bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg m-4 max-w-md">
                  <p className="text-lg font-bold mb-2">Gagal Memuat Profil</p>
                  <p>{userError}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              // 🔥 OUTLET: Tempat halaman anak (DashboardDocuments, dll) dirender
              // Context ini akan ditangkap oleh useOutletContext() di halaman anak
              <Outlet
                context={{
                  user: userData,
                  onProfileUpdate: handleProfileUpdate,
                  setSidebarOpen: setIsSidebarOpen, // Penting untuk Tour/Modal yang butuh akses sidebar
                  isLoadingUser: isLoadingUser
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