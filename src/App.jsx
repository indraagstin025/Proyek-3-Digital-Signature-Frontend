/* eslint-disable no-irregular-whitespace */
import "./index.css";
import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im"; 
import authService from "./services/authService.js";

// --- IMPORT KOMPONEN ---
import SplashScreen from "./components/SplashScreen/SplashScreen.jsx"; // Pastikan file ini sudah dibuat sesuai panduan sebelumnya
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
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import SignPackagePage from "./pages/SignPackagePage/SignPackagePage.jsx";

// Halaman Dashboard Admin
import AdminDashboardPage from "./pages/AdminPage/AdminDashboardPage.jsx";
import AdminDashboardOverview from "./pages/AdminPage/AdminDashboardOverview.jsx";
import AdminManageUser from "./pages/AdminPage/AdminManageUser.jsx"; 
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
      // Cek apakah aplikasi sudah pernah dimuat di tab ini (untuk mendeteksi refresh)
      const isRefresh = sessionStorage.getItem("app_loaded");
      
      // Cek apakah user sedang mengakses Halaman Utama (Root)
      const isRoot = location.pathname === "/";

      // KONDISI SPLASH SCREEN:
      // Tampil HANYA JIKA: (Bukan Refresh) DAN (Halaman adalah Root '/')
      const shouldShowSplash = !isRefresh && isRoot;
      
      // Jika Splash tampil -> Delay 2 detik (Branding)
      // Jika tidak (Refresh / Halaman lain) -> Delay 0 detik (Cepat)
      const delayDuration = shouldShowSplash ? 2000 : 0;
      
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, delayDuration));
      const sessionCheck = authService.getMe(); 

      try {
        await Promise.all([sessionCheck, minLoadingTime]);
        
        // Jika sukses Login, redirect dari halaman public ke dashboard
        const publicPaths = ["/login", "/register", "/"];
        if (publicPaths.includes(location.pathname)) {
             navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        // Jika gagal (User Tamu) & Splash aktif, tetap tunggu timer selesai agar animasi mulus
        if (shouldShowSplash) await minLoadingTime;
      } finally {
        // Tandai app sudah dimuat agar refresh berikutnya tidak memunculkan splash
        sessionStorage.setItem("app_loaded", "true");
        setIsCheckingSession(false);
      }
    };

    initSession();
  }, []); // Array kosong: Jalan sekali saat mount

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

  const toastOptions = useMemo(() => ({
    style: {
        background: theme === "dark" ? "#1F2937" : "#FFFFFF",
        color: theme === "dark" ? "#D1D5DB" : "#111827",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
      },
      error: { iconTheme: { primary: "#F87171", secondary: theme === "dark" ? "#1F2937" : "#FFFFFF" } },
      success: { iconTheme: { primary: "#34D399", secondary: theme === "dark" ? "#1F2937" : "#FFFFFF" } },
    }), [theme]);

  // 4. RENDER LOADING STATE (KONDISIONAL)
  if (isCheckingSession) {
    const isRefresh = sessionStorage.getItem("app_loaded");
    const isRoot = location.pathname === "/";

    // TAMPILAN 1: SPLASH SCREEN BRANDING
    // Hanya muncul jika User baru buka browser DAN akses ke Root URL
    if (isRoot && !isRefresh) {
      return <SplashScreen />;
    }

    // TAMPILAN 2: SPINNER MINIMALIS
    // Muncul saat Refresh atau akses langsung ke URL dalam (misal /login, /dashboard)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
           <ImSpinner9 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
           {/* Teks loading dihapus agar lebih bersih saat transisi cepat */}
        </div>
      </div>
    );
  }

  // 5. RENDER APLIKASI UTAMA
  return (
    <div className="flex-1 overflow-auto">
      <Toaster position="top-center" reverseOrder={false} toastOptions={toastOptions} />

      {!isDashboard && !isAdmin && !location.pathname.includes("/sign") && !location.pathname.includes("/view") && <Header theme={theme} toggleTheme={toggleTheme} />}

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage key={routeKey} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify/:signatureId" element={<VerificationPage />} />
          <Route path="/join" element={<AcceptInvitePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage/>} />
        </Route>

        <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} />} />
        <Route path="/documents/:documentId/view" element={<ViewDocumentPage theme={theme} toggleTheme={toggleTheme} />} />

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
      {showBanner && <CookieBanner onAccept={handleAcceptCookie} onDecline={handleDeclineCookie}/>} 
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