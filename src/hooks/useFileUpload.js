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
  const { quota } = useQuota();

  const validateFileSize = (file) => {
    if (!quota) {
      return { valid: false, error: "Quota belum dimuat. Silakan coba lagi." };
    }

    if (!file) {
      return { valid: false, error: "File tidak ditemukan." };
    }

    const maxSize = quota.limits.maxFileSize;
    const maxSizeLabel = quota.limits.maxFileSizeLabel;

    // Konversi file size ke MB untuk display
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSize) {
      let errorMessage = `File terlalu besar (${fileSizeMB} MB). Maksimal ${maxSizeLabel}.`;

      // Tambahkan suggestion jika user tidak premium
      if (!quota.isPremiumActive) {
        errorMessage += " Upgrade ke Premium untuk upload hingga 50 MB.";
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file, onValid) => {
    const validation = validateFileSize(file);

    if (!validation.valid) {
      toast.error(validation.error, {
        duration: 5000,
        icon: "📁",
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
  };
};

export default useFileUpload;
