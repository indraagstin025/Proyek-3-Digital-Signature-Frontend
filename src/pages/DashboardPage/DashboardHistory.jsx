import React, { useEffect, useState } from "react";
import { historyService } from "../../services/historyService"; 
// Tambahkan import icon untuk Card
import { FaHistory, FaFingerprint, FaShieldAlt, FaClock, FaCheckDouble } from "react-icons/fa";

// --- KOMPONEN BARU: INFO CARD (HISTORY) ---
const HistoryInfoCard = () => {
  return (
    <div
      className="mb-8 relative overflow-hidden rounded-2xl 
      bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700
      dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900
      dark:border dark:border-emerald-500/30 dark:shadow-emerald-900/20
      px-6 py-6 text-white shadow-lg shadow-emerald-500/20 animate-fade-in transition-colors duration-300"
    >
      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-teal-400 opacity-20 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* BAGIAN KIRI: Teks & Penjelasan */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
              Jejak Audit <span className="text-emerald-100 drop-shadow-sm">Digital</span>
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold border border-white/20 backdrop-blur-sm">LOG AKTIVITAS</span>
          </div>

          <p className="text-emerald-50 dark:text-slate-300 text-sm mb-5 leading-relaxed font-medium max-w-2xl opacity-90">
            Pantau setiap tanda tangan yang Anda bubuhkan. Data ini mencakup <strong>Timestamp</strong>, <strong>Alamat IP</strong>, dan <strong>Identitas Penandatangan</strong> untuk keperluan pembuktian hukum.
          </p>

          {/* FITUR HORIZONTAL (Pills) */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaShieldAlt className="text-emerald-200 text-xs" />
              <span className="text-xs font-semibold">Bukti Hukum</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaFingerprint className="text-cyan-200 text-xs" />
              <span className="text-xs font-semibold">IP Tracking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaClock className="text-yellow-200 text-xs" />
              <span className="text-xs font-semibold">Waktu Nyata</span>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: Ilustrasi Icon Besar */}
        <div className="hidden md:flex flex-shrink-0 relative pr-4">
          <div className="absolute inset-0 bg-white blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <FaHistory className="relative z-10 text-[6rem] text-white/20 dark:text-emerald-500/20 -rotate-12 transform transition-transform duration-700 hover:rotate-0 drop-shadow-xl" />
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const DashboardHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await historyService.getMyHistory();
        setHistoryData(data);
      } catch (err) {
        console.error("Error fetching history:", err);

        const isAuthError = err.response?.status === 401;
        const isNetworkError = 
            err.message === "Request Timeout" || 
            err.message === "Network Error" ||
            err.message.includes("offline") ||
            err.code === "ECONNABORTED";

        if (!isAuthError && !isNetworkError) {
            const msg = err.response?.data?.message || "Gagal memuat riwayat aktivitas.";
            setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "PERSONAL": return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
      case "GROUP": return "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
      case "PACKAGE": return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      
      <div id="tab-history" className="mx-auto max-w-screen-xl px-4 pt-6 pb-20 sm:px-6 lg:px-8">
        
        {/* 🔥 TAMPILKAN INFO CARD DI SINI */}
        <HistoryInfoCard />

        {/* Header Halaman (Subtitle) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Daftar Aktivitas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Urutan kronologis tanda tangan Anda.</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse max-w-3xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-grow w-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                </div>
                <div className="flex-grow space-y-2 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
            <span className="font-bold">Error!</span> {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && historyData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
             <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
               <FaHistory className="h-8 w-8 text-slate-400" />
             </div>
             <p className="text-slate-800 dark:text-white font-medium">Belum ada aktivitas</p>
             <p className="text-slate-500 text-sm mt-1">Aktivitas penandatanganan akan muncul di sini.</p>
          </div>
        )}

        {/* Content Data */}
        {!isLoading && !error && historyData.length > 0 && (
          <div className="space-y-0 relative">
            {/* Garis Vertikal Timeline */}
            <div className="absolute left-[17px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-700 -z-10"></div>

            {historyData.map((item) => (
              <div key={item.id} className="flex gap-4 group mb-8 last:mb-0">
                
                {/* Timeline Icon */}
                <div className="flex flex-col items-center">
                  <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm z-10 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 transition-colors">
                    <FaCheckDouble className="h-4 w-4 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                {/* Kartu Konten */}
                <div className="flex-grow bg-white dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 -mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-base sm:text-lg hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                            {item.documentTitle}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Dokumen berhasil ditandatangani secara digital.
                        </p>
                      </div>
                      
                      {/* Badge Waktu (Desktop) */}
                      <div className="hidden sm:block text-right">
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                            {formatDate(item.signedAt)}
                          </span>
                      </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-transparent ${getTypeBadgeClass(item.type)}`}>
                        {item.type}
                    </span>
                    
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase tracking-wide border border-transparent flex items-center gap-1">
                        <FaCheckDouble className="w-3 h-3" />
                        SIGNED
                    </span>

                    {/* Info IP */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                        <FaFingerprint className="w-3 h-3" />
                        <span>{item.ipAddress || "N/A"}</span>
                    </div>
                  </div>
                  
                  {/* Badge Waktu (Mobile) */}
                  <div className="sm:hidden mt-3 text-xs text-slate-400">
                    {formatDate(item.signedAt)}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHistory;