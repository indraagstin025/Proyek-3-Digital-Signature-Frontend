import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Components Layout
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import PrivacyPolicyPage from "./components/BannerCookie/PrivacyPolicyPage.jsx";

// Pages - Public
import HomePage from "./pages/HomePage/HomePage.jsx";
import DemoSignPage from "./pages/HomePage/DemoSignPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage/VerifyEmailPage.jsx";
import AcceptInvitePage from "./pages/AcceptInvitePage/AcceptInvitePage.jsx";

// Pages - Standalone (Tanpa Header/Footer)
import SignDocumentPage from "./pages/SignDocumentPage/SignDocumentPage.jsx";
import ViewDocumentPage from "./pages/ViewDocumentPage/ViewDocumentPage.jsx";
import SignGroupPage from "./pages/SignGroupPages/SignGroupPage.jsx";
import SignPackagePage from "./pages/SignPackagePage/SignPackagePage.jsx";
import VerificationPage from "./pages/VerificationPage/VerificationPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";

// Pages - Dashboard
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview.jsx";
import DashboardDocuments from "./pages/DashboardPage/DashboardDocuments.jsx";
import DashboardWorkspaces from "./pages/DashboardPage/DashboardWorkspaces.jsx";
import DashboardHistory from "./pages/DashboardPage/DashboardHistory.jsx";
import ShortcutsPage from "./pages/DashboardPage/ShortcutPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import GroupDetailPage from "./pages/GroupPage/GroupDetailPage.jsx";
import PricingPage from "./pages/PricingPage/PricingPage.jsx";

// Pages - Admin
import AdminDashboardPage from "./pages/AdminPage/AdminDashboardPage.jsx";
import AdminDashboardOverview from "./pages/AdminPage/AdminDashboardOverview.jsx";
import AdminManageUser from "./pages/AdminPage/AdminManageUser.jsx";
import AdminManageDocuments from "./pages/AdminPage/AdminManageDocuments.jsx";
import AdminAuditLogs from "./pages/AdminPage/AdminAuditLogs.jsx";

/**
 * Layout Wrapper untuk Halaman Publik (Landing Page, Login, dll).
 */
const PublicLayout = ({ theme, toggleTheme }) => {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <MainLayout />
    </>
  );
};

// ✅ [DITAMBAHKAN] Definisi Komponen PricingLayout
const PricingLayout = ({ theme, toggleTheme }) => {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      {/* Container dengan padding agar konten tidak tertutup header fixed */}
      <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-900">
        <PricingPage />
      </div>
    </>
  );
};

const AppRoutes = ({ theme, toggleTheme, onSessionExpired, routeKey }) => {
  return (
    <Routes>
      {/* =================================================================
          KELOMPOK 1: PUBLIC PAGES
         ================================================================= */}
      <Route element={<PublicLayout theme={theme} toggleTheme={toggleTheme} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage key={routeKey} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/join" element={<AcceptInvitePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* =================================================================
          KELOMPOK 2: STANDALONE PAGES
         ================================================================= */}
      <Route path="/verify/:signatureId" element={<VerificationPage />} />
      <Route path="/demo" element={<DemoSignPage theme={theme} toggleTheme={toggleTheme} />} />

      <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />} />
      <Route path="/documents/:documentId/view" element={<ViewDocumentPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/documents/:documentId/group-sign" element={<SignGroupPage theme={theme} toggleTheme={toggleTheme} />} />

      {/* =================================================================
          KELOMPOK 3: PROTECTED ROUTES
         ================================================================= */}
      <Route element={<ProtectedRoute />}>
        {/* ✅ Route Pricing (Menggunakan Layout Khusus) */}
        <Route path="/pricing" element={<PricingLayout theme={theme} toggleTheme={toggleTheme} />} />

        <Route path="/packages/sign/:packageId" element={<SignPackagePage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />} />

        {/* Dashboard Layout (Sidebar) */}
        <Route path="/dashboard" element={<DashboardPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />}>
          <Route index element={<DashboardOverview theme={theme} />} />
          <Route path="profile" element={<ProfilePage theme={theme} />} />
          <Route path="documents" element={<DashboardDocuments theme={theme} />} />
          <Route path="workspaces" element={<DashboardWorkspaces theme={theme} />} />
          <Route path="history" element={<DashboardHistory theme={theme} />} />
          <Route path="group/:groupId" element={<GroupDetailPage theme={theme} />} />
          <Route path="shortcuts" element={<ShortcutsPage theme={theme} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      {/* =================================================================
          KELOMPOK 4: ADMIN DASHBOARD
         ================================================================= */}
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

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
