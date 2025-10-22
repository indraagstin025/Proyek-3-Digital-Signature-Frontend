import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";

// Ganti impor ke versi Admin
import AdminSidebar from "../../components/Sidebar/AdminSidebar.jsx";
import AdminDashboardHeader from "../../components/DashboardHeader/AdminDashboardHeader.jsx";

const AdminDashboardPage = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem("authUser") || "null"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

useEffect(() => {
  const syncAdminData = async () => {
    try {
      const freshData = await userService.getMyProfile();
      if (freshData?.isSuperAdmin) {
        setUserData(freshData);
        localStorage.setItem("authUser", JSON.stringify(freshData));
      } else {
        console.error("Akses Ditolak: Pengguna bukan admin.");
        navigate("/login");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // JWT expired → langsung logout/tendang ke login tanpa toast error
        navigate("/login");
      } else {
        console.error("Gagal sinkronisasi data admin:", error);
        navigate("/login");
      }
    }
  };
  syncAdminData();
}, [navigate]);


  const getActivePageFromPath = (pathname) => {
    const pathParts = pathname.split("/").filter(p => p);
    if (pathParts[0] === "admin" && pathParts.length > 1) {
      return pathParts[1];
    }
    return "dashboard";
  };
  
  const activePage = getActivePageFromPath(location.pathname);

  // Struktur ini meniru DashboardPage Anda dengan tepat
  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}>
      <AdminSidebar 
        userName={userData?.name} 
        userEmail={userData?.email} 
        userAvatar={userData?.profilePictureUrl} 
        isOpen={isSidebarOpen} 
        activePage={activePage} 
        onClose={() => setIsSidebarOpen(false)} 
        theme={theme} 
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}>
       <AdminDashboardHeader 
  activePage={activePage} 
  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
  isSidebarOpen={isSidebarOpen}
  userName={userData?.name}
  userEmail={userData?.email}
  userAvatar={userData?.profilePictureUrl}
  theme={theme} 
  toggleTheme={toggleTheme} 
/>

{/* Spacer untuk mendorong konten ke bawah sesuai tinggi header */}
<div className="h-20 sm:h-20"></div>

<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
  <Outlet context={{ adminUser: userData }} />
</main>

      </div>
    </div>
  );
};

export default AdminDashboardPage;