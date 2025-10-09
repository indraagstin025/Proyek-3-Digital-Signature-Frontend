/* eslint-disable no-irregular-whitespace */
import "./index.css";
import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams, // Diimpor untuk mengambil parameter URL
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Komponen-komponen aplikasi Anda
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal.jsx";
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import CookieBanner from "./components/BannerCookie/BannerCookie.jsx";
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

// Import halaman baru untuk melihat dokumen
// Pastikan path ini sesuai dengan struktur proyek Anda
import ViewDocumentPage from "./pages/ViewDocumentPage/ViewDocumentPage.jsx";

// Komponen Wrapper untuk Route
// Bertugas mengambil ID dari URL dan meneruskannya sebagai prop `url`
const ViewDocumentPageRoute = () => {
  const { documentId } = useParams();

  // Di aplikasi nyata, Anda akan melakukan fetch ke API di sini
  // untuk mendapatkan URL asli dokumen berdasarkan ID-nya.
  const documentUrl = `/dokumen-contoh-${documentId}.pdf`; // Ini hanya contoh

  return <ViewDocumentPage url={documentUrl} />;
};


const AppWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeKey, setRouteKey] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Logika untuk menampilkan Cookie Banner
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookie = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowBanner(false);
  };

  // Fungsi untuk me-redirect ke login saat sesi berakhir
  const handleRedirectToLogin = () => {
    setSessionModalOpen(false);
    setRouteKey((prev) => prev + 1);
    navigate("/login", { replace: true });
  };

  // Logika untuk manajemen tema (Dark/Light mode)
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

  const toastOptions = useMemo(
    () => ({
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
    }),
    [theme]
  );

  return (
    <div className="flex-1 overflow-auto">
      <Toaster position="top-center" reverseOrder={false} toastOptions={toastOptions} />
      
      {/* Header tidak akan tampil di halaman dashboard, sign, dan view */}
      {!isDashboard && !location.pathname.includes("/sign") && !location.pathname.includes("/view") && (
        <Header theme={theme} toggleTheme={toggleTheme} />
      )}
      
      <Routes>
        {/* Rute Halaman Publik */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage key={routeKey} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} />} />
        
        {/* === ROUTE BARU YANG DITAMBAHKAN === */}
        <Route path="/documents/:documentId/view" element={<ViewDocumentPage/>} />

        {/* Rute Dashboard dengan prop tambahan untuk menangani sesi berakhir */}
        <Route
          path="/dashboard"
          element={<DashboardPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} />}
        >
          <Route index element={<DashboardOverview theme={theme} />} />
          <Route path="profile" element={<ProfilePage theme={theme} />} />
          <Route path="documents" element={<DashboardDocuments theme={theme} />} />
          <Route path="workspaces" element={<DashboardWorkspaces theme={theme} />} />
          <Route path="history" element={<DashboardHistory theme={theme} />} />
        </Route>
      </Routes>
      
      {/* Modal untuk Sesi Berakhir */}
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

      {/* Menampilkan Cookie Banner secara kondisional */}
      {showBanner && <CookieBanner onAccept={handleAcceptCookie} />}
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