import React, { useEffect, useState } from "react";
import { historyService } from "../../services/historyService"; // Sesuaikan path import ini

const DashboardHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await historyService.getMyHistory();
        setHistoryData(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Gagal memuat riwayat aktivitas.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Helper: Format tanggal (Backend mengirim ISO string)
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

  // Helper: Badge warna berdasarkan Tipe Dokumen (PERSONAL, GROUP, PACKAGE)
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "PERSONAL":
        return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
      case "GROUP":
        return "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
      case "PACKAGE":
        return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  return (
    <div id="tab-overview" className="mx-auto max-w-screen-xl pt-10 sm:pt-20">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Riwayat Aktivitas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Jejak audit penandatanganan dokumen Anda.</p>
        </div>
        {/* Tombol Ekspor/Print telah dihapus */}
      </div>

      {/* 2. Loading State (Skeleton) */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-grow w-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              </div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Error State */}
      {!isLoading && error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error!</span> {error}
        </div>
      )}

      {/* 4. Empty State */}
      {!isLoading && !error && historyData.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          <p>Belum ada aktivitas penandatanganan.</p>
        </div>
      )}

      {/* 5. Content Data */}
      {!isLoading && !error && historyData.length > 0 && (
        <div className="space-y-8">
          {historyData.map((item) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline Line & Icon */}
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700">
                  {/* Icon Tanda Tangan */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                {/* Garis vertikal (kecuali item terakhir, opsional logicnya bisa ditambah jika mau perfect) */}
                <div className="flex-grow w-px bg-slate-200 dark:bg-slate-700 my-2 min-h-[2rem]"></div>
              </div>

              {/* Kartu Konten */}
              <div className="flex-grow pb-2">
                <p className="font-semibold text-slate-800 dark:text-white text-lg">{item.documentTitle}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {/* Waktu */}
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{formatDate(item.signedAt)}</span>
                  </div>

                  <span className="hidden sm:inline">•</span>

                  {/* IP Address */}
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      ></path>
                    </svg>
                    <span>IP: {item.ipAddress || "N/A"}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-3 flex gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-transparent ${getTypeBadgeClass(item.type)}`}>{item.type}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-transparent">SIGNED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardHistory;