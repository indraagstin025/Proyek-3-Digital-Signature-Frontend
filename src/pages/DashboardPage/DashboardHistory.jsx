import React from 'react';

// eslint-disable-next-line no-unused-vars
const DashboardHistory = ({ theme }) => {
  // Menambahkan lebih banyak data untuk contoh tampilan linimasa
  const history = [
    { id: 1, title: "Invoice #123", time: "26 Jun 2025, 14:30", method: "Canvas", status: "Valid" },
    { id: 2, title: "Kontrak Kemitraan", time: "25 Jun 2025, 09:15", method: "QR Code", status: "Belum Diverifikasi" },
    { id: 3, title: "Perjanjian Kerahasiaan (NDA)", time: "24 Jun 2025, 18:00", method: "Canvas", status: "Valid" },
  ];

  // Fungsi untuk gaya status badge yang sudah diperbarui
  const getStatusClass = (status) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  return (
      <div id="tab-overview" className="mx-auto max-w-screen-xl pt-4"> 
      {/* 1. Menambahkan Header Halaman untuk konsistensi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Riwayat Aktivitas</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Semua jejak audit dan aktivitas penandatanganan.</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              <span>Ekspor Riwayat</span>
          </button>
      </div>

      {/* 2. Kontainer Utama untuk Linimasa (Timeline) */}
      <div className="space-y-8">
        {history.map((item) => (
          // 3. Looping data riwayat untuk membuat setiap item linimasa
          <div key={item.id} className="flex gap-4">
            
            {/* 4. Struktur Item Linimasa (Ikon, Dot, dan Garis) */}
            <div className="flex flex-col items-center">
                <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-grow w-px bg-slate-200 dark:bg-slate-700 my-2"></div>
            </div>

            {/* 5. Kartu Konten */}
            <div className="flex-grow">
              <p className="font-semibold text-slate-800 dark:text-white">{item.title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span>{item.time}</span>
                <span className="hidden sm:inline">•</span>
                <span>Metode: {item.method}</span>
              </div>
              {/* Status Badge */}
              <div className="mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHistory;