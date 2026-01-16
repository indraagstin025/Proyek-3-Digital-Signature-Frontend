import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBoxOpen, FaFilePdf, FaCheckCircle, FaClock, FaUserEdit, FaSpinner, FaEye } from "react-icons/fa";
import { packageService } from "../../services/packageService";
import toast from "react-hot-toast";

const PackageDetails = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  
  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getPackageDetails(packageId);
      setPackageData(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat detail paket.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1"><FaCheckCircle/> SELESAI</span>;
      case "pending":
      case "draft":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1"><FaClock/> MENUNGGU</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">{status}</span>;
    }
  };

  // Handler navigasi ke halaman view dokumen
  const handleViewDocument = (documentId) => {
    if (documentId) {
      navigate(`/documents/${documentId}/view`);
    } else {
      toast.error("ID Dokumen tidak ditemukan.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
        <p className="text-slate-500">Memuat detail paket...</p>
      </div>
    );
  }

  if (!packageData) return <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      {/* HEADER */}
      <div className="mb-6 pt-6">
        <button 
          onClick={() => navigate("/dashboard/packages")} 
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-4 text-sm font-medium"
        >
          <FaArrowLeft /> Kembali ke Riwayat
        </button>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
              <FaBoxOpen className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{packageData.title || "Paket Tanpa Judul"}</h1>
              <p className="text-slate-500 text-sm mt-1">Dibuat pada: {new Date(packageData.createdAt).toLocaleDateString("id-ID", { dateStyle: "full" })}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status Paket</span>
            {getStatusBadge(packageData.status)}
          </div>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 ml-1">Dokumen dalam Paket ({packageData.documents?.length || 0})</h2>
        
        {packageData.documents?.map((pkgDoc, index) => {
          // Ambil Data Dokumen Asli
          const documentId = pkgDoc.docVersion?.document?.id;
          const docTitle = pkgDoc.docVersion?.document?.title || "Dokumen Tidak Diketahui";
          
          // Cek apakah dokumen ini sudah ditanda tangani
          const isSigned = pkgDoc.signatures && pkgDoc.signatures.some(sig => sig.status === "SIGNED" || sig.signatureImageUrl);
          
          return (
            <div key={pkgDoc.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-sm">
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/10 rounded-lg flex items-center justify-center text-red-500">
                  <FaFilePdf className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">{docTitle}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {pkgDoc.id.substring(0, 8)}...</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* STATUS BADGE */}
                {isSigned ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                    <FaCheckCircle /> Signed
                  </span>
                ) : (
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                    <FaUserEdit /> Belum
                  </span>
                )}

                {/* [BARU] BUTTON VIEW */}
                <button
                  onClick={() => handleViewDocument(documentId)}
                  className="p-2 ml-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                  title="Lihat Dokumen"
                >
                  <FaEye className="text-lg" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION FOOTER */}
      {packageData.status !== "completed" && (
        <div className="mt-8 flex justify-end">
           <button 
             onClick={() => navigate(`/packages/sign/${packageId}`)}
             className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-transform active:scale-95 flex items-center gap-2"
           >
             <FaUserEdit /> Lanjut Tanda Tangan
           </button>
        </div>
      )}
    </div>
  );
};

export default PackageDetails;