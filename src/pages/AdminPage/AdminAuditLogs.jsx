import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { HiSearch, HiRefresh, HiDesktopComputer, HiGlobeAlt } from "react-icons/hi";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs();
      setLogs(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter pencarian
  const filteredLogs = logs.filter((log) =>
    log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Audit System Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Rekam jejak aktivitas admin dan sistem. Total: {logs.length} Data.
          </p>
        </div>
        <button onClick={fetchLogs} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
            <HiRefresh className="text-slate-600 dark:text-slate-300"/>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
            type="text" 
            placeholder="Cari log (Aksi, Nama Admin, Deskripsi)..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Audit Log Lengkap */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50/70 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Waktu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Aktor (Admin)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Aksi & Deskripsi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Info Perangkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
               {loading ? (
                   <tr><td colSpan="4" className="text-center py-8">Memuat data log...</td></tr>
               ) : filteredLogs.length === 0 ? (
                   <tr><td colSpan="4" className="text-center py-8 text-slate-500">Tidak ada log ditemukan.</td></tr>
               ) : (
                   filteredLogs.map((log) => (
                       <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                           
                           {/* 1. Waktu */}
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                               <div className="flex flex-col">
                                   <span className="font-medium text-slate-700 dark:text-slate-300">
                                       {new Date(log.createdAt).toLocaleDateString("id-ID")}
                                   </span>
                                   <span className="text-xs">
                                       {new Date(log.createdAt).toLocaleTimeString("id-ID")}
                                   </span>
                               </div>
                           </td>

                           {/* 2. Aktor */}
                           <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                       {log.actor?.name?.charAt(0) || "S"}
                                   </div>
                                   <div>
                                       <div className="text-sm font-medium text-slate-900 dark:text-white">
                                           {log.actor?.name || "System"}
                                       </div>
                                       <div className="text-xs text-slate-500">{log.actor?.email}</div>
                                   </div>
                               </div>
                           </td>

                           {/* 3. Aksi */}
                           <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                   log.action.includes("DELETE") ? "bg-red-100 text-red-700" :
                                   log.action.includes("CREATE") ? "bg-green-100 text-green-700" :
                                   "bg-blue-100 text-blue-700"
                               }`}>
                                   {log.action}
                               </span>
                               <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-sm truncate">
                                   {log.description}
                               </p>
                           </td>

                           {/* 4. Info Perangkat (IP & User Agent) */}
                           <td className="px-6 py-4 text-sm text-slate-500">
                               <div className="flex items-center gap-2 mb-1" title="IP Address">
                                   <HiGlobeAlt className="text-slate-400" />
                                   <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs text-slate-700 dark:text-slate-200">
                                       {/* JIKA IP KOSONG, TAMPILKAN PLACEHOLDER */}
                                       {log.ipAddress || "::1 (Localhost)"}
                                   </span>
                               </div>
                               <div className="flex items-center gap-2" title="User Agent">
                                   <HiDesktopComputer className="text-slate-400" />
                                   <span className="text-xs truncate max-w-[150px]">
                                       {log.userAgent || "Unknown Device"}
                                   </span>
                               </div>
                           </td>

                       </tr>
                   ))
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;