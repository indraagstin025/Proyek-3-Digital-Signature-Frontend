import { createContext, useContext, useState, useEffect } from "react";
import { getQuota } from "../services/userService";

const QuotaContext = createContext(null);

export const QuotaProvider = ({ children }) => {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuota();
      setQuota(data);
      console.log("[QuotaContext] ✅ Quota loaded:", data);
    } catch (err) {
      console.error("[QuotaContext] ❌ Failed to fetch quota:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quota saat component mount
  useEffect(() => {
    fetchQuota();
  }, []);

  // Refetch quota setelah aksi yang mengubah usage
  const refreshQuota = async () => {
    await fetchQuota();
  };

  const value = {
    quota,
    loading,
    error,
    refreshQuota,
    isPremium: quota?.isPremiumActive || false,
    userStatus: quota?.userStatus || "FREE",
    limits: quota?.limits || null,
    usage: quota?.usage || null,
    premiumUntil: quota?.premiumUntil || null,
  };

  return <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>;
};

export const useQuota = () => {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error("useQuota harus digunakan dalam QuotaProvider");
  }
  return context;
};
