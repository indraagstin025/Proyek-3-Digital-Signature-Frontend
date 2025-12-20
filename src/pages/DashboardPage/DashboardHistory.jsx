import React, { useEffect, useState } from "react";
import { historyService } from "../../services/historyService"; 

const DashboardHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error sebelum fetch ulang
        const data = await historyService.getMyHistory();
        setHistoryData(data);
      } catch (err) {
        console.error("Error fetching history:", err);

        // --- FILTER ERROR (Agar UI tidak error saat cuma masalah koneksi) ---
        
        // 1. Cek Auth (401) -> Sudah dihandle redirect ke login
        const isAuthError = err.response?.status === 401;

        // 2. Cek Network/Timeout -> Sudah dihandle Toast Global
        const isNetworkError = 
            err.message === "Request Timeout" || 
            err.message === "Network Error" ||
            err.message.includes("offline") ||
            err.code === "ECONNABORTED";

        // 3. Hanya set error LOKAL jika murni masalah server/data (misal 500)
        if (!isAuthError && !isNetworkError) {
            // Gunakan pesan dari backend jika ada, atau default
            const msg = err.response?.data?.message || "Gagal memuat riwayat aktivitas.";
            setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Helper: Format tanggal
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

  // Helper: Badge warna
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "PERSONAL": return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
      case "GROUP": return "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
      case "PACKAGE": return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  return (
    // WRAPPER SCROLLABLE (Wajib untuk Layout App-Shell)
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      
      {/* Container Konten 
          - pt-6: Padding atas secukupnya.
          - pb-20: Memberi ruang di bawah agar nyaman dilihat saat scroll mentok bawah.
      */}
      <div id="tab-history" className="mx-auto max-w-screen-xl px-4 pt-6 pb-20 sm:px-6 lg:px-8">
        
        {/* 1. Header Halaman */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Riwayat Aktivitas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Jejak audit penandatanganan dokumen Anda.</p>
          </div>
        </div>

        {/* 2. Loading State (Skeleton) */}
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

        {/* 3. Error State */}
        {!isLoading && error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800" role="alert">
            <span className="font-bold">Error!</span> {error}
          </div>
        )}

        {/* 4. Empty State */}
        {!isLoading && !error && historyData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
             <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <p className="text-slate-800 dark:text-white font-medium">Belum ada aktivitas</p>
             <p className="text-slate-500 text-sm mt-1">Aktivitas penandatanganan akan muncul di sini.</p>
          </div>
        )}

        {/* 5. Content Data */}
        {!isLoading && !error && historyData.length > 0 && (
          <div className="space-y-0 relative">
            {/* Garis Vertikal Timeline (Background) */}
            <div className="absolute left-[17px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-700 -z-10"></div>

            {historyData.map((item) => (
              <div key={item.id} className="flex gap-4 group mb-8 last:mb-0">
                
                {/* Timeline Icon */}
                <div className="flex flex-col items-center">
                  <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm z-10 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>

                {/* Kartu Konten */}
                <div className="flex-grow bg-white dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 -mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-base sm:text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                            {item.documentTitle}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Dokumen berhasil ditandatangani secara digital.
                        </p>
                      </div>
                      
                      {/* Badge Waktu (Desktop: Kanan Atas) */}
                      <div className="hidden sm:block text-right">
                         <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                            {formatDate(item.signedAt)}
                         </span>
                      </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center gap-3">
                    {/* Badge Tipe */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-transparent ${getTypeBadgeClass(item.type)}`}>
                        {item.type}
                    </span>
                    
                    {/* Badge Status */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase tracking-wide border border-transparent flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        SIGNED
                    </span>

                    {/* Info IP */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                        <span>{item.ipAddress || "N/A"}</span>
                    </div>
                  </div>
                  
                  {/* Badge Waktu (Mobile: Muncul di bawah) */}
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