import React from 'react';

const DashboardHistory = () => {
  const history = [
    { title: "Invoice #123", time: "26 Jun 2025, 14:30", method: "Canvas", status: "Valid" },
    { title: "Kontrak Kemitraan", time: "25 Jun 2025, 09:15", method: "QR Code", status: "Belum Diverifikasi" }
  ];

  return (
    <div id="tab-history">
      <div className="relative bento-card bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-3">Judul Dokumen</th>
              <th className="px-6 py-3">Waktu TTD</th>
              <th className="px-6 py-3">Metode</th>
              <th className="px-6 py-3">Status Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-b border-white/10">
                <th className="px-6 py-4 font-medium text-white">{item.title}</th>
                <td className="px-6 py-4">{item.time}</td>
                <td className="px-6 py-4">{item.method}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === 'Valid' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/50 text-gray-300'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardHistory;