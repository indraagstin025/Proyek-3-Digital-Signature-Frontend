import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const handleVerification = () => {
      // 1. Ambil Hash dari URL (karena Supabase Anda mengirim #access_token)
      const hash = location.hash;
      const query = new URLSearchParams(location.search);

      // 2. Parsing Hash menjadi Object
      const hashParams = new URLSearchParams(hash.replace("#", "?"));
      
      const accessToken = hashParams.get("access_token");
      const error = hashParams.get("error_description") || query.get("error_description");
      const type = hashParams.get("type"); // Biasanya "signup" atau "recovery"

      // DEBUG: Cek apa yang kita dapat
      console.log("Hash:", hash);
      console.log("Access Token:", accessToken ? "Ada (Terverifikasi)" : "Tidak Ada");

      // KASUS A: Jika ada error dari Supabase langsung di URL
      if (error) {
        setStatus("error");
        toast.error(decodeURIComponent(error).replace(/\+/g, " "));
        return;
      }

      // KASUS B: Ada Access Token (Implicit Flow) -> BERARTI SUKSES!
      if (accessToken) {
        // Logika: Karena token sudah ada, berarti email sudah valid di mata Supabase.
        // Kita tidak perlu kirim ke backend 'exchangeCode' karena ini bukan 'code'.
        // Kita cukup arahkan user login ulang agar session tertanam bersih di backend.
        
        setStatus("success");
        toast.success("Email berhasil diverifikasi! Silakan Login.");
        
        setTimeout(() => {
          navigate("/login?message=Email verified successfully");
        }, 2000);
        return;
      }

      // KASUS C: Fallback untuk PKCE Flow (jika suatu saat setting berubah jadi ?code=)
      const code = query.get("code");
      if (code) {
        // Jika dapetnya code, baru kita harus kontak backend (Logic lama)
        // Tapi untuk kasus URL Anda sekarang, blok ini TIDAK AKAN dieksekusi.
        setStatus("error"); 
        toast.error("Format Code terdeteksi (Hubungi developer untuk penyesuaian Backend).");
        return;
      }

      // KASUS D: URL Kosong / Tidak Dikenal
      setStatus("error");
      toast.error("Tautan tidak valid atau sudah kadaluarsa.");
    };

    handleVerification();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-sm w-full text-center border border-slate-200 dark:border-white/10">
        
        {status === "verifying" && (
          <>
            <ImSpinner9 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Memeriksa Tautan...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-12 w-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi Berhasil!</h2>
            <p className="text-slate-600 dark:text-gray-400 mt-2">Email Anda telah aktif.</p>
            <p className="text-sm text-slate-500 mt-4">Mengalihkan ke halaman login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-12 w-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tautan Tidak Valid</h2>
            <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm">
              Gagal membaca informasi verifikasi dari URL.
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;