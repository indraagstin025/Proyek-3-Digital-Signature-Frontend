import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Import komponen ScrollToTop (dari saran sebelumnya)
import ScrollToTop from "./components/Utils/ScrollToTop";

// Components Layout
import Header from "./components/Header/Header.jsx";
import MainLayout from "./components/MainLayout/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import PrivacyPolicyPage from "./components/BannerCookie/PrivacyPolicyPage.jsx";
import TermsPage from "./pages/TermsPage/TermsPage.jsx";

// Pages - Public
import HomePage from "./pages/HomePage/HomePage.jsx";
import DemoSignPage from "./pages/HomePage/DemoSignPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage/VerifyEmailPage.jsx";
import AcceptInvitePage from "./pages/AcceptInvitePage/AcceptInvitePage.jsx";
import TourPage from "./pages/TourPage/TourPage.jsx";
import AuthCallbackPage from "./pages/AuthCallbackPage/AuthCallbackPage.jsx";

// Pages - Standalone
import SignDocumentPage from "./pages/SignDocumentPage/SignDocumentPage.jsx";
import ViewDocumentPage from "./pages/ViewDocumentPage/ViewDocumentPage.jsx";
import SignGroupPage from "./pages/SignGroupPages/SignGroupPage.jsx";
import SignPackagePage from "./pages/SignPackagePage/SignPackagePage.jsx";
import VerificationPage from "./pages/VerificationPage/VerificationPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import PricingPage from "./pages/PricingPage/PricingPage.jsx"; // Import PricingPage

// Pages - Dashboard
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import DashboardOverview from "./pages/DashboardPage/DashboardOverview.jsx";
import DashboardDocuments from "./pages/DashboardPage/DashboardDocuments.jsx";
import DashboardDocumentsPersonal from "./pages/DashboardPage/DashboardDocumentsPersonal.jsx";
import DashboardPackages from "./pages/DashboardPage/DashboardPackagePages.jsx";
import DashboardWorkspaces from "./pages/DashboardPage/DashboardWorkspaces.jsx";
import DashboardHistory from "./pages/DashboardPage/DashboardHistory.jsx";
import DashboardGroupDocuments from "./pages/DashboardPage/DashboardGroupDocuments.jsx";
import ShortcutsPage from "./pages/DashboardPage/ShortcutPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import GroupDetailPage from "./pages/GroupPage/GroupDetailPage.jsx";
import PackageDetails from "./pages/SignPackagePage/PackageDetails.jsx";

// Pages - Admin
import AdminDashboardPage from "./pages/AdminPage/AdminDashboardPage.jsx";
import AdminDashboardOverview from "./pages/AdminPage/AdminDashboardOverview.jsx";
import AdminManageUser from "./pages/AdminPage/AdminManageUser.jsx";
import AdminManageDocuments from "./pages/AdminPage/AdminManageDocuments.jsx";
import AdminAuditLogs from "./pages/AdminPage/AdminAuditLogs.jsx";
import FeaturesPage from "./pages/FeaturesPage/FeaturesPage.jsx";

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

// ❌ HAPUS PricingLayout KARENA SUDAH TIDAK DIPAKAI
// const PricingLayout = ... (Dihapus agar tidak render Header)

const AppRoutes = ({ theme, toggleTheme, onSessionExpired, routeKey }) => {
  return (
    <>
      {/* ScrollToTop Global */}
      <ScrollToTop />

      <Routes>
        {/* =================================================================
            KELOMPOK 1: PUBLIC PAGES (Dengan Header)
           ================================================================= */}
        <Route element={<PublicLayout theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/login" element={<LoginPage key={routeKey} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/join" element={<AcceptInvitePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* =================================================================
            KELOMPOK 2: STANDALONE PAGES (Tanpa Header / Footer)
           ================================================================= */}
        {/* 🔥 PINDAHKAN PRICING KE SINI 🔥 */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Google OAuth Callback */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route path="/verify/:signatureId" element={<VerificationPage />} />
        <Route path="/demo" element={<DemoSignPage theme={theme} toggleTheme={toggleTheme} />} />

        <Route path="/documents/:documentId/sign" element={<SignDocumentPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />} />
        <Route path="/documents/:documentId/view" element={<ViewDocumentPage theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/documents/:documentId/group-sign" element={<SignGroupPage theme={theme} toggleTheme={toggleTheme} />} />

        {/* =================================================================
            KELOMPOK 3: PROTECTED ROUTES
           ================================================================= */}
        <Route element={<ProtectedRoute />}>
          {/* Hapus Route Pricing dari sini juga */}
          <Route path="/packages/sign/:packageId" element={<SignPackagePage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />} />

          {/* Dashboard Layout (Sidebar) */}
          <Route path="/dashboard" element={<DashboardPage theme={theme} toggleTheme={toggleTheme} onSessionExpired={onSessionExpired} />}>
            <Route index element={<DashboardOverview theme={theme} />} />
            <Route path="profile" element={<ProfilePage theme={theme} />} />
            <Route path="documents" element={<DashboardDocuments theme={theme} />} />
            <Route path="documents/personal" element={<DashboardDocumentsPersonal theme={theme} />} />
            <Route path="packages" element={<DashboardPackages />} />
            <Route path="documents/group" element={<DashboardGroupDocuments />} />
            <Route path="packages/:packageId" element={<PackageDetails />} />
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
    </>
  );
};

export default AppRoutes;