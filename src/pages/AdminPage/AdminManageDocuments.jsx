import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import { 
  HiTrash, HiSearch, HiRefresh, HiDocumentText, 
  HiOfficeBuilding, HiUser, HiCollection, 
  HiChevronLeft, HiChevronRight 
} from "react-icons/hi";

const AdminManageDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Modal Konfirmasi Hapus
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 1. Fetch Data
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDocuments();
      setDocuments(data || []);
    } catch (error) {
      console.error("Gagal mengambil dokumen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Filter Pencarian
  const filteredDocs = documents.filter(doc => 
      (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.owner?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Logic Pagination (Client-Side)
  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 4. Logic Hapus
  const confirmDelete = async () => {
    if (!docToDelete) return;
    if (!deleteReason.trim()) {
        toast.error("Wajib menyertakan alasan penghapusan!");
        return;
    }

    try {
        await adminService.forceDeleteDocument(docToDelete.id, deleteReason);
        toast.success("Dokumen berhasil dihapus.");
        setDocuments(prev => prev.filter(d => d.id !== docToDelete.id)); // Update UI Optimistic
        setIsConfirmOpen(false);
        setDocToDelete(null);
        setDeleteReason("");
    } catch (error) {
        toast.error("Gagal menghapus dokumen.");
    }
  };

  // Helper untuk menentukan Tipe Dokumen (Personal/Group/Package)
  const getDocumentTypeInfo = (doc) => {
    if (doc.group) {
        return { 
            label: "GROUP", 
            subLabel: doc.group.name,
            icon: <HiOfficeBuilding className="w-3 h-3"/>, 
            style: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" 
        };
    }
    // Asumsi: Jika ada field 'type' bernilai 'package' atau logika lain
    if (doc.type === 'package') {
        return { 
            label: "PACKAGE", 
            subLabel: "Batch Signing",
            icon: <HiCollection className="w-3 h-3"/>, 
            style: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" 
        };
    }
    return { 
        label: "PERSONAL", 
        subLabel: "Private",
        icon: <HiUser className="w-3 h-3"/>, 
        style: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" 
    };
  };

  return (
    <div className="mx-auto max-w-full space-y-4 animate-fade-in pb-8">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                <HiDocumentText className="w-5 h-5"/>
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Moderasi Dokumen</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total: {filteredDocs.length} Dokumen</p>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Cari judul atau pemilik..." 
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset ke hal 1 saat search
                    }}
                />
            </div>
            <button 
                onClick={fetchDocuments} 
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                title="Refresh Data"
            >
                <HiRefresh className="w-5 h-5"/>
            </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-4 py-3 w-16 text-center">#</th>
                <th className="px-4 py-3">Informasi Dokumen</th>
                <th className="px-4 py-3">Pemilik</th>
                <th className="px-4 py-3 text-center">Kategori</th>
                <th className="px-4 py-3 text-center">Tanggal Dibuat</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {loading ? (
                   <tr><td colSpan="6" className="text-center py-20 text-sm text-slate-500">Memuat data dokumen...</td></tr>
               ) : currentData.length === 0 ? (
                   <tr><td colSpan="6" className="text-center py-20 text-sm text-slate-500">Tidak ada dokumen ditemukan.</td></tr>
               ) : (
                   currentData.map((doc, index) => {
                       const typeInfo = getDocumentTypeInfo(doc);
                       const globalIndex = startIndex + index + 1; // Index global

                       return (
                           <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                               {/* 1. Index */}
                               <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">
                                   {globalIndex}
                               </td>

                               {/* 2. Judul Dokumen */}
                               <td className="px-4 py-3">
                                   <div className="max-w-[250px]">
                                       <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={doc.title}>
                                           {doc.title}
                                       </p>
                                       <p className="text-[10px] text-slate-400 font-mono truncate">
                                           ID: {doc.id}
                                       </p>
                                   </div>
                               </td>

                               {/* 3. Pemilik */}
                               <td className="px-4 py-3">
                                   <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                           {doc.owner?.name?.charAt(0).toUpperCase() || "?"}
                                       </div>
                                       <div>
                                           <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{doc.owner?.name || "Unknown"}</p>
                                           <p className="text-[10px] text-slate-500">{doc.owner?.email}</p>
                                       </div>
                                   </div>
                               </td>

                               {/* 4. Kategori (Badge) */}
                               <td className="px-4 py-3 text-center">
                                   <div className={`inline-flex flex-col items-center justify-center px-2 py-1 rounded-md border ${typeInfo.style}`}>
                                       <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider">
                                           {typeInfo.icon}
                                           <span>{typeInfo.label}</span>
                                       </div>
                                       {/* Sub-label untuk nama grup jika ada */}
                                       {typeInfo.subLabel && typeInfo.label === 'GROUP' && (
                                           <span className="text-[9px] opacity-80 mt-0.5 max-w-[80px] truncate">
                                               {typeInfo.subLabel}
                                           </span>
                                       )}
                                   </div>
                               </td>

                               {/* 5. Tanggal */}
                               <td className="px-4 py-3 text-center text-xs text-slate-600 dark:text-slate-400">
                                   {new Date(doc.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                               </td>

                               {/* 6. Aksi */}
                               <td className="px-4 py-3 text-center">
                                   <button 
                                       onClick={() => {
                                           setDocToDelete(doc);
                                           setIsConfirmOpen(true);
                                       }}
                                       className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                       title="Hapus Paksa"
                                   >
                                       <HiTrash className="w-4 h-4" />
                                   </button>
                               </td>
                           </tr>
                       );
                   })
               )}
            </tbody>
          </table>
        </div>

        {/* FOOTER: PAGINATION */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-bold text-slate-800 dark:text-white">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredDocs.length)}</span> dari {filteredDocs.length} data
            </p>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                >
                    <HiChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Hal {currentPage} / {totalPages || 1}
                </div>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                >
                    <HiChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <div className="p-3 bg-red-100 rounded-full">
                        <HiTrash className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Hapus Paksa Dokumen?</h3>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-4 text-sm border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Target:</p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{docToDelete?.title}</p>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    Tindakan ini <b>tidak dapat dibatalkan</b>. Masukkan alasan penghapusan untuk dicatat di Audit Log.
                </p>
                
                <textarea 
                    className="w-full p-3 text-sm border rounded-lg bg-white dark:bg-slate-950 dark:border-slate-700 mb-6 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
                    rows="3"
                    placeholder="Contoh: Konten melanggar kebijakan..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                />
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsConfirmOpen(false)} 
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={confirmDelete} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/30 transition-all transform active:scale-95"
                    >
                        Ya, Hapus Permanen
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageDocuments;