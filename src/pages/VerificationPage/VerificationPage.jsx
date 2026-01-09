/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaTimesCircle, FaSpinner, FaUpload, 
  FaFileContract, FaKey, FaDownload, 
  FaLock, FaUsers, FaUserCheck, FaUnlock, FaHourglassHalf, FaShieldAlt,
  FaInfoCircle // [BARU] Import icon info
} from "react-icons/fa"; 
import { toast, Toaster } from "react-hot-toast";
import { signatureService } from "../../services/signatureService";

const VerificationPage = () => {
  const { signatureId: initialSignatureId } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [verificationData, setVerificationData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Layer 2: Upload
  const [manualFile, setManualFile] = useState(null);
  const [isVerifyingFile, setIsVerifyingFile] = useState(false);
  const [manualVerificationResult, setManualVerificationResult] = useState(null);

  // Layer 1: PIN & Lockout
  const [accessCode, setAccessCode] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // [BARU] State untuk pesan feedback UX saat upload minta PIN
  const [pinPromptMessage, setPinPromptMessage] = useState(null);

  // --- 1. LOAD DATA ---
// --- 1. LOAD DATA ---
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
        const data = response.data; // Ambil data
        
        setVerificationData(data);
        
        // [LOGIC BARU] Cek apakah Backend mengirim data lockout?
        if (data.lockedUntil) {
            const lockTime = new Date(data.lockedUntil).getTime();
            // Jika waktu blokir masih di masa depan
            if (lockTime > Date.now()) {
                setLockoutUntil(lockTime); // <--- INI AKAN MEMICU TIMER OTOMATIS
                toast.error("Akses Anda sedang dibekukan sementara.");
            }
        }

        // Toast Notification lainnya
        if (data.isLocked && !data.lockedUntil) { 
           // Normal locked message
        } else if(data.requireUpload) {
           toast("Verifikasi fisik diperlukan.", { icon: "🛡️" });
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message || "Gagal mengambil data verifikasi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [initialSignatureId]);

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = lockoutUntil - now;
      if (diff <= 0) {
        setLockoutUntil(null);
        setTimeLeft(0);
        toast.success("Waktu tunggu habis. Silakan coba lagi.");
        clearInterval(interval);
      } else {
        setTimeLeft(Math.ceil(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- 3. HANDLER PIN (DIPERKETAT) ---
  const handlePinChange = (e) => {
    // Validasi Ketat: Hanya Alphanumeric & Uppercase
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 8) { // Batasi max 8 karakter
        setAccessCode(val);
    }
  };

  const handleUnlockWithPin = async (e) => {
    e.preventDefault();
    if (!accessCode || accessCode.length < 3) return;

    setIsUnlocking(true);
    try {
      let response;

      // [LOGIC] Cek: Apakah user punya file yang tertahan (pending upload)?
      if (manualFile) {
        console.log("🔓 Unlocking via Upload Flow...");
        response = await signatureService.verifyUploadedFile(initialSignatureId, manualFile, accessCode);
        
        if (response.data.isLocked) {
           throw new Error("Kode Akses Salah.");
        }
        
        setManualVerificationResult(response.data);
        setPinPromptMessage(null); // Clear prompt message jika sukses

      } else {
        console.log("🔓 Unlocking via Standard Flow...");
        response = await signatureService.unlockVerification(initialSignatureId, accessCode);
      }

      // SUKSES
      setVerificationData((prev) => ({
        ...prev,
        ...response.data, 
        isLocked: false,  
        requireUpload: false 
      }));
      
      setAccessCode("");
      setLockoutUntil(null);
      toast.success("Akses Diberikan!");

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Kode Akses Salah.";
      toast.error(msg);

      // Logic Lockout
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("menit") || lowerMsg.includes("terkunci") || lowerMsg.includes("locked")) {
          const match = lowerMsg.match(/(\d+)\s*menit/i);
          const minutes = match ? parseInt(match[1], 10) : 30; 
          setLockoutUntil(Date.now() + minutes * 60 * 1000);
          setAccessCode(""); 
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  // --- 4. HANDLER UPLOAD ---
  const handleFileChange = (e) => {
    setManualFile(e.target.files[0]);
    setManualVerificationResult(null); 
  };

  const handleManualVerification = useCallback(async (e) => {
    e.preventDefault();
    if (!manualFile) return;

    setIsVerifyingFile(true);
    setManualVerificationResult(null);
    setPinPromptMessage(null); // Reset pesan awal

    try {
      // 1. Panggil Backend (Tanpa PIN dulu)
      const response = await signatureService.verifyUploadedFile(initialSignatureId, manualFile);
      const data = response.data;

      // 2. [LOGIC BARU] Cek apakah Backend membalas "Locked"?
      if (data.isLocked) {
        
        // [UX IMPROVEMENT] Custom Toast
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-yellow-500`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                     <FaLock className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Autentikasi Diperlukan
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                      File diterima. Silakan masukkan PIN untuk memverifikasi isinya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        ), { duration: 5000 });
        
        // [UX IMPROVEMENT] Set Pesan di UI
        setPinPromptMessage("Verifikasi file ini membutuhkan konfirmasi PIN.");

        // Update state agar UI menampilkan Form PIN
        setVerificationData((prev) => ({
          ...prev,
          isLocked: true,      
          requireUpload: false 
        }));
        return; 
      }

      // 3. Jika Tidak Terkunci (Valid/Invalid biasa)
      setManualVerificationResult(data);

      if (data.isValid || data.verificationStatus === "VALID") {
        toast.success("Dokumen Valid!");
        setVerificationData((prev) => ({
          ...prev,
          ...data,
          isLocked: false,
          requireUpload: false
        }));
      } else {
        toast.error("INVALID! Hash tidak cocok.");
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Verifikasi file gagal.");
    } finally {
      setIsVerifyingFile(false);
    }
  }, [initialSignatureId, manualFile]);

  const handleViewOriginal = (e) => {
    e.preventDefault(); 
    const userString = localStorage.getItem("authUser");
    if (userString) {
        navigate("/dashboard/documents");
    } else {
        toast("Silakan login untuk akses penuh.");
        navigate("/login");
    }
  };

  // --- 5. RENDER STATES ---
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4"/>
        <p className="text-slate-500 animate-pulse">Memverifikasi Kriptografi...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-red-500 font-bold">
        <div className="text-center">
            <FaTimesCircle className="text-5xl mx-auto mb-2"/>
            <p>{error}</p>
        </div>
    </div>
  );
  
  if (!verificationData) return null;

  // Logic UI
  const isLockedByPin = verificationData.isLocked;
  const isLockedByUpload = !isLockedByPin && verificationData.requireUpload;
  const isFullyUnlocked = !isLockedByPin && !isLockedByUpload;
  const isGroup = verificationData.type === "GROUP"; 

  // Dynamic Styles
  let statusGradient = "from-emerald-500 to-teal-600";
  let statusIcon = FaCheckCircle;
  let statusText = "TERVERIFIKASI";
  let statusSub = "Dokumen ini asli dan integritasnya terjamin.";
  
  if (isLockedByPin) {
      statusGradient = "from-slate-700 to-slate-900";
      statusIcon = FaLock;
      statusText = "DOKUMEN TERKUNCI";
      statusSub = "Dokumen dilindungi.";
  } else if (isLockedByUpload) {
      statusGradient = "from-blue-600 to-indigo-700";
      statusIcon = FaShieldAlt;
      statusText = "BUTUH VALIDASI FISIK";
      statusSub = "Unggah dokumen asli untuk membuka identitas penanda tangan.";
  } else if (manualVerificationResult && (!manualVerificationResult.isValid && manualVerificationResult.verificationStatus !== "VALID")) {
      statusGradient = "from-red-600 to-red-700";
      statusIcon = FaTimesCircle;
      statusText = "INVALID / DIMODIFIKASI";
      statusSub = "Isi dokumen berbeda dengan catatan server kami.";
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 font-sans transition-colors duration-300">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
        
        {/* === HEADER GRADIENT === */}
        <div className={`relative bg-gradient-to-br ${statusGradient} text-white p-10 text-center`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-inner mb-4">
                    {React.createElement(statusIcon, { className: "text-4xl" })}
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">{statusText}</h1>
                <p className="text-white/80 max-w-lg mx-auto text-sm">{statusSub}</p>
                
                {/* Doc Title Badge */}
                <div className="mt-6 inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-xs font-mono border border-white/10">
                    <FaFileContract />
                    <span className="truncate max-w-[200px]">{verificationData.documentTitle || "Dokumen Tanpa Judul"}</span>
                </div>
            </div>
        </div>

        <div className="p-8 sm:p-10 space-y-10">
          
          {/* ========================================= */}
          {/* SECTION 1: PIN ENTRY (MODERN LOOK)        */}
          {/* ========================================= */}
          {isLockedByPin && (
            <div className="max-w-sm mx-auto">
               
               {/* [BARU] MESSAGE ALERT KHUSUS UPLOAD */}
               {pinPromptMessage && (
                 <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <FaInfoCircle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium leading-tight">
                      {pinPromptMessage}
                    </p>
                 </div>
               )}

               {lockoutUntil ? (
                 // --- LOCKOUT STATE ---
                 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl text-center animate-pulse">
                    <FaHourglassHalf className="text-5xl text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Akses Dibekukan</h3>
                    <div className="text-4xl font-mono font-bold text-red-600 dark:text-red-300 my-4">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm text-red-500">Terlalu banyak percobaan gagal.<br/>Harap tunggu hingga timer habis.</p>
                 </div>
               ) : (
                 // --- INPUT STATE ---
                 <div className="text-center">
                    <div className={pinPromptMessage ? "mb-4" : "mb-6"}>
                        <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Masukkan Kode Akses (PIN)</label>
                        {!pinPromptMessage && (
                           <p className="text-xs text-slate-400">Kode tercetak di bawah QR Code pada dokumen fisik.</p>
                        )}
                    </div>
                    
                    <form onSubmit={handleUnlockWithPin} className="relative">
                      <div className="relative group">
                          {/* Modern Input Styling */}
                          <input 
                            type="text" 
                            placeholder="A1B2C3"
                            value={accessCode}
                            onChange={handlePinChange}
                            className="w-full text-center text-4xl font-mono font-bold tracking-[0.2em] py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none uppercase transition-all text-slate-800 dark:text-white placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal"
                            maxLength={8}
                            autoComplete="off"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <FaKey />
                          </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isUnlocking || accessCode.length < 3}
                        className="mt-6 w-full bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isUnlocking ? <FaSpinner className="animate-spin text-xl" /> : <FaUnlock className="text-xl" />}
                        <span className="tracking-wide">BUKA DOKUMEN</span>
                      </button>
                    </form>
                 </div>
               )}
            </div>
          )}

          {/* ========================================= */}
          {/* SECTION 2: DOCUMENT DETAILS (GRID)        */}
          {/* ========================================= */}
          {!isLockedByPin && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 relative ${isLockedByUpload ? 'blur-[2px] select-none opacity-60' : ''}`}>
               {/* Detail Kiri */}
               <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10">
                   <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                       <FaUserCheck /> Informasi Penanda Tangan
                   </h3>
                   <div className="space-y-3">
                       <div>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Nama Lengkap</p>
                           <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                               {isLockedByUpload ? "••••••••••" : verificationData.signerName}
                           </p>
                       </div>
                       <div>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Email Terdaftar</p>
                           <p className="font-medium text-slate-700 dark:text-slate-300 font-mono text-sm">
                               {isLockedByUpload ? "••••@••••.•••" : verificationData.signerEmail}
                           </p>
                       </div>
                   </div>
               </div>

               {/* Detail Kanan */}
               <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10">
                   <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                       <FaFileContract /> Metadata Forensik
                   </h3>
                   <div className="space-y-3">
                       <div>
                           <p className="text-sm text-slate-500 dark:text-slate-400">Waktu Penandatanganan</p>
                           <p className="font-medium text-slate-700 dark:text-slate-300">
                               {isLockedByUpload ? (
                                   <span className="tracking-widest text-slate-400 select-none">••••/••/•• ••:••</span>
                               ) : (
                                   verificationData.signedAt 
                                     ? new Date(verificationData.signedAt).toLocaleString("id-ID", { dateStyle: 'full', timeStyle: 'medium' }) 
                                     : "-"
                               )}
                           </p>
                       </div>
                       <div>
                           <p className="text-sm text-slate-500 dark:text-slate-400">IP Address</p>
                           {isLockedByUpload ? (
                               <span className="inline-block bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-400 select-none">
                                   •••.•••.•••.•••
                               </span>
                           ) : (
                               <span className="inline-block bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                   {verificationData.ipAddress || verificationData.signerIpAddress || "127.0.0.1"}
                               </span>
                           )}
                       </div>
                   </div>
               </div>
               
               {/* Group Info (Full Width) */}
               {isGroup && (
                   <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                       <h3 className="text-xs font-bold text-blue-500 uppercase mb-2 flex items-center gap-2">
                           <FaUsers /> Kolaborasi Grup
                       </h3>
                       <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                           {isLockedByUpload ? "Detail grup disembunyikan..." : verificationData.groupSigners}
                       </p>
                   </div>
               )}
            </div>
          )}

          {/* ========================================= */}
          {/* SECTION 3: UPLOAD VALIDATION              */}
          {/* ========================================= */}
          {!isLockedByPin && (
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 ${isLockedByUpload ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-dashed border-slate-300 dark:border-slate-700'} p-6 transition-all`}>
                
                {/* Header Upload */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-full ${isLockedByUpload ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <FaShieldAlt className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white">
                            {isLockedByUpload ? "Verifikasi File Wajib" : "Cek Integritas File (Opsional)"}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {isLockedByUpload 
                                ? "Untuk alasan keamanan, unggah file PDF asli untuk membuka informasi sensitif." 
                                : "Pastikan file yang Anda pegang tidak dimodifikasi walau satu bit pun."}
                        </p>
                    </div>
                </div>

                {/* Form Upload */}
                <form onSubmit={handleManualVerification} className="flex flex-col sm:flex-row gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center h-16 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition group">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate w-full text-center group-hover:text-blue-600">
                            {manualFile ? `📄 ${manualFile.name}` : "Klik untuk pilih file .PDF"}
                        </span>
                        <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button 
                        type="submit" 
                        disabled={!manualFile || isVerifyingFile} 
                        className="h-16 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/20"
                    >
                        {isVerifyingFile ? <FaSpinner className="animate-spin" /> : "Validasi File"}
                    </button>
                </form>

                {/* Hasil Validasi Manual */}
                {manualVerificationResult && !isVerifyingFile && (
                   <div className={`mt-6 p-4 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-2 ${
                       (manualVerificationResult.isValid || manualVerificationResult.verificationStatus === "VALID")
                       ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200"
                       : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                   }`}>
                       <div className="mt-1 text-xl">
                           {(manualVerificationResult.isValid || manualVerificationResult.verificationStatus === "VALID") ? <FaCheckCircle /> : <FaTimesCircle />}
                       </div>
                       <div>
                           <h4 className="font-bold">
                               {(manualVerificationResult.isValid || manualVerificationResult.verificationStatus === "VALID") ? "Otentik & Valid" : "File Tidak Cocok / Rusak"}
                           </h4>
                           <p className="text-sm opacity-90 mt-1">
                               {(manualVerificationResult.isValid || manualVerificationResult.verificationStatus === "VALID") 
                                ? "Hash file cocok sempurna dengan database server." 
                                : "Hash file berbeda. Dokumen mungkin telah dimodifikasi setelah ditandatangani."}
                           </p>
                       </div>
                   </div>
                )}
            </div>
          )}

          {/* ========================================= */}
          {/* SECTION 4: HASH & FOOTER                  */}
          {/* ========================================= */}
          {isFullyUnlocked && (
             <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold">SHA-256 Digital Fingerprint</p>
                <code className="block bg-slate-100 dark:bg-black/30 p-3 rounded-lg text-[10px] sm:text-xs font-mono text-slate-600 dark:text-slate-400 break-all select-all hover:bg-slate-200 transition-colors cursor-text">
                    {verificationData.storedFileHash || manualVerificationResult?.storedFileHash}
                </code>
                
                <button onClick={handleViewOriginal} className="mt-6 text-slate-500 hover:text-blue-600 text-xs font-medium flex items-center justify-center gap-2 mx-auto transition-colors">
                    <FaDownload />
                    Login ke Dashboard untuk Unduh Dokumen Asli
                </button>
             </div>
          )}

        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-8">
          <p className="text-slate-400 text-xs font-medium">Secured by <span className="text-slate-600 dark:text-slate-300 font-bold">WESIGN Verify Protocol</span></p>
      </div>
    </div>
  );
};

export default VerificationPage;