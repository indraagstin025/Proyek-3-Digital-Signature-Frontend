/* eslint-disable no-unused-vars */
/* eslint-disable no-irregular-whitespace */
import "./index.css";
import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im";
import authService from "./services/authService.js";
import { socketService } from "./services/socketService.js";

// --- IMPORT KOMPONEN ---
import SplashScreen from "./components/SplashScreen/SplashScreen.jsx";
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal.jsx";
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import CookieBanner from "./components/BannerCookie/BannerCookie.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

// Halaman Publik
import HomePage from "./pages/HomePage/HomePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage/VerifyEmailPage.jsx";

// Halaman Dashboard Pengguna
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview.jsx";
import DashboardDocuments from "./pages/DashboardPage/DashboardDocuments.jsx";
import DashboardWorkspaces from "./pages/DashboardPage/DashboardWorkspaces.jsx";
import DashboardHistory from "./pages/DashboardPage/DashboardHistory.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import GroupDetailPage from "./pages/GroupPage/GroupDetailPage.jsx";
import AcceptInvitePage from "./pages/AcceptInvitePage/AcceptInvitePage.jsx";

// Halaman Fungsional
import SignDocumentPage from "./pages/SignDocumentPage/SignDocumentPage.jsx";
import ViewDocumentPage from "./pages/ViewDocumentPage/ViewDocumentPage.jsx";
import VerificationPage from "./pages/VerificationPage/VerificationPage.jsx";
import SignGroupPage from "./pages/SignGroupPages/SignGroupPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import SignPackagePage from "./pages/SignPackagePage/SignPackagePage.jsx";

// Halaman Dashboard Admin
import AdminDashboardPage from "./pages/AdminPage/AdminDashboardPage.jsx";
import AdminDashboardOverview from "./pages/AdminPage/AdminDashboardOverview.jsx";
import AdminManageUser from "./pages/AdminPage/AdminManageUser.jsx";
import AdminManageDocuments from "./pages/AdminPage/AdminManageDocuments.jsx";
import AdminAuditLogs from "./pages/AdminPage/AdminAuditLogs.jsx";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const AppWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeKey, setRouteKey] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // State Loading Awal
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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
  useEffect(() => {
    const initSession = async () => {
      const isRefresh = sessionStorage.getItem("app_loaded");
      const isRoot = location.pathname === "/";
      const shouldShowSplash = !isRefresh && isRoot;
      const delayDuration = shouldShowSplash ? 2000 : 0;

      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, delayDuration));
      const sessionCheck = authService.getMe();

      try {
        await Promise.all([sessionCheck, minLoadingTime]);

        const publicPaths = ["/login", "/register", "/"];
        if (publicPaths.includes(location.pathname)) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (shouldShowSplash) await minLoadingTime;
      } finally {
        sessionStorage.setItem("app_loaded", "true");
        setIsCheckingSession(false);
      }
    };

    initSession();
  }, []);

  // 4. INITIALIZE SOCKET CONNECTION
  useEffect(() => {
    if (!isCheckingSession) {
      // Connect socket hanya setelah session check selesai dan user terauth
      try {
        socketService.connect();
        console.log("🔌 Socket initialized");
      } catch (error) {
        console.error("❌ Failed to initialize socket:", error);
      }
    }
  }, [isCheckingSession]);

  const handleAcceptCookie = () => {
    localStorage.setItem("cookie_consent", "true");
    setShowBanner(false);
  };

  const handleDeclineCookie = () => {
    localStorage.setItem("cookie_consent", "false");
    setShowBanner(false);
  };

  const handleRedirectToLogin = () => {
    setSessionModalOpen(false);
    setRouteKey((prev) => prev + 1);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAdmin = location.pathname.startsWith("/admin");

  const toastOptions = useMemo(
    () => ({
      style: {
        background: theme === "dark" ? "#1F2937" : "#FFFFFF",
        color: theme === "dark" ? "#D1D5DB" : "#111827",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
      },
      error: { iconTheme: { primary: "#F87171", secondary: theme === "dark" ? "#1F2937" : "#FFFFFF" } },
      success: { iconTheme: { primary: "#34D399", secondary: theme === "dark" ? "#1F2937" : "#FFFFFF" } },
    }),
    [theme]
  );

  // 4. RENDER LOADING STATE
  if (isCheckingSession) {
    const isRefresh = sessionStorage.getItem("app_loaded");
    const isRoot = location.pathname === "/";

    if (isRoot && !isRefresh) {
      return <SplashScreen />;
    }

    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="text-center">
          <ImSpinner9 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
        </div>
      </div>
    );
  }

  // 5. RENDER APLIKASI UTAMA
  return (
    // FIX PENTING:
    // 1. Hapus 'overflow-auto' agar Dashboard & MainLayout bisa handle scroll sendiri.
    // 2. Tambahkan 'bg-slate-50 dark:bg-slate-900' sebagai warna dasar (canvas) agar tidak ada flash putih.
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-center" reverseOrder={false} toastOptions={toastOptions} containerStyle={{ zIndex: 99999 }} />

      {/* Header Publik */}
      {!isDashboard &&
        !isAdmin &&
        !location.pathname.includes("/sign") &&
        !location.pathname.includes("/group-sign") && // <--- Tambahkan Eksplisit Ini
        !location.pathname.includes("/view") && <Header theme={theme} toggleTheme={toggleTheme} />}

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

        {/* Halaman Standalone (Sign/View) */}
        <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} />} />
        <Route path="/documents/:documentId/view" element={<ViewDocumentPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/documents/:documentId/group-sign" element={<SignGroupPage theme={theme} toggleTheme={toggleTheme} />} />

        {/* Dashboard User */}
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

        {/* Dashboard Admin */}
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

      <ConfirmationModal
        isOpen={isSessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onConfirm={handleRedirectToLogin}
        title="Sesi Berakhir"
        message="Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan."
        confirmText="Login"
        cancelText=""
        confirmButtonColor="bg-blue-600 hover:bg-blue-700"
      />
      {showBanner && <CookieBanner onAccept={handleAcceptCookie} onDecline={handleDeclineCookie} />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
