/* eslint-disable no-unused-vars */

// --- Polyfills untuk Browser Lama ---
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (typeof URL.parse === "undefined") {
  URL.parse = function (url, base) {
    try {
      return new URL(url, base);
    } catch (e) {
      return null;
    }
  };
}
// ------------------------------------

import "./index.css";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter as Router, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImSpinner9, ImWarning } from "react-icons/im";
import { MdWifiOff, MdRefresh } from "react-icons/md";
import authService from "./services/authService.js";
import { socketService } from "./services/socketService.js";
import { pdfjs } from "react-pdf";

// Components Global (Modal, Banner, dll)
import SplashScreen from "./components/SplashScreen/SplashScreen.jsx";
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal.jsx";
import CookieBanner from "./components/BannerCookie/BannerCookie.jsx";


// Import Router Baru
import AppRoutes from "./AppRoutes.jsx";

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
  const [initError, setInitError] = useState(null);

  // 7. Event Listener untuk perubahan Auth (Reactive isLoggedIn) - Ditaruh Di Atas agar tidak melanggar Rules of Hooks
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("authUser"));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("authUser"));
    };

    // Listen storage event (antar tab) dan custom event (tab yang sama)
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-update", handleAuthChange);

    // Interval check untuk safety (cleanup localStorage manual)
    const interval = setInterval(handleAuthChange, 1000);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-update", handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  // 1. Event Listener Session Expired
  useEffect(() => {
    const handleSessionExpired = () => setSessionModalOpen(true);
    window.addEventListener("sessionExpired", handleSessionExpired);
    return () => window.removeEventListener("sessionExpired", handleSessionExpired);
  }, []);

  // 2. Cookie Consent
  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");

    // Tampilkan jika belum consent (Login atau tidak, tetap muncul)
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

    // Jika di halaman publik (/, /login, /register), jangan cek session
    const publicOnlyPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email", "/tour", "/demo", "/features", "/privacy-policy", "/terms-and-conditions", "/auth/callback", "/forgot-password", "/reset-password"];

    // Dynamic public paths (untuk route dengan parameter seperti /verify/:signatureId)
    const publicPathPrefixes = ["/verify/"];

    const isPublicPage = publicOnlyPaths.includes(currentPath) || publicPathPrefixes.some(prefix => currentPath.startsWith(prefix));

    if (isPublicPage && isRefresh) {
      // Jika sudah pernah load sebelumnya dan user masuk kembali ke halaman publik, jangan cek session
      setIsCheckingSession(false);
      return;
    }

    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, delayDuration));
    const sessionCheckPromise = authService.getMe();

    // Timeout 20 Detik (Diperpanjang untuk mobile/network lambat)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 20000));

    try {
      await Promise.all([Promise.race([sessionCheckPromise, timeoutPromise]), minLoadingTime]);

      // [FIX] Cek path TERBARU setelah await selesai (mencegah race condition jika user sudah navigasi)
      const freshPath = window.location.pathname;

      // Jika sukses login & akses halaman publik, redirect ke dashboard
      const redirectPaths = ["/login", "/register", "/"];
      if (redirectPaths.includes(freshPath)) {
        navigate("/dashboard", { replace: true });
      }
      setIsCheckingSession(false);
    } catch (error) {
      console.warn("Session Init Error:", error.message || error);

      const isUnauthorized = error.response && error.response.status === 401;
      const isTimeout = error.message === "TIMEOUT";
      const isNetworkError = error.code === "ERR_NETWORK" || !error.response;

      if (shouldShowSplash) await minLoadingTime;

      // Jika 401 di halaman publik, itu adalah normal (user belum login)
      if (isUnauthorized && isPublicPage) {
        setIsCheckingSession(false);
      } else if (isUnauthorized) {
        // 401 di halaman protected, baru trigger session expired
        setIsCheckingSession(false);
      } else if (isTimeout || isNetworkError) {
        setInitError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        setIsCheckingSession(false);
      } else {
        setIsCheckingSession(false);
      }
    } finally {
      sessionStorage.setItem("app_loaded", "true");
    }
  }, [navigate]);

  useEffect(() => {
    initSession();
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
    if (!isCheckingSession && !initError && isOnline) {
      try {
        socketService.connect();
      } catch (error) {
        console.error("Socket init failed", error);
      }
    }
    return () => {
      // socketService.disconnect() if needed
    };
  }, [isCheckingSession, initError, isOnline]);

  // Helpers
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
    setRouteKey((p) => p + 1);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "light" ? "dark" : "light"));

  const toastOptions = useMemo(
    () => ({
      style: { background: theme === "dark" ? "#1e293b" : "#fff", color: theme === "dark" ? "#fff" : "#333" },
      success: { iconTheme: { primary: "#10B981", secondary: "white" } },
      error: { iconTheme: { primary: "#EF4444", secondary: "white" } },
    }),
    [theme]
  );

  // 5. RENDER LOADING
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

  // 6. RENDER ERROR
  if (initError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4">
        <div className="text-center max-w-md">
          <ImWarning className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Kendala Koneksi</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{initError}</p>
          <button onClick={initSession} className="flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all active:scale-95">
            <MdRefresh className="text-xl" /> Coba Lagi
          </button>
        </div>
      </div>
    );
  }



  // 8. RENDER APLIKASI UTAMA
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-center" reverseOrder={false} toastOptions={toastOptions} containerStyle={{ zIndex: 99999 }} />

      {/* Panggil AppRoutes di sini */}
      <AppRoutes theme={theme} toggleTheme={toggleTheme} onSessionExpired={() => setSessionModalOpen(true)} routeKey={routeKey} />

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

      {/* Tampilkan banner HANYA jika sudah login (dan belum consent) */}
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
