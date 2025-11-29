/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // [MODIFIKASI]: Tambah useNavigate
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaUpload, FaFileContract, FaKey, FaClock, FaDownload } from "react-icons/fa"; 
import { toast, Toaster } from "react-hot-toast";
import { signatureService } from "../../services/signatureService.js";

const VerificationPage = () => {
  const { signatureId: initialSignatureId } = useParams();
  const navigate = useNavigate(); // [MODIFIKASI]: Init navigasi

  const [verificationData, setVerificationData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [manualFile, setManualFile] = useState(null);
  const [manualSignatureId, setManualSignatureId] = useState(initialSignatureId || "");
  const [isVerifyingFile, setIsVerifyingFile] = useState(false);
  const [manualVerificationResult, setManualVerificationResult] = useState(null);

  useEffect(() => {
    if (!initialSignatureId) {
      setError("ID Tanda Tangan tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const response = await signatureService.getVerificationDetails(initialSignatureId);
        setVerificationData(response.data);
        toast.success("Data tanda tangan ditemukan.");
      } catch (err) {
        console.error("Gagal verifikasi otomatis:", err);
        setError(err.message || "Gagal mengambil data verifikasi.");
        toast.error("Gagal memuat data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [initialSignatureId]);

  // [MODIFIKASI]: Handler untuk tombol "Lihat Dokumen Asli"
// [MODIFIKASI]: Handler untuk tombol "Lihat Dokumen Asli"
  const handleViewOriginal = (e) => {
    e.preventDefault(); 

    // 1. Ambil data dari LocalStorage dengan key yang BENAR ("authUser")
    const userString = localStorage.getItem("authUser");
    let isLoggedIn = false;

    // 2. Cek dan Parse JSON karena authService menyimpannya sebagai string object
    if (userString) {
        try {
            const user = JSON.parse(userString);
            // Cek apakah ada properti token di dalamnya
            if (user && user.token) {
                isLoggedIn = true;
            }
        } catch (error) {
            console.error("Gagal parsing sesi login:", error);
            // Jika JSON rusak, anggap belum login
            isLoggedIn = false; 
        }
    }

    if (isLoggedIn) {
        // SKENARIO A: SUDAH LOGIN
        toast.success("Mengarahkan ke Dashboard...");
        navigate("/dashboard/documents");
    } else {
        // SKENARIO B: BELUM LOGIN
        toast.error("Akses terbatas. Silakan login untuk mengakses dokumen asli.");
        navigate("/login");
    }
  };

  const handleFileChange = (e) => {
    setManualFile(e.target.files[0]);
    setManualVerificationResult(null); 
  };

  const handleManualVerification = useCallback(async (e) => {
    e.preventDefault();

    if (!manualSignatureId) return toast.error("Harap masukkan ID Tanda Tangan.");
    if (!manualFile) return toast.error("Harap unggah file PDF yang ingin Anda verifikasi.");

    setIsVerifyingFile(true);
    setManualVerificationResult(null);
    
    try {
        const response = await signatureService.verifyUploadedFile(manualSignatureId, manualFile);
        setManualVerificationResult(response.data);
        
        if (response.data.isHashMatch) {
            toast.success("Valid! Dokumen cocok dengan data sistem.");
        } else {
            toast.error("INVALID! Dokumen telah dimodifikasi.");
        }

    } catch (err) {
        console.error("Gagal verifikasi file yang diunggah:", err);
        toast.error(err.message || "Verifikasi file gagal.");
    } finally {
        setIsVerifyingFile(false);
    }
  }, [manualSignatureId, manualFile]);


  // =================================================================
  // RENDER DINI (Loading & Error)
  // =================================================================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-5xl text-blue-500" />
        <p className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">Memuat Data Verifikasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-10 max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl border-t-4 border-red-500">
          <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Tidak Ditemukan</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Data verifikasi tidak tersedia.</div>;
  }

  // =================================================================
  // LOGIKA STATUS
  // =================================================================

  const isRegistered = verificationData.verificationStatus === "REGISTERED"; 
  
  const statusColor = isRegistered ? "bg-green-600" : "bg-red-600";
  const statusRing = isRegistered ? "ring-green-300" : "ring-red-300";
  const statusIcon = isRegistered ? FaCheckCircle : FaTimesCircle;
  
  const statusText = isRegistered ? "TERDAFTAR DI SISTEM" : "TIDAK TERDAFTAR";
  const statusSubText = isRegistered ? "Identitas Valid. Silakan cek integritas isi dokumen di bawah." : "ID Tanda tangan tidak dikenali.";

  const manualResult = manualVerificationResult;
  const isManualValid = manualResult?.isHashMatch; 
  const manualStatusColor = isManualValid ? "bg-green-600" : "bg-red-600";
  const showManualResult = manualVerificationResult && !isVerifyingFile;


  // =================================================================
  // RENDER UTAMA
  // =================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <Toaster />
      <div className={`max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden ring-4 ${statusRing}`}>
        
        {/* HEADER STATUS */}
        <div className={`p-6 text-white ${statusColor} flex items-center justify-center`}>
          <div className="text-center">
            {React.createElement(statusIcon, { className: "text-5xl mx-auto mb-3" })}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
              {statusText}
            </h1>
            <p className="mt-2 text-blue-50 text-sm sm:text-base font-medium">{statusSubText}</p>
            <div className="mt-4 inline-block bg-black/20 px-4 py-1 rounded-full text-xs font-mono">
                ID: {initialSignatureId}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-12">
          
          {/* CARD 1: DETAIL DOKUMEN DAN PENANDA TANGAN */}
          <section className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl shadow-inner border border-gray-100 dark:border-gray-600">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center">
              <FaFileContract className="mr-3 text-blue-500" /> Detail Dokumen Resmi
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 dark:text-gray-300">
              
              <div className="sm:col-span-2"> 
                <dt className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Judul Dokumen</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white break-words"> 
                    {verificationData.documentTitle}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Penanda Tangan</dt>
                <dd className="mt-1 font-semibold text-base">{verificationData.signerName}</dd>
                <dd className="text-sm text-gray-500">{verificationData.signerEmail}</dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 flex items-center">
                    <FaClock className="mr-1"/> Waktu Penandatanganan
                </dt>
                <dd className="mt-1 font-mono text-sm">{new Date(verificationData.signedAt).toLocaleString()}</dd>
              </div>

              <div className="sm:col-span-2 pt-2">
                 <dt className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">IP Address Pencatatan</dt>
                 <dd className="mt-1 font-mono text-xs bg-gray-200 dark:bg-gray-800 inline-block px-2 py-1 rounded">
                    {verificationData.ipAddress}
                 </dd>
              </div>
            </dl>
          </section>

          {/* CARD 2: BUKTI INTEGRITAS & CEK VISUAL (MODIFIKASI LINK) */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <FaKey className="mr-3 text-yellow-500" /> Referensi Integritas (Cek Visual)
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Untuk memastikan dokumen fisik/file yang Anda pegang <b>belum dimodifikasi</b>, silakan bandingkan dengan data referensi server di bawah ini.
            </p>

            <dl className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              {/* HASH ASLI DARI SERVER */}
              <div>
                <dt className="font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                    Hash Dokumen Asli (SHA-256)
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Server Database</span>
                </dt>
                <dd className="font-mono text-xs p-3 rounded mt-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 break-all border border-gray-200 dark:border-gray-700">
                  {verificationData.storedFileHash}
                </dd>
              </div>

              {/* TOMBOL DOWNLOAD ASLI - DIUBAH AGAR MENGARAHKAN KE LOGIN/DASHBOARD */}
              {verificationData.originalDocumentUrl && (
                  <div className="pt-2">
                    <button 
                        onClick={handleViewOriginal} // [MODIFIKASI]: Menggunakan handler klik, bukan href langsung
                        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition font-semibold text-sm cursor-pointer"
                    >
                        <FaDownload className="mr-2" />
                        Lihat / Unduh Dokumen Asli
                    </button>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        *Anda harus login untuk mengakses file asli demi keamanan.
                    </p>
                  </div>
              )}
            </dl>
          </section>

          {/* CARD 3: UJI INTEGRITAS UPLOAD (MANUAL) - Tetap sama */}
          <section className="bg-blue-50 dark:bg-gray-700/30 p-6 rounded-xl shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center">
              <FaUpload className="mr-3 text-blue-500" /> Validasi Lanjutan (Upload File)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Ragu dengan dokumen di tangan Anda? Unggah file PDF-nya di sini untuk validasi matematika otomatis.
            </p>
            
            <form onSubmit={handleManualVerification} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-blue-50 transition">
                      <FaUpload className="text-blue-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-500 text-center truncate w-full px-2">
                          {manualFile ? manualFile.name : "Pilih File PDF"}
                      </span>
                      <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                  </label>

                  <button
                      type="submit"
                      disabled={!manualFile || isVerifyingFile}
                      className={`px-6 py-3 text-white font-bold rounded-lg shadow-md transition flex items-center justify-center sm:w-auto ${
                          !manualFile || isVerifyingFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                      {isVerifyingFile ? <FaSpinner className="animate-spin" /> : "Cek Validitas"}
                  </button>
              </div>
            </form>

            {/* HASIL UJI MANUAL */}
            {showManualResult && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 animate-fade-in-up">
                    <div className={`p-4 text-white rounded-lg shadow-md mb-4 ${manualStatusColor}`}>
                        <h3 className="text-lg font-bold flex items-center">
                            {isManualValid ? <FaCheckCircle className="mr-3" /> : <FaTimesCircle className="mr-3" />}
                            Status File Upload: {manualResult.verificationStatus}
                        </h3>
                    </div>

                    {!isManualValid ? (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                             <p className="font-bold">❌ Integritas Gagal!</p>
                             <p>File yang Anda unggah memiliki Hash yang berbeda dengan server. Dokumen ini kemungkinan telah diedit.</p>
                             <div className="mt-2 text-xs font-mono bg-white dark:bg-black/20 p-2 rounded">
                                <div>Upload: {manualResult.recalculatedFileHash?.substring(0, 30)}...</div>
                                <div>Server: {manualResult.storedFileHash?.substring(0, 30)}...</div>
                             </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded text-sm text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                            <p className="font-bold">✅ Dokumen Asli!</p>
                            <p>Isi dokumen yang Anda unggah 100% cocok dengan arsip kami.</p>
                        </div>
                    )}
                </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default VerificationPage;