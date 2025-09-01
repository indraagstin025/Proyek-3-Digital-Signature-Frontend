import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";
import DashboardOverview from "./DashboardOverview.jsx";
import DashboardDocuments from "./DashboardDocuments.jsx";
import DashboardWorkspaces from "./DashboardWorkspaces.jsx";
import DashboardHistory from "./DashboardHistory.jsx";

const DashboardPage = () => {
  const [activePage, setActivePage] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return true; // default buka di desktop
    }
    return false; // default tertutup di mobile
  });

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <DashboardOverview />;
      case "documents":
        return <DashboardDocuments />;
      case "workspaces":
        return <DashboardWorkspaces />;
      case "history":
        return <DashboardHistory />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      {/* Sidebar */}
      <Sidebar userName="Indra Agustin" userEmail="indra@example.com" isOpen={isSidebarOpen} setActivePage={setActivePage} onClose={() => setIsSidebarOpen(false)} />

      {/* Konten utama */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300
    ${isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0"}
  `}
      >
        <DashboardHeader activePage={activePage} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default DashboardPage;
