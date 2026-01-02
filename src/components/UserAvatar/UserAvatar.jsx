import React, { useState, useEffect } from "react";

/**
 * Komponen Avatar Reusable
 * Otomatis menampilkan Foto Profil atau Inisial Nama.
 *
 * @param {object} user - Object user (wajib ada property 'name', opsional 'profilePictureUrl')
 * @param {string} className - Class CSS tambahan untuk ukuran (misal: "h-10 w-10 text-sm")
 */
export const UserAvatar = ({ user, className = "h-10 w-10 text-sm" }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state jika user berubah (penting untuk list virtual/re-render)
  useEffect(() => {
    setImgError(false);
  }, [user?.profilePictureUrl]);

  // Ambil huruf pertama untuk inisial
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  // Kondisi 1: Punya URL Foto & Tidak Error saat loading
  if (user?.profilePictureUrl && !imgError) {
    return (
      <img
        src={user.profilePictureUrl}
        alt={user.name}
        onError={() => setImgError(true)} // Jika gagal load, switch ke inisial
        loading="lazy"
        className={`rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${className}`}
      />
    );
  }

  // Kondisi 2: Tidak punya foto atau Foto rusak -> Tampilkan Inisial Gradient
  return (
    <div
      className={`
        rounded-full flex items-center justify-center font-bold text-white shadow-sm select-none
        bg-gradient-to-br from-blue-500 to-indigo-600 ring-1 ring-white/20
        ${className}
      `}
      title={user?.name}
    >
      {initials}
    </div>
  );
};