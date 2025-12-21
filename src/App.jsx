/* eslint-disable no-unused-vars */

if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (typeof URL.parse === 'undefined') {
  URL.parse = function (url, base) {
    try {
      return new URL(url, base);
    } catch (e) {
      return null;
    }
  };
}
// =================================================================

import "./index.css";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImSpinner9, ImWarning } from "react-icons/im"; 
import { MdWifiOff, MdRefresh } from "react-icons/md"; 
import authService from "./services/authService.js";
import { socketService } from "./services/socketService.js";
import { pdfjs } from "react-pdf";

// Components
import SplashScreen from "./components/SplashScreen/SplashScreen.jsx";
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal.jsx";
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import CookieBanner from "./components/BannerCookie/BannerCookie.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

// Pages
import HomePage from "./pages/HomePage/HomePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage/VerifyEmailPage.jsx";
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview.jsx";
import DashboardDocuments from "./pages/DashboardPage/DashboardDocuments.jsx";
import DashboardWorkspaces from "./pages/DashboardPage/DashboardWorkspaces.jsx";
import DashboardHistory from "./pages/DashboardPage/DashboardHistory.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import GroupDetailPage from "./pages/GroupPage/GroupDetailPage.jsx";
import AcceptInvitePage from "./pages/AcceptInvitePage/AcceptInvitePage.jsx";
import SignDocumentPage from "./pages/SignDocumentPage/SignDocumentPage.jsx";
import ViewDocumentPage from "./pages/ViewDocumentPage/ViewDocumentPage.jsx";
import VerificationPage from "./pages/VerificationPage/VerificationPage.jsx";
import SignGroupPage from "./pages/SignGroupPages/SignGroupPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import SignPackagePage from "./pages/SignPackagePage/SignPackagePage.jsx";
import AdminDashboardPage from "./pages/AdminPage/AdminDashboardPage.jsx";
import AdminDashboardOverview from "./pages/AdminPage/AdminDashboardOverview.jsx";
import AdminManageUser from "./pages/AdminPage/AdminManageUser.jsx";
import AdminManageDocuments from "./pages/AdminPage/AdminManageDocuments.jsx";
import AdminAuditLogs from "./pages/AdminPage/AdminAuditLogs.jsx";

// Set Worker PDF
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const AppWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeKey, setRouteKey] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // State Loading & Network
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // State Error Inisialisasi
  const [initError, setInitError] = useState(null); 

  // 1. Event Listener Session Expired
  useEffect(() => {
    const handleSessionExpired = () => setSessionModalOpen(true);
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => window.removeEventListener("sessionExpired", handleSessionExpired);
  }, []);

  // 2. Cookie Consent
  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 3. LOGIKA UTAMA: Smart Session Check
  const initSession = useCallback(async () => {
    setIsCheckingSession(true);
    setInitError(null); 

    const currentPath = window.location.pathname;
    const isRefresh = sessionStorage.getItem("app_loaded");
    const isRoot = currentPath === "/";
    const shouldShowSplash = !isRefresh && isRoot;
    const delayDuration = shouldShowSplash ? 2000 : 0;

    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, delayDuration));
    
    // API Call
    const sessionCheckPromise = authService.getMe();
    
    // Timeout 10 Detik
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    try {
      await Promise.all([
        Promise.race([sessionCheckPromise, timeoutPromise]),
        minLoadingTime,
      ]);

      // Jika sukses, redirect dari halaman publik ke dashboard
      const publicPaths = ["/login", "/register", "/"];
      if (publicPaths.includes(currentPath)) {
        navigate("/dashboard", { replace: true });
      }
      setIsCheckingSession(false); 

    } catch (error) {
      console.warn("Session Init Error:", error.message || error);

      const isUnauthorized = error.response && error.response.status === 401;
      const isTimeout = error.message === "TIMEOUT";
      const isNetworkError = error.code === "ERR_NETWORK" || !error.response;

      if (shouldShowSplash) await minLoadingTime;

      if (isUnauthorized) {
        // Token habis/invalid -> Biarkan ProtectedRoute yang handle redirect
        setIsCheckingSession(false);
      } else if (isTimeout || isNetworkError) {
        // Masalah Koneksi -> Tampilkan Error UI (Jangan logout)
        setInitError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        setIsCheckingSession(false); 
      } else {
        // Error server lain -> Anggap logout
        setIsCheckingSession(false);
      }
    } finally {
      sessionStorage.setItem("app_loaded", "true");
    }
  }, [navigate]);

  // Run Once
  useEffect(() => {
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto Retry on Online
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (initError) {
        console.log("🌐 Network Back. Retrying...");
        initSession();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [initError, initSession]);

  // 4. Socket Connection Logic
  useEffect(() => {
    // Hanya connect jika TIDAK checking session, TIDAK ada error, dan user ONLINE
    if (!isCheckingSession && !initError && isOnline) {
      try {
        socketService.connect();
      } catch (error) {
        console.error("Socket init failed", error);
      }
    }

    // Cleanup: Disconnect jika offline atau app unmount (Optional best practice)
    return () => {
      if (!isOnline && socketService.disconnect) {
         // socketService.disconnect(); // Uncomment jika socketService punya method disconnect
      }
    };
  }, [isCheckingSession, initError, isOnline]);

  // Helpers & Theme
  const handleAcceptCookie = () => { localStorage.setItem("cookie_consent", "true"); setShowBanner(false); };
  const handleDeclineCookie = () => { localStorage.setItem("cookie_consent", "false"); setShowBanner(false); };
  const handleRedirectToLogin = () => { setSessionModalOpen(false); setRouteKey((p) => p + 1); navigate("/login", { replace: true }); };
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme((p) => (p === "light" ? "dark" : "light"));
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAdmin = location.pathname.startsWith("/admin");
  const toastOptions = useMemo(() => ({
    style: { background: theme === "dark" ? "#1e293b" : "#fff", color: theme === "dark" ? "#fff" : "#333" },
    success: { iconTheme: { primary: "#10B981", secondary: "white" } },
    error: { iconTheme: { primary: "#EF4444", secondary: "white" } },
  }), [theme]);

  // 5. RENDER LOADING STATE
  if (isCheckingSession) {
    const isRefresh = sessionStorage.getItem("app_loaded");
    const isRoot = location.pathname === "/";
    if (isRoot && !isRefresh) return <SplashScreen />;

    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <ImSpinner9 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        {!isOnline && (
          <p className="flex items-center gap-2 text-sm text-red-500 font-medium animate-pulse">
            <MdWifiOff /> Menunggu koneksi...
          </p>
        )}
      </div>
    );
  }

  // 6. RENDER ERROR STATE (Jika Gagal Init karena Jaringan)
  if (initError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4">
        <div className="text-center max-w-md">
            <ImWarning className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Kendala Koneksi</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{initError}</p>
            
            <button 
                onClick={initSession}
                className="flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95"
            >
                <MdRefresh className="text-xl" /> Coba Lagi
            </button>
        </div>
      </div>
    );
  }

  // 7. RENDER APLIKASI UTAMA
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-center" reverseOrder={false} toastOptions={toastOptions} containerStyle={{ zIndex: 99999 }} />

      {!isDashboard && !isAdmin && !location.pathname.includes("/sign") && !location.pathname.includes("/group-sign") && !location.pathname.includes("/view") && (
        <Header theme={theme} toggleTheme={toggleTheme} />
      )}

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage key={routeKey} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify/:signatureId" element={<VerificationPage />} />
          <Route path="/join" element={<AcceptInvitePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} />} />
        <Route path="/documents/:documentId/view" element={<ViewDocumentPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/documents/:documentId/group-sign" element={<SignGroupPage theme={theme} toggleTheme={toggleTheme} />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/packages/sign/:packageId" element={<SignPackagePage theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} />} />
          <Route path="/dashboard" element={<DashboardPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} />}>
            <Route index element={<DashboardOverview theme={theme} />} />
            <Route path="profile" element={<ProfilePage theme={theme} />} />
            <Route path="documents" element={<DashboardDocuments theme={theme} />} />
            <Route path="workspaces" element={<DashboardWorkspaces theme={theme} />} />
            <Route path="history" element={<DashboardHistory theme={theme} />} />
            <Route path="group/:groupId" element={<GroupDetailPage theme={theme} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboardPage theme={theme} toggleTheme={toggleTheme} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardOverview />} />
            <Route path="users" element={<AdminManageUser theme={theme} />} />
            <Route path="documents" element={<AdminManageDocuments theme={theme} />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ConfirmationModal isOpen={isSessionModalOpen} onClose={() => setSessionModalOpen(false)} onConfirm={handleRedirectToLogin} title="Sesi Berakhir" message="Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan." confirmText="Login" cancelText="" confirmButtonColor="bg-blue-600 hover:bg-blue-700" />
      {showBanner && <CookieBanner onAccept={handleAcceptCookie} onDecline={handleDeclineCookie} />}
    </div>
  );
};

function App() { return <Router><AppWrapper /></Router>; }
export default App;