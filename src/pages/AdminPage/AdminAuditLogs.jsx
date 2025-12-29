import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { HiSearch, HiRefresh, HiDesktopComputer, HiGlobeAlt, HiChevronLeft, HiChevronRight } from "react-icons/hi";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // [STATE BARU] Untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10; // Maksimal 10 data per halaman

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      // Panggil service dengan parameter page & limit
      // Pastikan Anda mengupdate adminService frontend juga untuk kirim params
      const response = await adminService.getAllAuditLogs(page, LIMIT);
      
      // Backend response structure: { data: [...], pagination: { ... } }
      // Sesuaikan dengan struktur return dari backend Anda
      const logData = response.data || (Array.isArray(response) ? response : []);
      const pagination = response.pagination || { totalPages: 1 };

      setLogs(logData);
      setTotalPages(pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Gagal load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1); // Load halaman 1 saat pertama kali buka
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(newPage);
    }
  };

  // Filter Client-side (Hanya memfilter 10 data yang sedang tampil)
  // Idealnya search juga dilakukan di Backend (server-side filtering), 
  // tapi untuk sekarang client-side filter pada data page ini cukup.
  const filteredLogs = logs.filter((log) =>
    (log.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.actor?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.action || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-full space-y-4 animate-fade-in pb-8">
      
      {/* HEADER & SEARCH (Sama seperti sebelumnya) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <HiDesktopComputer className="w-5 h-5"/>
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Audit Logs</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Halaman {currentPage} dari {totalPages}</p>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Filter data halaman ini..." 
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => fetchLogs(currentPage)} 
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                title="Refresh Data"
            >
                <HiRefresh className="w-5 h-5"/>
            </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-4 py-3 w-16 text-center">#</th>
                <th className="px-4 py-3 min-w-[140px]">Waktu</th>
                <th className="px-4 py-3 min-w-[180px]">Aktor</th>
                <th className="px-4 py-3 min-w-[200px]">Aktivitas</th>
                <th className="px-4 py-3 hidden md:table-cell">IP & Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {loading ? (
                   <tr><td colSpan="5" className="text-center py-20 text-sm text-slate-500">Memuat log aktivitas...</td></tr>
               ) : filteredLogs.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-20 text-sm text-slate-500">Tidak ada data ditemukan di halaman ini.</td></tr>
               ) : (
                   filteredLogs.map((log, index) => (
                       <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                           {/* Nomor Urut (Relative to page) */}
                           <td className="px-4 py-3 text-center text-xs text-slate-400">
                               {(currentPage - 1) * LIMIT + index + 1}
                           </td>
                           
                           {/* ... (Kolom Waktu, Aktor, Aksi, IP SAMA SEPERTI SEBELUMNYA) ... */}
                           <td className="px-4 py-3">
                               <div className="flex flex-col">
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                       {new Date(log.createdAt).toLocaleDateString("id-ID", {day: '2-digit', month: 'short', year: '2-digit'})}
                                   </span>
                                   <span className="text-[10px] text-slate-500 font-mono">
                                       {new Date(log.createdAt).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}
                                   </span>
                               </div>
                           </td>
                           <td className="px-4 py-3">
                               <div className="flex items-center gap-2.5">
                                   <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-blue-600 dark:text-blue-200 text-[10px] font-bold border border-blue-200 dark:border-blue-800 shrink-0">
                                       {log.actor?.name?.charAt(0).toUpperCase() || "?"}
                                   </div>
                                   <div className="min-w-0">
                                       <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                           {log.actor?.name || "System"}
                                       </p>
                                       <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                           {log.actor?.email}
                                       </p>
                                   </div>
                               </div>
                           </td>
                           <td className="px-4 py-3">
                               <div className="flex items-center gap-2 mb-1">
                                   <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getActionStyle(log.action)}`}>
                                       {log.action.replace(/_/g, " ")}
                                   </span>
                               </div>
                               <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 group-hover:line-clamp-none transition-all" title={log.description}>
                                   {log.description}
                               </p>
                           </td>
                           <td className="px-4 py-3 hidden md:table-cell">
                               <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                       <HiGlobeAlt className="text-slate-400 w-3 h-3" />
                                       <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                           {log.ipAddress || "Local"}
                                       </span>
                                   </div>
                                   <div className="relative group/tooltip">
                                       <HiDesktopComputer className="text-slate-300 w-4 h-4 hover:text-blue-500 cursor-help" />
                                       <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg z-10">
                                           {log.userAgent || "Unknown Device"}
                                       </div>
                                   </div>
                               </div>
                           </td>
                       </tr>
                   ))
               )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION CONTROLS (FOOTER) --- */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Halaman <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> dari {totalPages}
            </p>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                >
                    <HiChevronLeft className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                >
                    <HiChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const getActionStyle = (action) => {
  if (action.includes("DELETE") || action.includes("FORCE")) 
      return "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30";
  if (action.includes("CREATE") || action.includes("SIGN")) 
      return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30";
  if (action.includes("LOGIN") || action.includes("UPDATE")) 
      return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30";
  return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
};

export default AdminAuditLogs;