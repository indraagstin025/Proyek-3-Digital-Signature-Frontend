/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal.jsx";
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";

import DashboardOverview from "./pages/DashboardPage/DashboardOverview.jsx";
import DashboardDocuments from "./pages/DashboardPage/DashboardDocuments.jsx";
import DashboardWorkspaces from "./pages/DashboardPage/DashboardWorkspaces.jsx";
import DashboardHistory from "./pages/DashboardPage/DashboardHistory.jsx";
import SignDocumentPage from "./pages/SignDocumentPage/SignDocumentPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";

const AppWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeKey, setRouteKey] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);

const handleRedirectToLogin = () => {
  setSessionModalOpen(false);
  setRouteKey(prev => prev + 1);
  // Langsung panggil navigasi tanpa setTimeout
  navigate("/login", { replace: true }); 
};

  useEffect(() => {
    const showSessionExpiredModal = () => {
      setSessionModalOpen(true);
    };
    window.addEventListener("sessionExpired", showSessionExpiredModal);
    return () => {
      window.removeEventListener("sessionExpired", showSessionExpiredModal);
    };
  }, [navigate]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDashboard = location.pathname.startsWith("/dashboard");

  // ✅ Stabilkan objek toastOptions dengan useMemo
  const toastOptions = useMemo(() => ({
    style: {
      background: theme === "dark" ? "#1F2937" : "#FFFFFF",
      color: theme === "dark" ? "#D1D5DB" : "#111827",
      border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
    },
    error: {
      iconTheme: { primary: "#F87171", secondary: theme === "dark" ? "#1F2937" : "#FFFFFF" },
    },
    success: {
      iconTheme: { primary: "#34D399", secondary: theme === "dark" ? "#1F2937" : "#FFFFFF" },
    },
  }), [theme]); // Dependensi: objek hanya dibuat ulang jika 'theme' berubah

  return (
    <div className="min-h-screen">
      {/* ✅ Gunakan objek toastOptions yang sudah stabil */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={toastOptions}
      />

            {!isDashboard && !location.pathname.includes('/sign') && (
        <Header theme={theme} toggleTheme={toggleTheme} />
      )}

      <Routes>
        {/* Rute untuk Halaman Publik */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage key={routeKey} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

      <Route 
  path="/documents/:documentId/sign" 
  element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} />} 
/>

        {/* Rute untuk Dashboard */}
        <Route path="/dashboard" element={<DashboardPage theme={theme} toggleTheme={toggleTheme} />}>
          <Route index element={<DashboardOverview theme={theme} />} />
          <Route path="profile" element={<ProfilePage theme={theme} />} />
          <Route path="documents" element={<DashboardDocuments theme={theme} />} />
          <Route path="workspaces" element={<DashboardWorkspaces theme={theme} />} />
          <Route path="history" element={<DashboardHistory theme={theme} />} />
        </Route>
      </Routes>

      <ConfirmationModal
        isOpen={isSessionModalOpen}
        onClose={handleRedirectToLogin}
        onConfirm={handleRedirectToLogin}
        title="Sesi Berakhir"
        message="Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan."
        confirmText="Login"
        cancelText=""
        confirmButtonColor="bg-blue-600 hover:bg-blue-700"
      />
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
