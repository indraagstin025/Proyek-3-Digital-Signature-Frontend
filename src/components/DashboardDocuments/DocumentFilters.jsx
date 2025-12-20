// src/components/dashboard/DocumentFilters.jsx
import React from "react";
import { FaUser, FaUsers, FaSearch, FaSpinner } from "react-icons/fa";

const DocumentFilters = ({ 
  activeTab, 
  onTabChange, // ✅ UBAH DARI setActiveTab JADI onTabChange
  personalCount, 
  groupCount, 
  searchQuery, 
  setSearchQuery, 
  isSearching,
  disableSearch // Props baru untuk disable search bar
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* TABS */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl w-full sm:w-auto">
        <button
          onClick={() => onTabChange("personal")} // ✅ Gunakan onTabChange
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${activeTab === "personal" ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
        >
          <FaUser className="w-3.5 h-3.5" /> Pribadi <span className="ml-1 opacity-60 text-xs">({personalCount})</span>
        </button>
        <button
          onClick={() => onTabChange("group")} // ✅ Gunakan onTabChange
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${activeTab === "group" ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
        >
          <FaUsers className="w-3.5 h-3.5" /> Grup <span className="ml-1 opacity-60 text-xs">{groupCount !== null ? `(${groupCount})` : ''}</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      {!disableSearch && (
        <div className="relative w-full sm:w-72 md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <FaSpinner className="animate-spin text-blue-500" />
            ) : (
              <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            )}
          </div>
          <input
            type="text"
            placeholder="Cari judul atau label AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default DocumentFilters;