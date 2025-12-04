/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileSignature, FaClock, FaCheckCircle, FaSpinner, FaUsers, FaBoxOpen, FaUser, FaArrowRight, FaPenFancy } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { dashboardService } from "../../services/dashboardService";

const StatCard = ({ icon, label, value, valueColor }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/50 flex flex-col justify-between h-full transition-all hover:shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-2">{label}</p>
        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-900/50 shrink-0">{React.cloneElement(icon, { className: "h-5 w-5" })}</div>
      </div>
      <p className={`text-3xl sm:text-4xl font-extrabold ${valueColor || "text-slate-800 dark:text-white"} truncate`}>{value}</p>
    </div>
  );
};

const DashboardOverview = ({ theme }) => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activityFilter, setActivityFilter] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardSummary();
        setData(response.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
        if (err.response?.status !== 401) {
          toast.error("Gagal memuat data dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getFilteredActivities = () => {
    if (!data?.activities) return [];

    if (activityFilter === "all") return data.activities;

    return data.activities.filter((act) => act.type === activityFilter);
  };

  const filteredActivities = getFilteredActivities();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  const stats = [
    {
      label: "Menunggu TTD",
      value: data?.counts?.waiting || 0,
      valueColor: "text-blue-600 dark:text-blue-400",
      icon: <FaFileSignature className="text-blue-500" />,
    },
    {
      label: "Dalam Proses",
      value: data?.counts?.process || 0,
      valueColor: "text-amber-600 dark:text-amber-400",
      icon: <FaClock className="text-amber-500" />,
    },
    {
      label: "Selesai",
      value: data?.counts?.completed || 0,
      valueColor: "text-green-600 dark:text-green-400",
      icon: <FaCheckCircle className="text-green-500" />,
    },
  ];

  return (
    <div id="tab-overview" className="mx-auto max-w-screen-xl px-4 pt-14 pb-10 sm:px-6 sm:pt-16 space-y-8">
      {/* 1. GRID STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} label={stat.label} value={stat.value} valueColor={stat.valueColor} icon={stat.icon} />
        ))}
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- KOLOM KIRI (Area Kerja Utama) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. Tindakan Cepat */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Tindakan Cepat</h3>
            <div className="space-y-3">
              {data?.actions?.length > 0 ? (
                data.actions.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-base truncate">{doc.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        Dari: {doc.ownerName || "Saya"}
                        {/* Jika ada status 'NEED_SIGNATURE' dari backend */}
                        {doc.status === "NEED_SIGNATURE" && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Perlu Tanda Tangan</span>}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/documents/${doc.id}/sign`)}
                      className={`
    group flex items-center justify-center gap-2 
    w-full sm:w-auto py-2.5 px-6 
    text-sm font-semibold text-white 
    rounded-full shadow-lg hover:shadow-xl hover:opacity-95 active:scale-95 transition-all duration-200
    ${doc.status === "NEED_SIGNATURE" ? "bg-gradient-to-r from-red-500 to-pink-600" : "bg-gradient-to-r from-blue-500 to-teal-400"}
  `}
                    >
                      {/* Ikon Kondisional (Opsional, tapi mempercantik) */}
                      {doc.status === "NEED_SIGNATURE" ? <FaPenFancy className="w-3.5 h-3.5" /> : <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}

                      <span>{doc.status === "NEED_SIGNATURE" ? "Tanda Tangani" : "Lanjutkan"}</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                  <p className="text-slate-500">Tidak ada dokumen yang perlu tindakan segera.</p>
                </div>
              )}
            </div>
          </div>

          {/* B. Tabel Aktivitas */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aktivitas Terbaru</h3>

              {/* [BARU] Filter Buttons / Tabs */}
              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                {[
                  { id: "all", label: "Semua" },
                  { id: "personal", label: "Personal" },
                  { id: "group", label: "Grup" },
                  { id: "package", label: "Paket" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivityFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activityFilter === tab.id ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto touch-pan-x pb-2">
                <table className="w-full table-fixed divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      {/* 1. DOKUMEN: Lebar Sisa */}
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen</th>

                      {/* 2. JENIS: Ganti 'sm:' jadi 'md:' */}
                      {/* Mobile (<768px): 10% (Icon only). Desktop (>=768px): 15% (Icon + Text) */}
                      <th className="px-1 md:px-2 py-2 text-center md:text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[10%] md:w-[15%]">
                        <span className="hidden md:inline">Jenis</span>
                        <span className="md:hidden">#</span>
                      </th>

                      {/* 3. STATUS: Ganti 'sm:' jadi 'md:' */}
                      {/* Mobile: 22% (Lebar agar muat). Desktop: 15% */}
                      <th className="px-1 md:px-2 py-2 text-center md:text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[22%] md:w-[15%]">Status</th>

                      {/* 4. WAKTU: Ganti 'sm:' jadi 'md:' */}
                      {/* Mobile: 18%. Desktop: 15% */}
                      <th className="px-2 py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[18%] md:w-[15%]">Waktu</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((activity, index) => {
                        let statusColor = "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800";
                        if (activity.status === "completed" || activity.status === "SIGNED") statusColor = "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
                        else if (activity.status === "pending") statusColor = "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30";
                        else if (activity.status === "draft") statusColor = "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";

                        let TypeIcon = FaUser;
                        let typeLabel = "Personal";
                        if (activity.type === "group") {
                          TypeIcon = FaUsers;
                          typeLabel = "Grup";
                        }
                        if (activity.type === "package") {
                          TypeIcon = FaBoxOpen;
                          typeLabel = "Paket";
                        }
                        if (activity.type === "document") {
                          TypeIcon = FaFileSignature;
                          typeLabel = "Dokumen";
                        }

                        return (
                          <tr key={`${activity.id}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition cursor-pointer" onClick={() => navigate(`/documents/${activity.id}/view`)}>
                            {/* 1. DOKUMEN */}
                            <td className="px-3 py-2 align-middle">
                              <div className="font-semibold text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all line-clamp-2 leading-tight transition-colors">{activity.title}</div>
                            </td>

                            {/* 2. JENIS */}
                            {/* Ganti 'sm:' jadi 'md:' */}
                            <td className="px-1 md:px-2 py-2 align-middle">
                              <div className="flex justify-center md:justify-start items-center text-slate-500 dark:text-slate-400">
                                <TypeIcon className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0" />
                                {/* Teks hanya muncul di layar MEDIUM ke atas (Tablet/Laptop) */}
                                <span className="hidden md:inline ml-1.5 text-xs truncate">{typeLabel}</span>
                              </div>
                            </td>

                            {/* 3. STATUS */}
                            {/* Ganti 'sm:' jadi 'md:' */}
                            <td className="px-1 md:px-2 py-2 align-middle text-center md:text-left">
                              <span className={`px-1.5 py-0.5 inline-flex text-[9px] md:text-[10px] leading-tight font-bold rounded-full ${statusColor} uppercase tracking-wide truncate max-w-full justify-center`}>
                                {activity.status === "SIGNED" ? "Signed" : activity.status}
                              </span>
                            </td>

                            {/* 4. WAKTU */}
                            {/* Ganti 'sm:' jadi 'md:' */}
                            <td className="px-2 py-2 align-middle text-right text-slate-500 dark:text-slate-400 text-[10px] md:text-xs leading-none md:leading-tight">
                              <div className="flex flex-col justify-center h-full">
                                <span>{new Date(activity.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                                <span className="text-slate-400 mt-0.5 md:mt-0">{new Date(activity.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-sm">
                          Tidak ada aktivitas terbaru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN (Chart) --- */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Ringkasan</h3>
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
            {/* SVG Donut Chart Sederhana */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * (data?.counts?.completed || 0)) / (data?.counts?.completed + data?.counts?.process + data?.counts?.waiting || 1)}
                  className="text-green-500 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800 dark:text-white">{data?.counts?.completed || 0}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">Selesai</span>
              </div>
            </div>

            <div className="w-full pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Dokumen</span>
                <span className="font-bold text-slate-800 dark:text-white">{data?.counts?.completed + data?.counts?.process + data?.counts?.waiting || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tingkat Penyelesaian</span>
                <span className="font-bold text-green-600">{Math.round(((data?.counts?.completed || 0) / (data?.counts?.completed + data?.counts?.process + data?.counts?.waiting || 1)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
