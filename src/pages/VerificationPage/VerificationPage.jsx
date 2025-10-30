import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaUpload, FaFileContract, FaKey, FaClock } from "react-icons/fa"; // Tambah beberapa icon baru
import { toast, Toaster } from "react-hot-toast";
import { signatureService } from "../../services/signatureService";

const VerificationPage = () => {
  const { signatureId: initialSignatureId } = useParams();
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
        toast.success("Verifikasi dokumen resmi berhasil dimuat!");
      } catch (err) {
        console.error("Gagal verifikasi otomatis:", err);
        setError(err.message || "Gagal mengambil data verifikasi.");
        toast.error(err.message || "Verifikasi otomatis gagal.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [initialSignatureId]);

  
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
        toast.success("Verifikasi file yang diunggah selesai!");

    } catch (err) {
        console.error("Gagal verifikasi file yang diunggah:", err);
        toast.error(err.message || "Verifikasi file gagal. Pastikan ID dan file sudah benar.");
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
        <p className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">Memverifikasi Dokumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-10 max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl border-t-4 border-red-500">
          <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verifikasi Gagal</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium">
            Kembali ke Beranda
          </a>
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

  const isValid = verificationData.recalculatedFileHash === verificationData.storedFileHash; 
  const statusColor = isValid ? "bg-green-600" : "bg-red-600";
  const statusRing = isValid ? "ring-green-300" : "ring-red-300";
  const statusIcon = isValid ? FaCheckCircle : FaTimesCircle;
  const statusText = isValid ? "ASLI DAN UTUH" : "TELAH DIMODIFIKASI";
  
  
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
            {React.createElement(statusIcon, { className: "text-4xl mx-auto mb-2" })}
            <h1 className="text-2xl font-extrabold tracking-tight">
              STATUS VERIFIKASI DOKUMEN: {statusText}
            </h1>
            <p className="mt-1 text-sm font-light">Tanda Tangan ID: <span className="font-mono">{initialSignatureId}</span></p>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-12">
          
          {/* DETAIL DOKUMEN DAN PENANDA TANGAN (CARD 1) */}
{/* DETAIL DOKUMEN DAN PENANDA TANGAN (CARD 1) */}
          <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center">
              <FaFileContract className="mr-3 text-blue-500" /> Detail Dokumen Resmi
            </h2>
            {/* Ganti grid lama menjadi struktur yang lebih fleksibel */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 dark:text-gray-300">
              
              {/* Judul Dokumen - DIKORREKSI AGAR MENGGUNAKAN LEBAR PENUH DAN TRUNCATE */}
              <div className="sm:col-span-2"> {/* <-- Tambahkan sm:col-span-2 untuk lebar penuh di layar lebar */}
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Judul Dokumen</dt>
                {/* Tambahkan utilitas truncation untuk judul yang panjang */}
                <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white truncate"> 
                    {verificationData.documentTitle}
                </dd>
              </div>

              {/* Detail Kiri: Penanda Tangan */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Penanda Tangan</dt>
                <dd className="mt-1 font-semibold">{verificationData.signerName}</dd>
              </div>

              {/* Detail Kanan: Ditandatangani Pada */}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaClock className="mr-2"/> Ditandatangani Pada</dt>
                <dd className="mt-1">{new Date(verificationData.signedAt).toLocaleString()}</dd>
              </div>

              {/* Email dan IP Address - Dibuat di baris baru untuk menghindari tumpang tindih */}
              <div className="space-y-4 pt-4 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Penanda Tangan</dt>
                  <dd className="mt-1">{verificationData.signerEmail}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address Pencatatan</dt>
                  <dd className="mt-1 text-sm font-mono">{verificationData.ipAddress}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* DETAIL KRIPTOGRAFI (CARD 2 - OTOMATIS) */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center">
              <FaKey className="mr-3 text-red-500" /> Bukti Integritas Dokumen Tersimpan (Audit Internal)
            </h2>
            
            <div className={`p-3 rounded-lg font-bold text_-center mb-4 ${isValid ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"}`}>
                Otentikasi Tanda Tangan: {isValid ? "HASH MATCH (Dokumen Utuh)" : "HASH MISMATCH (Dokumen Berubah)"}
            </div>

            <dl className="space-y-4 text-sm text-gray-700 dark:text-gray-300 break-words">
              <div>
                <dt className="font-semibold text-gray-600 dark:text-gray-400">Hash File yang Dihitung Ulang (Saat Ini)</dt>
                <dd className={`font-mono text-xs p-2 rounded mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200`}>
                  {verificationData.recalculatedFileHash}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-600 dark:text-gray-400">Hash Tersimpan (Referensi Sistem)</dt>
                <dd className={`font-mono text-xs p-2 rounded mt-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200`}>
                  {verificationData.storedFileHash}
                </dd>
              </div>
              
              {!isValid && (
                <p className="text-red-500 font-bold text-sm pt-2">⚠️ PENTING: Hash BERBEDA! Dokumen yang tersimpan di *storage* sistem telah dimodifikasi setelah ditandatangani.</p>
              )}
            </dl>
          </section>

          {/* FORMULIR UJI INTEGRITAS FILE YANG DIUNGGAH (MANUAL) */}
          <section className="bg-blue-50 dark:bg-gray-700 p-6 rounded-xl shadow-xl border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center">
              <FaUpload className="mr-3 text-blue-500" /> Uji File yang Beredar (Verifikasi Manual)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Unggah file PDF fisik yang Anda miliki, dan sistem akan membandingkan *hash* dokumen tersebut dengan data verifikasi resmi yang tersimpan.
            </p>
            
            <form onSubmit={handleManualVerification} className="space-y-4">
              {/* Input Signature ID (Jika tidak ada di URL) - Dibuat lebih rapi */}
              {!initialSignatureId && (
                  <input 
                      type="text"
                      placeholder="Masukkan ID Tanda Tangan Unik"
                      value={manualSignatureId}
                      onChange={(e) => setManualSignatureId(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition"
                  />
              )}

              {/* File Upload dan Tombol Verifikasi */}
              <div className="flex flex-col sm:flex-row items-stretch sm:space-x-3 space-y-3 sm:space-y-0">
                  <label className="flex-1 flex items-center justify-center p-4 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg cursor-pointer bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-900/70 transition duration-150 text-gray-700 dark:text-gray-300">
                      <FaUpload className="inline mr-3 text-blue-500" />
                      <span className="truncate">
                          {manualFile ? manualFile.name : "Pilih file PDF yang akan diuji (Maks. 5MB)"}
                      </span>
                      <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                  </label>

                  <button
                      type="submit"
                      disabled={!manualFile || isVerifyingFile}
                      className={`px-6 py-3 text-white font-bold rounded-lg shadow-md transition duration-150 flex items-center justify-center sm:w-auto ${
                          !manualFile || isVerifyingFile ? 'bg-blue-400 dark:bg-blue-700/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                      }`}
                  >
                      {isVerifyingFile ? (
                          <>
                              <FaSpinner className="animate-spin inline mr-2" />
                              Memverifikasi...
                          </>
                      ) : (
                          "Uji File Sekarang"
                      )}
                  </button>
              </div>
            </form>

            {/* TAMPILKAN HASIL UJI MANUAL */}
            {showManualResult && (
                <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-800">
                    <div className={`p-4 text-white rounded-lg shadow-md ${manualStatusColor}`}>
                        <h3 className="text-xl font-bold flex items-center">
                            {isManualValid ? <FaCheckCircle className="mr-3" /> : <FaTimesCircle className="mr-3" />}
                            Hasil Uji File: {manualResult.verificationStatus}
                        </h3>
                    </div>

                    <dl className="mt-4 space-y-4 text-sm text-gray-700 dark:text-gray-300 break-words">
                        <div>
                            <dt className="font-semibold text-gray-600 dark:text-gray-400">Hash File yang Diunggah</dt>
                            <dd className={`font-mono text-xs p-2 rounded mt-1 ${manualResult.isHashMatch ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"}`}>
                                {manualResult.recalculatedFileHash}
                            </dd>
                            {!manualResult.isHashMatch && <p className="text-red-500 font-bold text-xs mt-1">❌ INTEGRITAS GAGAL! File yang Anda unggah tidak cocok dengan versi resmi.</p>}
                        </div>
                        
                        <div>
                            <dt className="font-semibold text-gray-600 dark:text-gray-400">Hash Tersimpan (Referensi)</dt>
                            <dd className="font-mono text-xs p-2 rounded mt-1 bg-gray-100 dark:bg-gray-700">{manualResult.storedFileHash}</dd>
                        </div>
                        
                        <div>
                            <dt className="font-semibold text-gray-600 dark:text-gray-400">Otentikasi Kunci Publik (Tanda Tangan)</dt>
                            <dd className={`font-bold mt-1 ${manualResult.isSignatureValid ? "text-green-600" : "text-red-600"}`}>
                                {manualResult.isSignatureValid ? "TERSEMAT DAN AUDIT OK" : "ERROR/TIDAK VALID"}
                            </dd>
                            <p className="text-xs text-gray-500 mt-1">
                                Berhasil mendeteksi data kunci penanda tangan pada dokumen ini (validitas kunci publik).
                            </p>
                        </div>
                    </dl>
                </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default VerificationPage;