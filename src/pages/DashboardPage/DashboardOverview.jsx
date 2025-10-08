import React from 'react';

// =================================================================
// 1. KOMPONEN 'STATCARD' DENGAN SKALA YANG DISESUAIKAN (Proporsional)
// =================================================================
const StatCard = ({ icon, label, value, valueColor }) => {
  return (
    // Padding p-4, shadow-lg, rounded-xl untuk tampilan profesional
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/50 transition-all hover:shadow-xl hover:-translate-y-0.5">
      
      {/* Container utama */}
      <div className="flex justify-between items-start mb-3">
        {/* Label - Kecil dan profesional */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p> 
        
        {/* Ikon - Ukuran h-5 w-5 */}
        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-900/50">
          {/* Menjaga ukuran ikon h-5 w-5 */}
          {React.cloneElement(icon, { className: "h-5 w-5 " + icon.props.className.split(' ').filter(c => !c.startsWith('h-') && !c.startsWith('w-')).join(' ') })} 
        </div>
      </div>
      
      {/* Nilai / Value - Ukuran text-4xl agar menonjol */}
      <p className={`text-4xl font-extrabold ${valueColor || 'text-slate-800 dark:text-white'}`}>{value}</p> 
      
    </div>
  );
};

// =================================================================
// 2. KOMPONEN UTAMA DASHBOARD OVERVIEW
// =================================================================
const DashboardOverview = ({ theme }) => {
  const isDark = theme === 'dark'; // eslint-disable-line no-unused-vars

  const stats = [
    {
      label: "Menunggu Tanda Tangan Anda",
      value: 2,
      valueColor: "text-blue-600 dark:text-blue-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    },
    {
      label: "Dokumen Dalam Proses",
      value: 5,
      valueColor: "text-amber-600 dark:text-amber-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: "Dokumen Selesai",
      value: 45,
      valueColor: "text-green-600 dark:text-green-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  // Data Dummy untuk Tabel Dokumen Aktifitas
  const latestActivities = [
    { name: "Perjanjian Sewa Kantor", date: "2 Jam lalu", status: "Selesai" },
    { name: "Persetujuan Cuti Tahunan", date: "1 Hari lalu", status: "Menunggu" },
    { name: "Kontrak Vendor Baru", date: "2 Hari lalu", status: "Dalam Proses" },
  ];

  // =================================================================
  // BAGIAN RETURN
  // =================================================================
  return (
    // Wrapper dengan pembatasan lebar dan padding atas
    <div id="tab-overview" className="mx-auto max-w-screen-xl pt-4"> 
      
      {/* 1. Statistik (Grid 3 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map(stat => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            valueColor={stat.valueColor}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* 2. Konten Utama: Grid 2/3 vs 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Tindakan Cepat & Tabel Aktivitas (2/3 lebar) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Blok Tindakan Cepat */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tindakan Cepat</h3>
                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-base">Kontrak Freelance</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Dari: Klien - Desain Studio</p>
                    </div>
                    <button type="button" className="text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 flex-shrink-0 ml-4 shadow-blue-500/50 shadow-lg">Tanda Tangani</button>
                  </div>
                  {/* Card 2 */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-base">Perjanjian Kerahasiaan (NDA)</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Dari: Mitra - PT. Cipta Solusi</p>
                    </div>
                    <button type="button" className="text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150 flex-shrink-0 ml-4 shadow-blue-500/50 shadow-lg">Tanda Tangani</button>
                  </div>
                </div>
            </div>

            {/* Blok Tabel Dokumen Aktivitas Terbaru */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Aktivitas Terbaru</h3>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dokumen</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-base">
                        {latestActivities.map((activity, index) => {
                          let statusColor = "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
                          if (activity.status === "Selesai") {
                            statusColor = "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
                          } else if (activity.status === "Menunggu") {
                            statusColor = "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900";
                          }

                          return (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">{activity.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColor}`}>
                                  {activity.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-sm">{activity.date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </div>

        {/* Kolom Kanan: Ringkasan Bulanan (Chart Placeholder) (1/3 lebar) */}
        <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Ringkasan Dokumen Bulanan</h3>
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/50 h-96 flex flex-col items-center justify-center space-y-4">
                <div className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-700 border-8 border-dashed border-blue-400 animate-pulse flex items-center justify-center text-base font-medium text-slate-500">
                    Placeholder Chart Pie/Donut
                </div>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm">Distribusi Status Dokumen Bulan Ini</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;