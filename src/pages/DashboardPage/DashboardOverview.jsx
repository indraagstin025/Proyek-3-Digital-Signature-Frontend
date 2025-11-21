import React from 'react';

// =================================================================
// 1. KOMPONEN STATCARD (Mobile Optimized)
// =================================================================
const StatCard = ({ icon, label, value, valueColor }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/50 flex flex-col justify-between h-full transition-all hover:shadow-xl">
      
      <div className="flex justify-between items-start mb-3">
        {/* Label: Ukuran text-xs agar muat di layar sempit */}
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-2">
            {label}
        </p> 
        
        {/* Icon Wrapper */}
        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-900/50 shrink-0">
          {React.cloneElement(icon, { className: "h-5 w-5 " + icon.props.className.split(' ').filter(c => !c.startsWith('h-') && !c.startsWith('w-')).join(' ') })} 
        </div>
      </div>
      
      {/* Value: text-3xl di HP agar tidak terlalu raksasa, text-4xl di Desktop */}
      <p className={`text-3xl sm:text-4xl font-extrabold ${valueColor || 'text-slate-800 dark:text-white'} truncate`}>
        {value}
      </p> 
    </div>
  );
};

// =================================================================
// 2. DASHBOARD OVERVIEW (Fixed Top Spacing)
// =================================================================
const DashboardOverview = ({ theme }) => {

  // Data Stats
  const stats = [
    {
      label: "Menunggu TTD", 
      value: 2,
      valueColor: "text-blue-600 dark:text-blue-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    },
    {
      label: "Dalam Proses",
      value: 5,
      valueColor: "text-amber-600 dark:text-amber-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: "Selesai",
      value: 45,
      valueColor: "text-green-600 dark:text-green-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  // Data Aktivitas
  const latestActivities = [
    { name: "Perjanjian Sewa Kantor", date: "2 Jam lalu", status: "Selesai" },
    { name: "Persetujuan Cuti", date: "1 Hari lalu", status: "Menunggu" }, 
    { name: "Kontrak Vendor Baru", date: "2 Hari lalu", status: "Proses" },
  ];

  // Data Tindakan Cepat
  const quickActions = [
    { title: "Kontrak Freelance", sub: "Dari: Klien - Desain Studio" },
    { title: "Perjanjian NDA", sub: "Dari: Mitra - PT. Cipta Solusi" }
  ];

  return (
    // PERBAIKAN DISINI:
    // px-4 (Kiri Kanan Mobile)
    // pt-8 (Jarak Atas Mobile diperbesar agar tidak mepet Navbar)
    // sm:pt-10 (Jarak Atas Desktop lebih besar lagi)
    <div id="tab-overview" className="mx-auto max-w-screen-xl px-4 pt-8 pb-8 sm:px-6 sm:pt-10 space-y-6"> 
      
      {/* 1. GRID STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            valueColor={stat.valueColor}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- KOLOM KIRI (Area Kerja Utama) --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* A. Tindakan Cepat */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                  Tindakan Cepat
                </h3>
                <div className="space-y-3">
                  {quickActions.map((item, i) => (
                    <div 
                      key={i} 
                      // Flex-col (atas-bawah) di Mobile, Flex-row (kiri-kanan) di Tablet/Desktop
                      className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                        <div className="min-w-0"> 
                            <p className="font-bold text-slate-800 dark:text-white text-base truncate">
                              {item.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {item.sub}
                            </p>
                        </div>
                        
                        {/* Tombol: Full width (w-full) di Mobile agar mudah dipencet */}
                        <button 
                          type="button" 
                          className="w-full sm:w-auto whitespace-nowrap text-sm font-semibold bg-blue-600 text-white py-2.5 px-5 rounded-lg hover:bg-blue-700 transition active:scale-95 shadow-md"
                        >
                            Tanda Tangani
                        </button>
                    </div>
                  ))}
                </div>
            </div>

            {/* B. Tabel Aktivitas */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                  Aktivitas Terbaru
                </h3>
                <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                  {/* Scroll Horizontal untuk Mobile */}
                  <div className="overflow-x-auto touch-pan-x pb-2">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dokumen</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {latestActivities.map((activity, index) => {
                          let statusColor = "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30";
                          if (activity.status === "Selesai") statusColor = "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
                          if (activity.status === "Menunggu") statusColor = "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30";

                          return (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-sm text-slate-900 dark:text-white">
                                {activity.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${statusColor}`}>
                                  {activity.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                                {activity.date}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </div>

        {/* --- KOLOM KANAN (Chart) --- */}
        <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
              Ringkasan
            </h3>
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
                <div className="w-40 h-40 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-dashed border-blue-400 animate-pulse flex items-center justify-center p-4 text-center">
                   <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
                     Chart Area
                   </span>
                </div>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                    Status Dokumen Bulan Ini
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;