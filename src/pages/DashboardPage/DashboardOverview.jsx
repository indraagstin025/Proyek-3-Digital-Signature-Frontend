import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import Icon untuk Banner Baru (Hero Section)
import { HiOutlineUpload, HiOutlineUserGroup } from "react-icons/hi";
// Import Icon lama untuk Stats & Table
import { FaFileSignature, FaClock, FaCheckCircle, FaSpinner, FaUsers, FaBoxOpen, FaUser, FaArrowRight, FaPenFancy, FaChartPie, FaFolderOpen } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { dashboardService } from "../../services/dashboardService";

// --- KOMPONEN BARU: Welcome Banner (Hero Section) ---
// --- KOMPONEN BARU: Welcome Banner (Updated Style) ---
const WelcomeBanner = ({ userName, onUploadClick, onCreateGroupClick }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl 
      bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 
      dark:from-slate-900 dark:via-blue-950 dark:to-slate-900
      dark:border dark:border-blue-500/30 dark:shadow-blue-900/20
      p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 mb-8 transition-all hover:shadow-xl"
    >
      {/* Background Pattern (Hiasan Visual - Opacity disesuaikan) */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-20 dark:opacity-5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white opacity-20 dark:opacity-5 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white dark:text-blue-50">
            Halo, {userName}! 👋
          </h2>
          <p className="text-blue-50 dark:text-slate-300 max-w-lg text-sm sm:text-base leading-relaxed font-medium">
            Selamat datang di Workspace Anda. Apa yang ingin Anda kerjakan hari ini?
            Unggah dokumen baru atau kelola tim Anda sekarang.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* TOMBOL UTAMA: UPLOAD */}
          <button
            onClick={onUploadClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-md transition-transform active:scale-95"
          >
            <HiOutlineUpload className="text-xl" />
            Upload Dokumen
          </button>

          {/* TOMBOL SEKUNDER: BUAT GRUP (Glassmorphism Style agar cocok dengan background baru) */}
          <button
            onClick={onCreateGroupClick}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold backdrop-blur-md border border-white/30 transition-colors"
          >
            <HiOutlineUserGroup className="text-xl" />
            Buat Grup
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN LAMA (StatCard & ActionCard) ---
const StatCard = ({ icon, label, value, colorTheme }) => {
  const bgColors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  };
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColors[colorTheme] || bgColors.blue} shadow-inner`}>{React.cloneElement(icon, { className: "h-6 w-6" })}</div>
      </div>
      <div className={`h-1 w-full rounded-full opacity-20 ${colorTheme === "blue" ? "bg-blue-500" : colorTheme === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}></div>
    </div>
  );
};

const ActionCard = ({ doc, navigate }) => {
  const isUrgent = doc.status === "NEED_SIGNATURE";
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center pl-2 sm:pl-0">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                isUrgent ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {isUrgent ? "Segera" : "Info"}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[150px]">
              • Dari: <span className="font-medium text-slate-600 dark:text-slate-300">{doc.ownerName || "Saya"}</span>
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words sm:truncate" title={doc.title}>
            {doc.title}
          </h4>
        </div>
        <button
          onClick={() => navigate(`/documents/${doc.id}/sign`)}
          className={`shrink-0 flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold text-white shadow-md transition-all active:scale-95 w-full sm:w-auto mt-1 sm:mt-0
            ${isUrgent ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-200 dark:shadow-none" : "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"}`}
        >
          {isUrgent ? <FaPenFancy className="w-3 h-3" /> : <FaArrowRight className="w-3 h-3" />}
          {isUrgent ? "Tanda Tangani" : "Lihat Detail"}
        </button>
      </div>
    </div>
  );
};

const DashboardOverview = ({ theme }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState("all");

  // --- LOGIKA USER ---
  // Ambil nama user dari LocalStorage agar Banner Personal
  const [userName, setUserName] = useState("User");
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Ambil nama depan saja biar lebih ramah
        const firstName = parsed.name ? parsed.name.split(" ")[0] : "User";
        setUserName(firstName);
      }
    } catch (e) {
      console.error("Gagal parse user", e);
    }
  }, []);

  // --- HANDLER BUTTON ACTION ---
  const handleUploadClick = () => {
    // Arahkan ke halaman dokumen dan beri sinyal untuk membuka modal upload
    // Pastikan di DashboardDocuments Anda membaca query param 'openUpload'
    navigate("/dashboard/documents?openUpload=true");
  };

  const handleCreateGroupClick = () => {
    // Arahkan ke workspace (bisa ditambahkan logic serupa untuk open modal create group)
    navigate("/dashboard/workspaces");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardSummary();
        setData(response.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
        const isAuthError = err.response?.status === 401;
        const isNetworkError = err.message === "Request Timeout" || err.message === "Network Error" || err.message.includes("offline") || err.code === "ECONNABORTED";

        if (!isAuthError && !isNetworkError) {
          const message = err.response?.data?.message || "Gagal memuat data dashboard.";
          toast.error(message);
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
  const totalDocs = (data?.counts?.completed || 0) + (data?.counts?.process || 0) + (data?.counts?.waiting || 0);
  const completedPercentage = totalDocs > 0 ? Math.round(((data?.counts?.completed || 0) / totalDocs) * 100) : 0;
  
  // Chart Config
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercentage / 100) * circumference;

  const stats = [
    { label: "Menunggu TTD", value: data?.counts?.waiting || 0, colorTheme: "blue", icon: <FaFileSignature /> },
    { label: "Dalam Proses", value: data?.counts?.process || 0, colorTheme: "amber", icon: <FaClock /> },
    { label: "Selesai", value: data?.counts?.completed || 0, colorTheme: "green", icon: <FaCheckCircle /> },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      <div id="tab-overview" className="mx-auto max-w-screen-xl px-4 pt-6 pb-20 sm:px-6 lg:px-8 space-y-8 fade-in">
        
        {/* --- 🔥 IMPLEMENTASI BARU: WELCOME BANNER --- */}
        <WelcomeBanner 
          userName={userName}
          onUploadClick={handleUploadClick}
          onCreateGroupClick={handleCreateGroupClick}
        />

        {/* --- STATISTIK --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* KOLOM KIRI (Area Kerja Utama) */}
          <div className="xl:col-span-2 space-y-8">
            {/* A. Tindakan Cepat */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Butuh Tindakan</h3>
              </div>

              <div className="space-y-3">
                {data?.actions?.length > 0 ? (
                  data.actions.map((doc) => <ActionCard key={doc.id} doc={doc} navigate={navigate} />)
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 mb-3">
                      <FaCheckCircle className="text-slate-300 dark:text-slate-500 text-xl" />
                    </div>
                    <p className="text-slate-500 font-medium">Semua aman! Tidak ada tindakan tertunda.</p>
                  </div>
                )}
              </div>
            </section>

            {/* B. Tabel Aktivitas */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aktivitas Terbaru</h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto overflow-x-auto no-scrollbar">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "personal", label: "Pribadi" },
                    { id: "group", label: "Grup" },
                    { id: "package", label: "Paket" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivityFilter(tab.id)}
                      className={`px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
                        activityFilter === tab.id
                          ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-500"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                <table className="w-full table-fixed min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="w-[45%] pl-4 pr-1 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dokumen</th>
                      <th className="w-[15%] px-1 py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis</th>
                      <th className="w-[20%] px-1 py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="w-[20%] pl-1 pr-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((activity, index) => {
                        let statusColor = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
                        if (["completed", "SIGNED"].includes(activity.status)) statusColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
                        else if (activity.status === "pending") statusColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

                        let TypeIcon = activity.type === "group" ? FaUsers : activity.type === "package" ? FaBoxOpen : FaUser;

                        return (
                          <tr key={`${activity.id}-${index}`} className="group hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer" onClick={() => navigate(`/documents/${activity.id}/view`)}>
                            <td className="pl-4 pr-1 py-2.5 align-middle">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FaFolderOpen className="text-slate-300 w-3 h-3 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                                <span className="font-medium text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{activity.title}</span>
                              </div>
                            </td>
                            <td className="px-1 py-2.5 text-center align-middle">
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                                <TypeIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                              </div>
                            </td>
                            <td className="px-1 py-2.5 text-center align-middle">
                              <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold rounded-full uppercase tracking-wide border border-transparent truncate max-w-full justify-center ${statusColor}`}>
                                {activity.status === "SIGNED" ? "Signed" : activity.status}
                              </span>
                            </td>
                            <td className="pl-1 pr-4 py-2.5 text-right align-middle">
                              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate">{new Date(activity.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                          Tidak ada aktivitas terbaru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* KOLOM KANAN (Chart Ringkasan) */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FaChartPie className="text-slate-400" />
                Ringkasan
              </h3>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                {/* Donut Chart */}
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                    <circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{completedPercentage}%</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Selesai</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Total Dokumen</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{totalDocs}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                      <span className="block text-xs text-slate-400 uppercase mb-1">Diproses</span>
                      <span className="block text-base font-bold text-amber-600">{data?.counts?.process || 0}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                      <span className="block text-xs text-slate-400 uppercase mb-1">Waiting</span>
                      <span className="block text-base font-bold text-blue-600">{data?.counts?.waiting || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;