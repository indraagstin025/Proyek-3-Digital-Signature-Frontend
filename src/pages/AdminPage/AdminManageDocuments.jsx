import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import { HiTrash, HiSearch, HiRefresh, HiDocumentText } from "react-icons/hi";

const AdminManageDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  // 1. Fetch Data Menggunakan Service yang Baru
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDocuments();
      setDocuments(data || []);
    } catch (error) {
      // Error sudah dihandle service toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter Pencarian
  const filteredDocs = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!docToDelete) return;
    if (!deleteReason.trim()) return toast.error("Wajib isi alasan!");

    toast.promise(
      adminService.forceDeleteDocument(docToDelete.id, deleteReason),
      {
        loading: "Menghapus paksa...",
        success: "Dokumen berhasil dihapus.",
        error: "Gagal menghapus."
      }
    ).then(() => {
        setIsConfirmOpen(false);
        setDocToDelete(null);
        setDeleteReason("");
        fetchDocuments(); // Refresh list setelah hapus
    });
  };

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Moderasi Dokumen</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Total Dokumen: {documents.length}</p>
        </div>
        <button onClick={fetchDocuments} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
            <HiRefresh className="text-slate-600 dark:text-slate-300"/>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
            type="text" 
            placeholder="Cari dokumen..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50/70 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Judul Dokumen</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Pemilik</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Grup</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Dibuat</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
               {loading ? (
                   <tr><td colSpan="5" className="text-center py-8">Memuat data...</td></tr>
               ) : filteredDocs.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-8 text-slate-500">Tidak ada dokumen ditemukan.</td></tr>
               ) : (
                   filteredDocs.map((doc) => (
                       <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                           <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600">
                                       <HiDocumentText />
                                   </div>
                                   <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-xs">{doc.title}</span>
                               </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                               {doc.owner?.name} <br/>
                               <span className="text-xs text-slate-400">{doc.owner?.email}</span>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                               {doc.group ? (
                                   <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">{doc.group.name}</span>
                               ) : (
                                   <span className="text-slate-400 text-xs">- Personal -</span>
                               )}
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-500">
                               {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                           </td>
                           <td className="px-6 py-4 text-right">
                               <button 
                                   onClick={() => { setDocToDelete(doc); setIsConfirmOpen(true); }}
                                   className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                   title="Hapus Paksa"
                               >
                                   <HiTrash className="w-5 h-5"/>
                               </button>
                           </td>
                       </tr>
                   ))
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Hapus (Sama seperti sebelumnya) */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-red-600 mb-2">Hapus Paksa Dokumen?</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    Tindakan ini permanen. Masukkan alasan untuk Audit Log.
                </p>
                <textarea 
                    className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-700 mb-6 focus:ring-2 focus:ring-red-500 outline-none"
                    rows="3"
                    placeholder="Alasan..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Batal</button>
                    <button onClick={confirmDelete} className="px-4 py-2 text-white bg-red-600 rounded-lg">Hapus</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminManageDocuments;