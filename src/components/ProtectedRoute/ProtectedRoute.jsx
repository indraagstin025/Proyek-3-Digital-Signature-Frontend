import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Komponen untuk melindungi rute berdasarkan status login dan peran pengguna.
 * @param {{ requireAdmin?: boolean }} props
 * @param {boolean} [props.requireAdmin=false] - Jika true, hanya admin yang diizinkan.
 */
const ProtectedRoute = ({ requireAdmin = false }) => {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("authUser"));

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
