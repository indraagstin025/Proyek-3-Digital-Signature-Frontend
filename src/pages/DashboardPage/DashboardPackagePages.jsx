import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaSpinner, FaSearch, FaClock, FaCheckCircle, FaFileSignature, FaEye, FaArrowRight, FaPlus } from "react-icons/fa";
import { packageService } from "../../services/packageService"; 
import toast from "react-hot-toast";

const DashboardPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const pageTitle = "Riwayat Paket";
  const pageDescription = "Lacak status bundle dokumen tanda tangan Anda.";
  
  // 🔥 UPDATE ICON BOX: Konsisten dengan Workspace (Ungu)
  const pageIcon = (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-2xl border border-purple-100 dark:border-purple-800/50 flex items-center justify-center shadow-sm">
        <FaBoxOpen className="w-6 h-6 text-purple-600 dark:text-purple-500"/>
    </div>
  );

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getAllPackages(); 
      const validData = Array.isArray(data) ? data : [];
      setPackages(validData);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Gagal memuat riwayat paket.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueSign = (packageId) => { navigate(`/packages/sign/${packageId}`); };
  const handleViewDetails = (packageId) => { navigate(`/dashboard/packages/${packageId}`); };
  const handleCreateNewPackage = () => {
    navigate("/dashboard/documents/personal");
    toast("Silakan pilih dokumen lalu klik 'Batch Sign'", { icon: "👆", duration: 4000 });
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pkg.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "COMPLETED": return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200"><FaCheckCircle /> SELESAI</span>;
      case "PENDING": return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">PENDING</span>;
      case "DRAFT": return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">DRAFT</span>;
      default: return <span className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold border border-blue-200">{s}</span>;
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar relative bg-transparent">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 px-3 sm:px-8 pt-2 sm:pt-4 pb-2">
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md -z-10 shadow-sm border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" />
        
        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
             <div className="flex flex-col gap-4 w-full md:w-2/3 lg:w-1/2">
                <div className="flex items-center gap-3">
                    {pageIcon}
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{pageTitle}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{pageDescription}</p>
                    </div>
                </div>
                <div className="relative w-full sm:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input 
                        type="text" placeholder="Cari nama paket..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none shadow-sm"
                    />
                </div>
             </div>
             <div className="flex shrink-0">
                <button onClick={handleCreateNewPackage} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium h-10 px-5 rounded-lg shadow-sm shadow-purple-500/20 transition-all active:scale-95 whitespace-nowrap">
                  <FaPlus className="text-xs" /> <span>Buat Paket Baru</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-8 pb-20 mt-2 sm:mt-4 max-w-7xl mx-auto">
        {isLoading && filteredPackages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-purple-500 mb-4" />
            <span className="text-slate-500 font-medium">Memuat data paket...</span>
          </div>
        )}

        {!isLoading && filteredPackages.length === 0 && (
          <div className="text-center py-20 px-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="bg-purple-50 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               {searchQuery ? <FaSearch className="text-2xl text-purple-300"/> : <FaBoxOpen className="text-2xl text-purple-400" />}
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{searchQuery ? "Paket tidak ditemukan" : "Belum Ada Riwayat Paket"}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">{searchQuery ? `Tidak ada hasil untuk pencarian "${searchQuery}"` : "Anda belum membuat paket tanda tangan massal."}</p>
            {!searchQuery && (
                <button onClick={handleCreateNewPackage} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors text-sm">
                    Mulai Buat Paket Sekarang
                </button>
            )}
          </div>
        )}

        {!isLoading && filteredPackages.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 w-full sm:w-auto">
                  <div className="p-3.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                    <FaFileSignature className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base truncate pr-2" title={pkg.title || pkg.name}>{pkg.title || pkg.name || "Paket Tanpa Judul"}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-slate-400"/> {new Date(pkg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-medium">{pkg.documentCount || pkg._count?.documents || 0} Dokumen</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-700 mt-2 sm:mt-0">
                  {getStatusBadge(pkg.status)}
                  <div className="flex items-center gap-2">
                    {(pkg.status === 'PENDING' || pkg.status === 'DRAFT' || pkg.status === 'draft') && (
                      <button onClick={() => handleContinueSign(pkg.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-purple-500/20 transition-all hover:-translate-y-0.5 active:scale-95">
                          <span>Lanjut</span> <FaArrowRight className="text-xs"/>
                      </button>
                    )}
                    <button onClick={() => handleViewDetails(pkg.id)} className="p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-500 transition-colors" title="Lihat Detail">
                      <FaEye />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPackages;