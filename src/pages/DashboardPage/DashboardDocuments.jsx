import React from 'react';

const DashboardDocuments = () => {
  const documents = [
    { title: "Kontrak Freelance", status: "Menunggu TTD", signers: "1/2", lastUpdate: "Kemarin" },
    { title: "Proposal Proyek Internal", status: "Draft", signers: "0/3", lastUpdate: "2 hari lalu" },
    { title: "Invoice #123", status: "Selesai", signers: "2/2", lastUpdate: "5 hari lalu" }
  ];


  const getStatusClass = (status) => {
    switch (status) {
      case 'Menunggu TTD': return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
      case 'Selesai': return 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      default: return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400';
    }
  };

  return (
    <div id="tab-documents">
      {/* 1. Menambahkan Header dan Tombol Aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Semua Dokumen</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kelola semua dokumen Anda di satu tempat.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          <span>Tambah Dokumen</span>
        </button>
      </div>

      {/* 2. Menghapus <table> dan menggantinya dengan <div> untuk daftar kartu */}
      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/50 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex-grow">
              <p className="font-semibold text-slate-800 dark:text-white">{doc.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Penandatangan: {doc.signers} • Diperbarui: {doc.lastUpdate}</p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Status Badge */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClass(doc.status)}`}>
                {doc.status}
              </span>
              
              {/* Tombol Opsi (...) */}
              <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardDocuments;