import React from "react";
import { HiSun, HiMoon } from "react-icons/hi";

const DashboardHeader = ({
  activePage,
  onToggleSidebar,
  isSidebarOpen = false,
  theme,
  toggleTheme,
}) => {
  const key = String(activePage || "").toLowerCase();
  const getTitle = () => {
    switch (key) {
      case "overview":
        return "Overview";
      case "documents":
        return "Dokumen";
      case "workspaces":
        return "Workspace";
      case "history":
        return "Riwayat";
      default:
        return "Dashboard";
    }
  };

  const ThemeToggleButton = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all
                 bg-gray-200/70 text-gray-800 hover:bg-gray-300/70
                 dark:bg-gray-700/70 dark:text-gray-200 dark:hover:bg-gray-600/70"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <HiMoon className="w-5 h-5" /> : <HiSun className="w-5 h-5" />}
    </button>
  );

  const leftOffset = isSidebarOpen ? "16rem" : "0px";
  const computedWidth = isSidebarOpen ? "calc(100% - 16rem)" : "100%";

  return (
    <header
      className="fixed top-0 z-50 flex items-center justify-between h-20 px-4 
                 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8
                 bg-gradient-to-r from-white/95 to-gray-50/95 border-b border-gray-200/80
                 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 dark:border-white/10 
                 transition-all"
      style={{ left: leftOffset, width: computedWidth }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Dashboard
          </h1>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {getTitle()}
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default DashboardHeader;
