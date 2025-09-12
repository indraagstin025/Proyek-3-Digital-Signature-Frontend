import React from 'react';

// 1. Komponen 'StatCard' baru yang bisa dipakai ulang (Reusable Component)
// Menerima properti: icon, label, value, dan valueColor untuk fleksibilitas
const StatCard = ({ icon, label, value, valueColor }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Ikon dengan latar belakang berwarna */}
      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50">
        {icon}
      </div>
      {/* Grup Teks */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`text-3xl font-bold ${valueColor || 'text-slate-800 dark:text-white'}`}>{value}</p>
      </div>
    </div>
  );
};


const DashboardOverview = ({ theme }) => {
  // eslint-disable-next-line no-unused-vars
  const isDark = theme === 'dark';

  // 2. Data untuk kartu-kartu overview. Ini membuat kode lebih mudah dikelola.
  const stats = [
    {
      label: "Menunggu Tanda Tangan Anda",
      value: 2,
      valueColor: "text-blue-500 dark:text-blue-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    },
    {
      label: "Dokumen Dalam Proses",
      value: 5,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: "Dokumen Selesai",
      value: 45,
      valueColor: "text-green-500 dark:text-green-400",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
  ];

  return (
    <div id="tab-overview">
      {/* 3. Menggunakan komponen StatCard dengan perulangan (looping) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tindakan Cepat</h3>
      
      {/* 4. Memperbarui tampilan "Tindakan Cepat" menjadi kartu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/50 transition-all hover:shadow-lg hover:-translate-y-1">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Kontrak Freelance</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Dari: Klien - Desain Studio</p>
          </div>
          <a href="#" className="text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex-shrink-0 ml-4">Tanda Tangani</a>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/50 transition-all hover:shadow-lg hover:-translate-y-1">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">Perjanjian Kerahasiaan (NDA)</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Dari: Mitra - PT. Cipta Solusi</p>
          </div>
          <a href="#" className="text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex-shrink-0 ml-4">Tanda Tangani</a>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;