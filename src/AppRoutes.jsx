import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Components Layout
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

// Pages - Public
import HomePage from "./pages/HomePage/HomePage.jsx";
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
import VerificationPage from "./pages/VerificationPage/VerificationPage.jsx"; // [PINDAH SINI]
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

// Pages - Admin
import AdminDashboardPage from "./pages/AdminPage/AdminDashboardPage.jsx";
import AdminDashboardOverview from "./pages/AdminPage/AdminDashboardOverview.jsx";
import AdminManageUser from "./pages/AdminPage/AdminManageUser.jsx";
import AdminManageDocuments from "./pages/AdminPage/AdminManageDocuments.jsx";
import AdminAuditLogs from "./pages/AdminPage/AdminAuditLogs.jsx";

/**
 * Layout Wrapper untuk Halaman Publik (Landing Page, Login, dll).
 * Menggabungkan Header (Navbar) dan MainLayout (Background + Footer).
 */
const PublicLayout = ({ theme, toggleTheme }) => {
  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <MainLayout /> {/* Outlet (Halaman) akan dirender di dalam MainLayout */}
    </>
  );
};

const AppRoutes = ({ theme, toggleTheme, onSessionExpired, routeKey }) => {
  return (
    <Routes>
      {/* =================================================================
          KELOMPOK 1: PUBLIC PAGES (Ada Header & Footer)
         ================================================================= */}
      <Route element={<PublicLayout theme={theme} toggleTheme={toggleTheme} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage key={routeKey} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/join" element={<AcceptInvitePage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* =================================================================
          KELOMPOK 2: STANDALONE PAGES (Layar Penuh, Tanpa Header/Footer)
          Cocok untuk: Verifikasi, Tanda Tangan, View Dokumen.
         ================================================================= */}
      {/* Verification Page dipindah ke sini agar tidak muncul Header/Footer */}
      <Route path="/verify/:signatureId" element={<VerificationPage />} />
      
      <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />} />
      <Route path="/documents/:documentId/view" element={<ViewDocumentPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/documents/:documentId/group-sign" element={<SignGroupPage theme={theme} toggleTheme={toggleTheme} />} />

      {/* =================================================================
          KELOMPOK 3: PROTECTED DASHBOARD (Sidebar Sendiri)
         ================================================================= */}
      <Route element={<ProtectedRoute />}>
        <Route path="/packages/sign/:packageId" element={<SignPackagePage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />} />
        
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