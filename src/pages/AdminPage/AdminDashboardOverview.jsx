import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// =====================================================================
// [1] KOMPONEN ChartStatCard YANG DISEMPURNAKAN
// =====================================================================
const ChartStatCard = ({ icon, title, total, data, barColor, gradientFrom, gradientTo }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Hitung nilai rata-rata dari data untuk garis referensi
  const average = data.length > 0 ? data.reduce((acc, entry) => acc + entry.value, 0) / data.length : 0;

  // Custom Tooltip yang lebih profesional
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-xs border border-slate-700">
          <p className="font-bold">{`${label}: ${payload[0].value} request`}</p>
        </div>
      );
    }
    return null;
  };
  
  // ID unik untuk setiap gradasi agar tidak konflik
  const gradientId = `grad-${title.replace(/\s+/g, '')}`;

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-4">
        <div className="flex items-center gap-3">
          {React.cloneElement(icon, { className: "h-6 w-6 group-hover:scale-110 transition-transform" })}
          <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
        </div>
      </div>
      
      <p className="text-5xl font-extrabold text-slate-800 dark:text-white mb-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">{total}</p>

      <div className="h-28 -mx-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive) setActiveIndex(state.activeTooltipIndex);
              else setActiveIndex(null);
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={gradientTo} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={<CustomTooltip />}
              position={{ y: -35 }}
              animationEasing="ease-out"
            />

            <ReferenceLine 
              y={average} 
              stroke="#9ca3af" 
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />

            <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={activeIndex === index ? barColor : `url(#${gradientId})`}
                  style={{ transition: 'fill 0.2s ease-in-out' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// =====================================================================
// [2] KOMPONEN UserActivityTable YANG DISEMPURNAKAN
// =====================================================================
const UserActivityTable = ({ users = [] }) => {
  const recentUsers = users.slice(0, 4);

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">Pengguna Terbaru</h3>
      <div className="space-y-5">
        {recentUsers.length > 0 ? (
          recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between transition-all hover:bg-slate-100/50 dark:hover:bg-slate-700/50 -mx-2 px-2 py-1.5 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={user.profilePictureUrl || `https://i.pravatar.cc/40?u=${user.email}`}
                  alt="Avatar"
                  className="w-11 h-11 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
                />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.isSuperAdmin ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                {user.isSuperAdmin ? "Admin" : "User"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">Belum ada aktivitas pengguna.</p>
        )}
      </div>
    </div>
  );
};


// =====================================================================
// [3] KOMPONEN UTAMA AdminDashboardOverview
// =====================================================================
const AdminDashboardOverview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await adminService.getAllUsers();
        const sortedUsers = fetchedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUsers(sortedUsers);
      } catch (error) {
        toast.error(error.message || "Gagal memuat data pengguna.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.isSuperAdmin).length;

  const userChartData = [
    { name: "Sen", value: 12 }, { name: "Sel", value: 19 },
    { name: "Rab", value: 3 }, { name: "Kam", value: 5 },
    { name: "Jum", value: 2 }, { name: "Sab", value: 3 }, { name: "Min", value: 9 },
  ];
  const adminChartData = [
    { name: "Sen", value: 1 }, { name: "Sel", value: 0 },
    { name: "Rab", value: 0 }, { name: "Kam", value: 1 },
    { name: "Jum", value: 0 }, { name: "Sab", value: 0 }, { name: "Min", value: 0 },
  ];

  return (
    <div className="mx-auto max-w-screen-xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartStatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title="Total Pengguna"
            total={loading ? "..." : totalUsers}
            data={userChartData}
            barColor="#3b82f6"
            gradientFrom="#3b82f6" // <-- Tambahkan prop gradasi
            gradientTo="#818cf8"   // <-- Tambahkan prop gradasi
          />
        </div>
        <div>
          <ChartStatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            title="Admin Terdaftar"
            total={loading ? "..." : totalAdmins}
            data={adminChartData}
            barColor="#10b981"
            gradientFrom="#10b981" // <-- Tambahkan prop gradasi
            gradientTo="#6ee7b7"   // <-- Tambahkan prop gradasi
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserActivityTable users={users} />
        </div>
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700/50 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tindakan Cepat</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Akses cepat untuk fungsi administratif.</p>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;