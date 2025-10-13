import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Komponen untuk melindungi rute berdasarkan status login dan peran pengguna.
 * @param {{ requireAdmin?: boolean }} props
 * @param {boolean} [props.requireAdmin=false] - Jika true, hanya admin yang diizinkan.
 */
const ProtectedRoute = ({ requireAdmin = false }) => {
    const location = useLocation();

    // Ambil data pengguna dari localStorage
    const user = JSON.parse(localStorage.getItem('authUser'));

    // 1. Cek: Apakah pengguna sudah login?
    if (!user) {
        // Jika belum, tendang ke halaman login.
        // `state={{ from: location }}` berguna agar setelah login, pengguna bisa kembali ke halaman yang tadinya ingin diakses.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Cek: Apakah rute ini butuh akses admin, tapi pengguna bukan admin?
    if (requireAdmin && !user.isSuperAdmin) {
        // Jika ya, tendang pengguna ke dasbornya sendiri (bukan halaman admin).
        // Ini mencegah user biasa mengakses URL admin.
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Jika semua pemeriksaan lolos, izinkan akses ke halaman yang dituju.
    // <Outlet /> akan merender komponen anak dari rute ini (misalnya: AdminLayout atau DashboardPage).
    return <Outlet />;
};

export default ProtectedRoute;