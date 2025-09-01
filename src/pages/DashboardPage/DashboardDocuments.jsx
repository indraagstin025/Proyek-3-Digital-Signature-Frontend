import React from 'react';

const DashboardDocuments = () => {
  const documents = [
    { title: "Kontrak Freelance", status: "Menunggu TTD", signers: "1/2" },
    { title: "Proposal Proyek Internal", status: "Draft", signers: "0/3" },
    { title: "Invoice #123", status: "Selesai", signers: "2/2" }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Menunggu TTD': return 'bg-orange-500/20 text-orange-400';
      case 'Selesai': return 'bg-green-500/20 text-green-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div id="tab-documents">
      <div className="relative bento-card bg-gray-900 rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-xs text-gray-400 uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">Judul Dokumen</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Penandatangan</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr key={index} className="border-b border-white/10">
                <th className="px-6 py-4 font-medium text-white whitespace-nowrap">{doc.title}</th>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">{doc.signers}</td>
                <td className="px-6 py-4 text-right">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardDocuments;