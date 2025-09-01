import React from 'react';

const DashboardOverview = () => {
  return (
    <div id="tab-overview">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative bento-card bg-gray-900 p-6 rounded-xl">
          <div className="relative z-10">
            <h4 className="text-sm font-medium text-gray-400">Menunggu Tanda Tangan Anda</h4>
            <p className="text-3xl font-bold text-blue-400 mt-1">2</p>
          </div>
        </div>
        <div className="relative bento-card bg-gray-900 p-6 rounded-xl">
          <div className="relative z-10">
            <h4 className="text-sm font-medium text-gray-400">Dokumen Dalam Proses</h4>
            <p className="text-3xl font-bold text-white mt-1">5</p>
          </div>
        </div>
        <div className="relative bento-card bg-gray-900 p-6 rounded-xl">
          <div className="relative z-10">
            <h4 className="text-sm font-medium text-gray-400">Dokumen Selesai</h4>
            <p className="text-3xl font-bold text-green-400 mt-1">45</p>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-4">Tindakan Cepat</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
          <div>
            <p className="font-semibold text-white">Kontrak Freelance</p>
            <p className="text-sm text-gray-400">Dari: Klien - Desain Studio</p>
          </div>
          <a href="#" className="text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex-shrink-0 ml-4">Tanda Tangani</a>
        </div>
        <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
          <div>
            <p className="font-semibold text-white">Perjanjian Kerahasiaan (NDA)</p>
            <p className="text-sm text-gray-400">Dari: Mitra - PT. Cipta Solusi</p>
          </div>
          <a href="#" className="text-sm font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex-shrink-0 ml-4">Tanda Tangani</a>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;