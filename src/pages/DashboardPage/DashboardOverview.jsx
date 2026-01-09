import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom"; // 🔥 Pastikan useOutletContext di-import
import { FaFileSignature, FaClock, FaCheckCircle, FaSpinner, FaUsers, FaBoxOpen, FaUser, FaArrowRight, FaPenFancy, FaChartPie, FaFolderOpen, FaArrowUp, FaEllipsisH, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { dashboardService } from "../../services/dashboardService";

// 🔥 IMPORT TOUR
import OnboardingTour from "../../components/common/OnboardingTour";
import { DASHBOARD_STEPS } from "../../constants/tourSteps";

// --- STAT CARD COMPONENT (TETAP SAMA) ---
const StatCard = ({ icon, label, value, colorTheme }) => {
  const themes = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      light: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      shadow: "shadow-blue-500/20",
      darkGlow: "dark:shadow-blue-500/10",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-400 to-orange-500",
      light: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      shadow: "shadow-amber-500/20",
      darkGlow: "dark:shadow-amber-500/10",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      light: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      shadow: "shadow-emerald-500/20",
      darkGlow: "dark:shadow-emerald-500/10",
    },
  };

  const theme = themes[colorTheme] || themes.blue;

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl transition-transform duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-600/40 shadow-lg shadow-slate-200/50 dark:shadow-md ${theme.darkGlow}`}>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}</h3>
          </div>
        </div>
        <div className={`p-3.5 rounded-2xl ${theme.bg} text-white shadow-lg ${theme.shadow}`}>{React.cloneElement(icon, { className: "h-6 w-6" })}</div>
      </div>
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 ${theme.bg} blur-xl pointer-events-none`}></div>
    </div>
  );
};

// --- ACTION CARD COMPONENT (TETAP SAMA) ---
const ActionCard = ({ doc, navigate }) => {
  const isGroupTask = doc.type === "group";
  const isPersonalTask = doc.type === "personal";
  const isUrgent = isGroupTask || isPersonalTask;

  let buttonLabel = "Detail";
  let buttonAction = () => {};
  let badgeStyle = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
  let badgeLabel = "Draft";
  let cardBorder = "border-l-4 border-l-slate-300 dark:border-l-slate-600";

  if (isGroupTask) {
    buttonLabel = "Buka Grup";
    badgeLabel = "Grup Workspace";
    badgeStyle = "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    cardBorder = "border-l-4 border-l-purple-500";
    buttonAction = () => navigate(`/dashboard/workspaces`);
  } else if (isPersonalTask) {
    buttonLabel = "Tanda Tangani";
    badgeLabel = "Perlu TTD";
    badgeStyle = "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    cardBorder = "border-l-4 border-l-rose-500";
    buttonAction = () => navigate(`/dashboard/documents`);
  } else {
    buttonLabel = "Lihat";
    badgeLabel = doc.status || "File";
    buttonAction = () => navigate(`/dashboard/documents`);
  }

  return (
    <div className={`group relative rounded-xl p-5 transition-all duration-300 ${cardBorder} bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-600/40 shadow-sm hover:shadow-md dark:hover:shadow-blue-500/10`}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide ${badgeStyle}`}>{badgeLabel}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              {new Date(doc.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-4" title={doc.title}>
            {doc.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <FaUser className="w-3 h-3 text-slate-300" />
            <span className="truncate">Dari: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.ownerName || "Saya"}</span></span>
          </p>
        </div>
        <button onClick={buttonAction} className={`shrink-0 flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-sm font-semibold transition-all active:scale-95 w-full sm:w-auto mt-2 sm:mt-0 shadow-sm ${isUrgent ? "text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
          {isUrgent ? <FaPenFancy className="w-3 h-3" /> : <FaArrowRight className="w-3 h-3" />}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

// --- DASHBOARD OVERVIEW MAIN COMPONENT ---
const DashboardOverview = ({ theme }) => {
  const navigate = useNavigate();
  // 🔥 AMBIL SETTER SIDEBAR DARI CONTEXT
  const { setSidebarOpen } = useOutletContext(); 

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
  const totalDocs = (data?.counts?.completed || 0) + (data?.counts?.process || 0) + (data?.counts?.waiting || 0);
  const completedPercentage = totalDocs > 0 ? Math.round(((data?.counts?.completed || 0) / totalDocs) * 100) : 0;
  
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercentage / 100) * circumference;

  const stats = [
    { label: "Menunggu TTD", value: data?.counts?.waiting || 0, colorTheme: "blue", icon: <FaFileSignature /> },
    { label: "Dalam Proses", value: data?.counts?.process || 0, colorTheme: "amber", icon: <FaClock /> },
    { label: "Selesai", value: data?.counts?.completed || 0, colorTheme: "green", icon: <FaCheckCircle /> },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm font-semibold tracking-wide animate-pulse">MEMUAT DASHBOARD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      
      {/* 🔥 [TOUR] Hubungkan Prop onOpenSidebar */}
      <OnboardingTour 
        tourKey="dashboard_intro" 
        steps={DASHBOARD_STEPS} 
        onOpenSidebar={() => setSidebarOpen && setSidebarOpen(true)} 
      />

      {/* AURORA BG */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* CONTENT */}
      <div id="tab-overview" className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* HEADER */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Ringkasan aktivitas dan status dokumen Anda hari ini.</p>
        </div>

        {/* STATISTIK */}
        {/* 🔥 ID Tour */}
        <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* KOLOM KIRI */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* ACTION REQUIRED */}
            {/* 🔥 ID Tour */}
            <section id="dashboard-actions">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
                  Butuh Tindakan
                </h3>
                {data?.actions?.length > 0 && <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full dark:bg-rose-900/30 dark:text-rose-400 shadow-sm">{data.actions.length} Pending</span>}
              </div>
              <div className="space-y-4">
                {data?.actions?.length > 0 ? (
                  data.actions.map((doc) => <ActionCard key={doc.id} doc={doc} navigate={navigate} />)
                ) : (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
                      <FaCheckCircle className="text-emerald-500 text-2xl" />
                    </div>
                    <h5 className="text-slate-900 dark:text-white font-bold text-base">Semua Aman!</h5>
                    <p className="text-slate-500 text-sm mt-1">Tidak ada dokumen yang membutuhkan tindakan Anda saat ini.</p>
                  </div>
                )}
              </div>
            </section>

            {/* ACTIVITY TABLE */}
            {/* 🔥 ID Tour Tambahan */}
            <section id="dashboard-activity">
              <div className="rounded-2xl shadow-sm overflow-hidden bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-600/40">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
                    Aktivitas Terbaru
                  </h3>
                  <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                    {[{ id: "all", label: "Semua" }, { id: "personal", label: "Pribadi" }, { id: "group", label: "Grup" }, { id: "package", label: "Paket" }].map((tab) => (
                      <button key={tab.id} onClick={() => setActivityFilter(tab.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${activityFilter === tab.id ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-700/20 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Dokumen</th>
                        <th className="px-4 py-4 text-center">Jenis</th>
                        <th className="px-4 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity, index) => {
                          let statusBadge = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
                          if (["completed", "SIGNED"].includes(activity.status)) statusBadge = "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30";
                          else if (activity.status === "pending") statusBadge = "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30";
                          
                          let TypeIcon = FaUser;
                          if (activity.type === "group") TypeIcon = FaUsers;
                          else if (activity.type === "package") TypeIcon = FaBoxOpen;

                          return (
                            <tr key={`${activity.id}-${index}`} onClick={() => navigate(`/dashboard/documents`)} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-slate-600 transition-colors">
                                    <FaFolderOpen className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[180px] sm:max-w-xs">{activity.title}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                                  <TypeIcon className="w-3 h-3 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize">{activity.type}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-3 py-1 inline-flex text-[10px] font-bold rounded-full uppercase tracking-wide ${statusBadge}`}>{activity.status === "SIGNED" ? "Signed" : activity.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">{new Date(activity.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                            <FaFolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada aktivitas terbaru.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* KOLOM KANAN */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              {/* 🔥 ID Tour */}
              <div id="dashboard-summary" className="rounded-2xl shadow-sm p-6 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-600/40">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FaChartPie className="text-slate-400" /> Ringkasan
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600"><FaEllipsisH /></button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-8 group cursor-default">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                      <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                      <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="text-emerald-500 drop-shadow-md transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <span className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tighter">{completedPercentage}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Selesai</span>
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Dokumen</span>
                      <span className="text-lg font-extrabold text-slate-800 dark:text-white">{totalDocs}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30 text-center">
                        <span className="block text-[10px] font-bold text-amber-600/70 uppercase mb-1">Diproses</span>
                        <span className="block text-2xl font-bold text-amber-600">{data?.counts?.process || 0}</span>
                      </div>
                      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 text-center">
                        <span className="block text-[10px] font-bold text-blue-600/70 uppercase mb-1">Waiting</span>
                        <span className="block text-2xl font-bold text-blue-600">{data?.counts?.waiting || 0}</span>
                      </div>
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