import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiArrowRight, FiZap, FiStar, FiShield, FiCpu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import paymentService from "../../services/paymentService";
import apiClient from "../../services/apiClient";

// --- MIDTRANS CONFIG (KHUSUS VITE) ---
// Menggunakan import.meta.env untuk Vite
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const MIDTRANS_SCRIPT_URL = import.meta.env.VITE_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"; 

// --- COMPONENT: PricingCard (Compact Version) ---
const PricingCard = ({ title, price, features, isPremium, onAction, buttonText = "Pilih Paket", index, isYearly }) => {
  const displayPrice = isYearly && price !== "Rp 0" ? `Rp ${(parseInt(price.replace(/\D/g, "")) * 10).toLocaleString("id-ID")}` : price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`relative flex flex-col p-8 md:p-10 rounded-[2rem] transition-all duration-500 overflow-hidden ${
        isPremium
          ? "bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 backdrop-blur-xl text-white shadow-[0_20px_50px_rgba(37,99,235,0.4)] ring-1 ring-white/30"
          : "bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl"
      }`}
    >
      {isPremium && (
        <>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FiZap className="w-32 h-32 rotate-12" />
          </div>
          <div className="absolute top-4 right-6 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-[11px] font-black uppercase tracking-wider rounded-lg shadow-lg z-10 whitespace-nowrap">Paling Laris</div>
        </>
      )}

      <div className={`mb-8 text-center pt-2 ${isPremium ? "pt-6" : ""}`}>
        <h3 className={`text-sm font-bold mb-2 uppercase tracking-widest ${isPremium ? "text-blue-100" : "text-slate-600 dark:text-slate-400"}`}>{title}</h3>
        <div className="flex items-baseline justify-center gap-2">
          <AnimatePresence mode="wait">
            <motion.span key={displayPrice} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-5xl md:text-6xl font-black tracking-tight leading-none">
              {displayPrice}
            </motion.span>
          </AnimatePresence>
          {price !== "Rp 0" && <span className={`text-sm font-semibold leading-none ${isPremium ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>/{isYearly ? "tahun" : "bulan"}</span>}
        </div>
        {isYearly && price !== "Rp 0" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-2 font-bold text-amber-300 uppercase tracking-tight">
            Hemat Rp 10.000
          </motion.p>
        )}
      </div>

      <div className="grow space-y-3 mb-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${isPremium ? "bg-white/25 text-white" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"}`}>
              <FiCheck className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className={`text-sm font-medium leading-relaxed ${isPremium ? "text-blue-50" : "text-slate-700 dark:text-slate-300"}`}>{feature.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onAction}
        className={`relative w-full py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group ${
          isPremium ? "bg-white text-blue-600 hover:bg-slate-50 shadow-xl hover:shadow-2xl" : "bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 shadow-lg"
        }`}
      >
        <span className="relative z-10 flex items-center gap-2 font-bold">
          {buttonText}
          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-current`} />
      </button>
    </motion.div>
  );
};

// --- MAIN PAGE ---
const PricingPage = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);

  // --- MEMUAT SCRIPT MIDTRANS (VITE COMPATIBLE) ---
  useEffect(() => {
    // Safety check: Pastikan KEY ada
    if (!MIDTRANS_CLIENT_KEY) {
        console.error("VITE_MIDTRANS_CLIENT_KEY tidak ditemukan di .env");
        toast.error("Konfigurasi pembayaran belum lengkap.");
        return;
    }

    const existingScript = document.querySelector(`script[src="${MIDTRANS_SCRIPT_URL}"]`);
    
    if (existingScript) {
      setIsSnapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = MIDTRANS_SCRIPT_URL;
    // Penting: Masukkan Client Key dari variable
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.async = true;
    
    script.onload = () => {
      console.log("[PricingPage] Midtrans Snap Script Loaded");
      setIsSnapLoaded(true);
    };
    
    script.onerror = () => {
        console.error("[PricingPage] Gagal memuat Midtrans Snap Script");
        toast.error("Gagal memuat sistem pembayaran. Cek koneksi internet.");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePremiumUpgrade = async (planType) => {
    if (!isSnapLoaded || !window.snap) {
        toast.error("Sistem pembayaran belum siap. Mohon tunggu sebentar.");
        return;
    }

    console.log(`[DEBUG] Memulai upgrade ke: ${planType}`);
    const loadingToast = toast.loading("Menyiapkan pembayaran...");
    let currentOrderId = null;

    try {
      // 1. Request Token ke Backend
      const data = await paymentService.createSubscription(planType);
      currentOrderId = data.orderId;

      console.log("[DEBUG] Snap Token diterima:", data.snapToken);

      // 2. Munculkan Popup Snap
      window.snap.pay(data.snapToken, {
        onSuccess: async (result) => {
          console.log("[PAYMENT] Success:", result);
          toast.loading("Verifikasi pembayaran...", { id: loadingToast });
          
          try {
            // Polling untuk update status user secara real-time di UI
            let attempts = 0;
            const maxAttempts = 10;
            let isPremium = false;
            let updatedUser = null;

            while (attempts < maxAttempts && !isPremium) {
              await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay sedikit lebih lama
              attempts++;
              const response = await apiClient.get(`/users/me?t=${Date.now()}`);
              updatedUser = response.data?.data;
              
              if (updatedUser && (updatedUser.userStatus === "PREMIUM" || updatedUser.userStatus === "PREMIUM_YEARLY")) {
                isPremium = true;
              }
            }

            if (isPremium && updatedUser) {
              const oldAuthData = JSON.parse(localStorage.getItem("authUser") || "{}");
              const newAuthData = { ...oldAuthData, user: { ...(oldAuthData.user || oldAuthData), ...updatedUser } };
              localStorage.setItem("authUser", JSON.stringify(newAuthData));
              window.dispatchEvent(new Event("storage"));

              toast.success("Upgrade Berhasil! Selamat datang di Premium.", { id: loadingToast });
              setTimeout(() => window.location.href = "/dashboard", 1000);
            } else {
              toast.success("Pembayaran diterima. Mohon tunggu update status.", { id: loadingToast });
              setTimeout(() => window.location.href = "/dashboard", 1500);
            }
          } catch (updateError) {
            console.error(updateError);
            toast.dismiss(loadingToast);
            window.location.href = "/dashboard";
          }
        },
        onPending: (result) => {
          console.log("[PAYMENT] Pending:", result);
          toast.success("Menunggu pembayaran...", { id: loadingToast });
          setTimeout(() => window.location.href = "/dashboard", 1000);
        },
        onError: (result) => {
          console.error("[PAYMENT] Error:", result);
          toast.error("Pembayaran Gagal/Ditolak.", { id: loadingToast });
        },
        onClose: async () => {
          console.log("[PAYMENT] Closed without finishing");
          if (currentOrderId) {
            try {
              await paymentService.cancelTransaction(currentOrderId);
            } catch (e) { /* ignore */ }
            toast.error("Pembayaran Dibatalkan.", { id: loadingToast });
          } else {
            toast.dismiss(loadingToast);
          }
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Gagal memulai transaksi. Coba lagi nanti.", { id: loadingToast });
    }
  };

  const tiers = [
    {
      title: "FREE TIER",
      price: "Rp 0",
      isPremium: false,
      features: [
        { text: "Maks. 3 Dokumen per Paket", included: true },
        { text: "Maks. 5 Anggota Grup", included: true },
        { text: "Riwayat 5 Versi", included: true },
        { text: "Tanda Tangan Digital Dasar", included: true },
        { text: "AI Legal Analysis (Terbatas)", included: true },
      ],
      onAction: () => navigate("/dashboard"),
      buttonText: "Tetap Free",
    },
    {
      title: "PRO TIER",
      price: "Rp 10.000",
      isPremium: true,
      features: [
        { text: "Maks. 20 Dokumen per Paket", included: true },
        { text: "Anggota Grup Tanpa Batas", included: true },
        { text: "Riwayat 20 Versi", included: true },
        { text: "Tanda Tangan Tersertifikasi", included: true },
        { text: "Multi-user Simultaneous Sign", included: true },
        { text: "Prioritas Support 24/7", included: true },
      ],
      onAction: () => handlePremiumUpgrade(isYearly ? "PREMIUM_YEARLY" : "PREMIUM_MONTHLY"),
      buttonText: "Upgrade Sekarang",
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900/50 overflow-hidden">
      <div className="aurora-bg opacity-30 dark:opacity-50 pointer-events-none fixed inset-0" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
        <header className="w-full text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-md border border-blue-200/50 dark:border-blue-800/50 mb-6"
          >
            <FiZap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Buka Potensi Penuh</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-3 leading-[1.1]">Pilih Paket</h1>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-4xl sm:text-5xl md:text-6xl font-black">Sesuai Kebutuhan</p>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Dapatkan akses ke semua fitur unggulan dengan harga terjangkau dan fleksibel sesuai kebutuhan bisnis Anda.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <span className={`text-sm font-bold transition-colors duration-300 ${!isYearly ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`}>Bulanan</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-slate-300 dark:bg-slate-700 rounded-full p-1 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Toggle billing period"
            >
              <motion.div animate={{ x: isYearly ? 28 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white dark:bg-blue-50 rounded-full shadow-md" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold transition-colors duration-300 ${isYearly ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`}>Tahunan</span>
              <motion.span
                key={isYearly ? "yearly" : "monthly"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 text-green-700 dark:text-green-300"
              >
                Hemat 20%
              </motion.span>
            </div>
          </motion.div>
        </header>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
          {tiers.map((tier, index) => (
            <PricingCard key={index} {...tier} index={index} isYearly={isYearly} />
          ))}
        </motion.div>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="w-full mb-16 md:mb-20">
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center mb-10">
            Mengapa Memilih <span className="text-blue-600">WESIGN</span>?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FiShield className="w-5 h-5" />,
                title: "Digital Trust",
                desc: "Tanda tangan digital yang diakui secara hukum dan internasional.",
              },
              {
                icon: <FiCpu className="w-5 h-5" />,
                title: "AI Assistant",
                desc: "Analisis kontrak dan dokumen secara instan dengan AI canggih.",
              },
              {
                icon: <FiStar className="w-5 h-5" />,
                title: "Support 24/7",
                desc: "Tim dukungan profesional siap membantu kapan saja Anda butuh.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-500/10"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="inline-flex items-center justify-center w-10 h-10 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-md"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-0 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.footer initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="w-full text-center pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500 font-bold mb-2">Trusted by thousands of users</p>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-600 font-bold">© 2025 WESIGN - TANDA TANGAN DIGITAL TERPERCAYA</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default PricingPage;