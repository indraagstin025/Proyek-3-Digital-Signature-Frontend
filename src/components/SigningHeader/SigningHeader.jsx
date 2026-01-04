// src/components/SigningHeader/SigningHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { HiSun, HiMoon } from "react-icons/hi";
import { FaBars } from 'react-icons/fa';
import nameLogo from "../../assets/images/WeSign.png";

// ✅ Import userService (Best Practice: Tetap gunakan layer service)
import { userService } from "../../services/userService"; 

// Helper: Ambil inisial nama
const getInitials = (name) => {
  if (!name) return "?";
  return name.trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

// Helper: Warna acak
const getColor = (name) => {
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", "bg-emerald-500", 
      "bg-teal-500", "bg-cyan-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", 
      "bg-purple-500", "bg-pink-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const SigningHeader = ({ 
  theme, toggleTheme, onToggleSidebar, activeUsers = [], currentUser 
}) => {

  const allUsers = [
    { 
        userId: currentUser?.id || "me", 
        userName: currentUser?.name || "Saya", 
        // Backend API sudah mengirim Full URL di sini
        profilePictureUrl: currentUser?.profilePictureUrl, 
        color: "bg-indigo-600", 
        isMe: true 
    },
    // Backend Socket sudah mengirim Full URL di sini
    ...activeUsers
  ];

  const MAX_DISPLAY = 4;
  const displayUsers = allUsers.slice(0, MAX_DISPLAY);
  const remainingCount = allUsers.length - MAX_DISPLAY;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8 bg-white/80 border-b border-slate-200/80 dark:bg-slate-900/80 dark:border-white/10">
      {/* KIRI: LOGO */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/documents">
          <img src={nameLogo} alt="Logo WeSign" className="h-8 w-auto dark:invert" />
        </Link>
      </div>

      {/* KANAN: AVATAR & TOOLS */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* AVATAR GROUP */}
        <div className="flex -space-x-2 overflow-hidden mr-2 items-center">
            {displayUsers.map((user, index) => {
                
                // ✅ Memanggil Helper Service (Pass-through URL)
                const finalImageUrl = userService.getProfilePictureUrl(user.profilePictureUrl);

                return (
                    <div 
                        key={user.userId || index}
                        title={user.userName + (user.isMe ? " (Anda)" : "")}
                        className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-800 text-[10px] sm:text-xs font-bold text-white select-none cursor-help shadow-sm transition-transform hover:scale-110 hover:z-10 bg-white dark:bg-slate-800`}
                    >
                        {finalImageUrl ? (
                           <>
                             {/* Gambar Profil */}
                             <img 
                               src={finalImageUrl} 
                               alt={user.userName}
                               className="w-full h-full object-cover rounded-full"
                               onError={(e) => {
                                 // Jika error (404/Network), sembunyikan img, tampilkan div inisial
                                 e.currentTarget.style.display = 'none';
                                 e.currentTarget.nextElementSibling.style.display = 'flex';
                               }}
                             />
                             {/* Fallback Inisial (Default Hidden) */}
                             <div className={`hidden items-center justify-center w-full h-full rounded-full ${user.color || getColor(user.userName)}`}>
                                {getInitials(user.userName)}
                             </div>
                           </>
                        ) : (
                           /* Tampilan Inisial (Jika URL null) */
                           <div className={`flex items-center justify-center w-full h-full rounded-full ${user.color || getColor(user.userName)}`}>
                              {getInitials(user.userName)}
                           </div>
                        )}
                    </div>
                );
            })}
            
            {/* Indikator Sisa User (+2) */}
            {remainingCount > 0 && (
                <div className="flex items-center justify-center w-8 h-8 text-[10px] font-bold text-white bg-slate-500 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm">
                    +{remainingCount}
                </div>
            )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-full transition-all bg-gray-200/70 text-gray-800 hover:bg-gray-300/70 dark:bg-gray-700/70 dark:text-gray-200 dark:hover:bg-gray-600/70 hidden sm:block">
          {theme === "light" ? <HiMoon size={20} /> : <HiSun size={20} />}
        </button>
        
        {/* Hamburger Mobile */}
        <button onClick={onToggleSidebar} className="p-2 rounded-full text-gray-800 dark:text-gray-200 md:hidden portrait:inline-flex landscape:hidden">
          <FaBars size={20} />
        </button>
      </div>
    </header>
  );
};

export default SigningHeader;