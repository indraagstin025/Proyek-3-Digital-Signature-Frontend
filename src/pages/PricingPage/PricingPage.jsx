/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiArrowRight, FiZap, FiStar, FiShield, FiCpu } from "react-icons/fi";
import { FaSpinner, FaCheckCircle, FaPlusCircle } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import paymentService from "../../services/paymentService";
import apiClient from "../../services/apiClient";
import LoginRedirectModal from "../../components/LoginModals/LoginRedirectModal";

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const MIDTRANS_SCRIPT_URL = import.meta.env.VITE_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"; 

const PricingCard = ({ title, price, features, isPremium, onAction, buttonText, isDisabled, index, isYearly, isLoading }) => {
  const displayPrice = isYearly && price !== "Rp 0" ? `Rp ${(parseInt(price.replace(/\D/g, "")) * 10).toLocaleString("id-ID")}` : price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isDisabled ? { y: -5 } : {}}
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
        disabled={isLoading || isDisabled}
        className={`relative w-full py-3.5 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group 
        ${isDisabled 
            ? "cursor-not-allowed opacity-80 bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 shadow-none" 
            : isPremium 
                ? "bg-white text-blue-600 hover:bg-slate-50 shadow-xl hover:shadow-2xl cursor-pointer" 
                : "bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 shadow-lg cursor-pointer"
        }`}
      >
        <span className="relative z-10 flex items-center gap-2 font-bold">
          {isLoading ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              {buttonText}
              {!isDisabled && isPremium && title.includes("PRO") ? (
                  <FaPlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              ) : (
                  !isDisabled && <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </>
          )}
        </span>
      </button>
    </motion.div>
  );
};

const PricingPage = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [pendingPlanSelection, setPendingPlanSelection] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. SYNC USER DATA (Fetch API & Update LocalStorage)
  useEffect(() => {
    const fetchLatestProfile = async () => {
        try {
            const authData = localStorage.getItem("authUser");
            if (!authData) return;

            // Fetch user terbaru (agar userStatus selalu fresh)
            const response = await apiClient.get("/users/me");
            const freshUser = response.data.data;

            setCurrentUser(freshUser);

            // Update LocalStorage
            const oldAuth = JSON.parse(authData);
            let newAuthData;
            
            // Pertahankan token jika ada
            if (oldAuth.token) {
                newAuthData = { ...oldAuth, user: freshUser };
            } else {
                newAuthData = { ...oldAuth, user: freshUser, ...freshUser }; 
            }
            
            localStorage.setItem("authUser", JSON.stringify(newAuthData));
        } catch (error) {
            // Fallback ke LocalStorage jika API gagal
            const authData = localStorage.getItem("authUser");
            if (authData) {
                const parsed = JSON.parse(authData);
                setCurrentUser(parsed.user || parsed);
            }
        }
    };

    fetchLatestProfile();
  }, []);

  // 2. Load Script Midtrans
  useEffect(() => {
    if (!MIDTRANS_CLIENT_KEY) return;
    const existingScript = document.querySelector(`script[src="${MIDTRANS_SCRIPT_URL}"]`);
    if (existingScript) { setIsSnapLoaded(true); return; }

    const script = document.createElement("script");
    script.src = MIDTRANS_SCRIPT_URL;
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.async = true;
    script.onload = () => setIsSnapLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const isUserPremium = currentUser?.userStatus === "PREMIUM" || currentUser?.userStatus === "PREMIUM_YEARLY";

  // 3. Eksekusi Pembayaran
  const executePayment = async (planType) => {
    if (!isSnapLoaded || !window.snap) {
      toast.error("Sistem pembayaran belum siap.");
      return;
    }

    setProcessingPlan(planType);
    const loadingToast = toast.loading("Menyiapkan jendela pembayaran...");
    let currentOrderId = null;

    try {
      const data = await paymentService.createSubscription(planType);
      currentOrderId = data.orderId;

      window.snap.pay(data.snapToken, {
        onSuccess: (result) => {
          toast.dismiss(loadingToast);
          toast.success("Pembayaran Berhasil! Mengalihkan...", { duration: 2000 });

          // Optimistic Update
          try {
            const oldAuthData = JSON.parse(localStorage.getItem("authUser") || "{}");
            const userData = oldAuthData.user || oldAuthData;
            
            const newUserData = {
                 ...userData,
                 userStatus: "PREMIUM",
                 premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            const newAuthData = oldAuthData.token ? { ...oldAuthData, user: newUserData } : newUserData;
            localStorage.setItem("authUser", JSON.stringify(newAuthData));
            window.dispatchEvent(new Event("storage"));
          } catch (e) { console.error(e); }

          setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
        },
        onPending: () => {
          toast.dismiss(loadingToast);
          toast("Menunggu pembayaran...", { icon: "⏳" });
          setTimeout(() => window.location.href = "/dashboard", 1000);
        },
        onError: () => {
          toast.dismiss(loadingToast);
          toast.error("Pembayaran Gagal.");
          setProcessingPlan(null);
        },
        onClose: () => {
          toast.dismiss(loadingToast);
          toast.error("Pembayaran dibatalkan.");
          setProcessingPlan(null);
          if (currentOrderId) paymentService.cancelTransaction(currentOrderId).catch(() => {});
        },
      });
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Gagal menghubungi server pembayaran.");
      setProcessingPlan(null);
    }
  };

  const handlePremiumUpgrade = (planType) => {
    const authData = localStorage.getItem("authUser");
    if (!authData) {
      setPendingPlanSelection(planType);
      setShowLoginAlert(true);
      return;
    }
    if (processingPlan) return;
    executePayment(planType);
  };

  const handleConfirmLoginRedirect = () => {
    if (pendingPlanSelection) sessionStorage.setItem("pendingPlan", pendingPlanSelection);
    navigate("/login?redirect=/pricing");
  };

  useEffect(() => {
    const pendingPlan = sessionStorage.getItem("pendingPlan");
    const authData = localStorage.getItem("authUser");
    if (pendingPlan && authData && isSnapLoaded) {
      sessionStorage.removeItem("pendingPlan"); 
      executePayment(pendingPlan);
    }
  }, [isSnapLoaded]);

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
      isDisabled: isUserPremium, 
      buttonText: isUserPremium ? "Termasuk di Premium" : "Paket Saat Ini",
      onAction: () => navigate("/dashboard"),
      planId: "FREE"
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
      isDisabled: isUserPremium && !isYearly, 
      buttonText: isUserPremium 
        ? (isYearly ? "Upgrade ke Tahunan" : "Paket Saat Ini") 
        : "Upgrade Sekarang",
      onAction: () => handlePremiumUpgrade(isYearly ? "PREMIUM_YEARLY" : "PREMIUM_MONTHLY"),
      planId: isYearly ? "PREMIUM_YEARLY" : "PREMIUM_MONTHLY"
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900/50 overflow-hidden">
      <div className="aurora-bg opacity-30 dark:opacity-50 pointer-events-none fixed inset-0" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
        <header className="w-full text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-md border border-blue-200/50 dark:border-blue-800/50 mb-6"
          >
            <FiZap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Buka Potensi Penuh</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-3 leading-[1.1]">
             Pilih Paket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">Sesuai Kebutuhan</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <span className={`text-sm font-bold transition-colors duration-300 ${!isYearly ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`}>Bulanan</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-slate-300 dark:bg-slate-700 rounded-full p-1 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <motion.div animate={{ x: isYearly ? 28 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white dark:bg-blue-50 rounded-full shadow-md" />
            </button>
            <span className={`text-sm font-bold transition-colors duration-300 ${isYearly ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`}>Tahunan</span>
          </motion.div>
        </header>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
          {tiers.map((tier, index) => (
            <PricingCard 
              key={index} 
              {...tier} 
              index={index} 
              isYearly={isYearly} 
              isLoading={processingPlan === tier.planId}
            />
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

      <LoginRedirectModal
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        onConfirm={handleConfirmLoginRedirect}
      />
    </div>
  );
};

export default PricingPage;