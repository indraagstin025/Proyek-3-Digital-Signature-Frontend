import React from 'react';

const DashboardHeader = ({ activePage, onToggleSidebar }) => {
  const getTitle = () => {
    switch (activePage) {
      case 'overview':
        return 'Overview';
      case 'documents':
        return 'Dokumen';
      case 'workspaces':
        return 'Workspace';
      case 'history':
        return 'Riwayat';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar */}
        <button onClick={onToggleSidebar} className="text-gray-300 hover:text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        {/* Dynamic title */}
        <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {activePage === 'documents' && (
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            + Dokumen Baru
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
