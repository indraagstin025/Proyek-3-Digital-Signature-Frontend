import { useQuota } from "../context/QuotaContext";
import toast from "react-hot-toast";

/**
 * useFileUpload Hook
 * Hooks untuk validasi file size sebelum upload berdasarkan quota user
 *
 * Returns:
 * - validateFileSize(file): Validasi single file, return { valid, error }
 * - handleFileSelect(file, onValid): Handle file selection dengan validation
 * - maxFileSize: Max file size dalam bytes
 * - maxFileSizeLabel: Max file size dalam label (e.g., "10 MB")
 * - isQuotaLoading: Status loading quota
 *
 * Usage:
 * const { validateFileSize, handleFileSelect, maxFileSize } = useFileUpload();
 *
 * // Manual validation
 * const validation = validateFileSize(file);
 * if (!validation.valid) {
 *   toast.error(validation.error);
 *   return;
 * }
 *
 * // Or use handler
 * handleFileSelect(file, (validFile) => {
 *   // Process valid file
 *   uploadFile(validFile);
 * });
 */
export const useFileUpload = () => {
  const { quota, loading: isQuotaLoading, refreshQuota } = useQuota();

  const validateFileSize = (file, quotaData = quota) => {
    // Jika quota masih loading, beri pesan yang lebih informatif
    if (isQuotaLoading && !quotaData) {
      return { valid: false, error: "Sedang memuat data. Mohon tunggu sebentar...", isLoading: true };
    }

    if (!quotaData) {
      return { valid: false, error: "Quota belum dimuat. Silakan coba lagi.", isLoading: false, needsRefresh: true };
    }

    if (!file) {
      return { valid: false, error: "File tidak ditemukan." };
    }

    const maxSize = quotaData.limits.maxFileSize;
    const maxSizeLabel = quotaData.limits.maxFileSizeLabel;

    // Konversi file size ke MB untuk display
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSize) {
      let errorMessage = `File terlalu besar (${fileSizeMB} MB). Maksimal ${maxSizeLabel}.`;

      // Tambahkan suggestion jika user tidak premium
      if (!quotaData.isPremiumActive) {
        errorMessage += " Upgrade ke Premium untuk upload hingga 50 MB.";
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (file, onValid) => {
    let currentQuota = quota;

    // Jika quota belum dimuat, fetch langsung dan tunggu hasilnya
    if (!currentQuota) {
      console.log("[useFileUpload] Quota belum ada, fetching...");
      toast.loading("Memuat data...", { id: "quota-loading" });

      try {
        currentQuota = await refreshQuota();
        toast.dismiss("quota-loading");

        if (!currentQuota) {
          toast.error("Gagal memuat quota. Silakan refresh halaman.", {
            duration: 5000,
            icon: "⚠️",
          });
          return false;
        }
        console.log("[useFileUpload] Quota berhasil dimuat:", currentQuota);
      } catch (err) {
        toast.dismiss("quota-loading");
        toast.error("Terjadi kesalahan saat memuat data.", {
          duration: 5000,
          icon: "⚠️",
        });
        return false;
      }
    }

    // Validasi dengan quota yang tersedia
    const validation = validateFileSize(file, currentQuota);

    if (!validation.valid) {
      toast.error(validation.error, {
        duration: 5000,
        icon: validation.isLoading ? "⏳" : "📁",
      });
      return false;
    }

    if (onValid && typeof onValid === "function") {
      onValid(file);
    }

    return true;
  };

  return {
    validateFileSize,
    handleFileSelect,
    maxFileSize: quota?.limits?.maxFileSize || 10485760, // Default 10 MB
    maxFileSizeLabel: quota?.limits?.maxFileSizeLabel || "10 MB",
    isPremium: quota?.isPremiumActive || false,
    isQuotaLoading,
    isQuotaReady: !!quota && !isQuotaLoading,
  };
};

export default useFileUpload;

