/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService"; 
import toast from "react-hot-toast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  HiUserGroup, HiDocumentText, HiShieldCheck, HiOfficeBuilding,
  HiOutlineClock, HiArrowSmUp, HiArrowSmDown, HiLightningBolt
} from "react-icons/hi";

// Warna untuk Pie Chart
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

// ==========================================
// 1. KOMPONEN KECIL: COMPACT STAT CARD
// ==========================================
const CompactStatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
          {value}
        </h4>
      </div>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-white`}>
        {React.cloneElement(icon, { className: `w-5 h-5 ${color.replace("bg-", "text-")}` })}
      </div>
    </div>
    
    <div className="flex items-center gap-1 mt-auto z-10">
      <span className={`text-xs font-bold flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend >= 0 ? <HiArrowSmUp /> : <HiArrowSmDown />}
        {Math.abs(trend || 0)}%
      </span>
      <span className="text-[10px] text-slate-400">vs kemarin</span>
    </div>

    <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full ${color} opacity-5 group-hover:scale-110 transition-transform`} />
  </div>
);

// ==========================================
// 2. KOMPONEN: TRAFFIC CHART (DIPERBAIKI)
// ==========================================
const TrafficChart = ({ data }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[300px] flex flex-col">
    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
      <HiLightningBolt className="text-yellow-500" />
      Traffic Request (24 Jam Terakhir)
    </h3>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.2} />
          
          {/* Sumbu X: Interval diatur agar tidak menumpuk */}
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 10, fill: '#94A3B8'}} 
            stroke="#94A3B8" 
            axisLine={false}
            tickLine={false}
            minTickGap={30} 
          />
          
          <YAxis 
            tick={{fontSize: 10, fill: '#94A3B8'}} 
            stroke="#94A3B8" 
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
          />
          
          <Area 
            type="monotone" 
            dataKey="requests" 
            stroke="#3B82F6" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorReq)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ==========================================
// 3. KOMPONEN: AUDIT LOG TABLE
// ==========================================
const CompactAuditTable = ({ logs }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[300px] flex flex-col">
    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
      <HiOutlineClock className="text-slate-500" />
      Aktivitas Terkini
    </h3>
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
      {!logs || logs.length === 0 ? (
        <p className="text-xs text-slate-500 text-center mt-10">Tidak ada aktivitas terbaru.</p>
      ) : (
        logs.slice(0, 10).map((log) => (
          <div key={log.id} className="flex gap-3 items-start pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
            <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
              log.action.includes("DELETE") ? "bg-red-500" :
              log.action.includes("CREATE") ? "bg-green-500" : "bg-blue-500"
            }`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {log.description || log.action}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                 <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 rounded">
                   {log.actor?.name || "System"}
                 </span>
                 <span className="text-[10px] text-slate-400">
                   {new Date(log.createdAt).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// ==========================================
// 4. MAIN PAGE: ADMIN DASHBOARD
// ==========================================
const AdminDashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    counts: { users: 0, documents: 0, groups: 0, verifications: 0 },
    traffic: [], 
    trends: { users: 0, documents: 0, groups: 0, verifications: 0 },
  });

  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Data Distribusi Pie Chart
  const pieData = [
    { name: 'Dokumen', value: dashboardData.counts.documents },
    { name: 'Verifikasi', value: dashboardData.counts.verifications },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Panggil 2 Endpoint
        const [summaryRes, logsRes] = await Promise.all([
          adminService.getDashboardSummary(), 
          adminService.getAllAuditLogs()      
        ]);

        // 1. Set Data Summary
        if (summaryRes.data) {
           setDashboardData(summaryRes.data); 
        }

        // 2. [FIXED] Set Data Logs (Perbaikan Logika)
        // Service mengembalikan array langsung, bukan object {data: []}
        if (Array.isArray(logsRes)) {
           setLogs(logsRes);
        } else if (logsRes?.data) {
           // Jaga-jaga jika struktur response berubah
           setLogs(logsRes.data);
        }

      } catch (err) {
        console.error("Dashboard Error:", err);
        const isAuthError = err.response?.status === 401;
        const isNetworkError = err.message === "Network Error" || err.code === "ECONNABORTED";

        if (!isAuthError && !isNetworkError) {
           // const message = err.response?.data?.message || "Gagal memuat data dashboard.";
           // toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
    );
  }

  return (
    <div className="mx-auto max-w-full space-y-4 animate-fade-in pb-8">
      
      {/* HEADER RINGKAS */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Real-time system monitoring & statistics.</p>
      </div>

      {/* 1. ROW: COMPACT STATS (4 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard 
          title="Total User" 
          value={dashboardData.counts.users} 
          icon={<HiUserGroup />} 
          color="bg-blue-500" 
          trend={dashboardData.trends.users} 
        />
        <CompactStatCard 
          title="Dokumen" 
          value={dashboardData.counts.documents} 
          icon={<HiDocumentText />} 
          color="bg-indigo-500" 
          trend={dashboardData.trends.documents} 
        />
        <CompactStatCard 
          title="Verifikasi" 
          value={dashboardData.counts.verifications} 
          icon={<HiShieldCheck />} 
          color="bg-green-500" 
          trend={dashboardData.trends.verifications} 
        />
        <CompactStatCard 
          title="Grup Aktif" 
          value={dashboardData.counts.groups} 
          icon={<HiOfficeBuilding />} 
          color="bg-orange-500" 
          trend={dashboardData.trends.groups} 
        />
      </div>

      {/* 2. ROW: CHARTS (Traffic & Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Kiri: Traffic Chart (Lebar) */}
        <div className="lg:col-span-2">
           <TrafficChart data={dashboardData.traffic} />
        </div>

        {/* Kanan: Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[300px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Distribusi Aset</h3>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-700 dark:text-white">
                    {dashboardData.counts.documents + dashboardData.counts.verifications}
                </span>
                <span className="text-[10px] text-slate-400">Total Item</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-xs text-slate-500">Docs</span>
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-500">Verifikasi</span>
              </div>
          </div>
        </div>
      </div>

      {/* 3. ROW: LOGS & SYSTEM HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
              <CompactAuditTable logs={logs} />
          </div>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white flex flex-col justify-center h-[300px] shadow-lg">
              <h3 className="font-bold text-lg mb-2">System Health</h3>
              <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-green-400 font-mono">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Versi API: v1.0.2 <br/>
                Latency: 24ms <br/>
                Database: Connected
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/50">
                Generate System Report
              </button>
          </div>
      </div>

    </div>
  );
};

export default AdminDashboardOverview;