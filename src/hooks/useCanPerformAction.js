import { useQuota } from "../context/QuotaContext";

/**
 * useCanPerformAction Hook
 * Check apakah user bisa perform action tertentu berdasarkan quota limit
 * Implementasi soft lock - blocking CREATE actions tapi tetap allow READ
 *
 * Returns:
 * - canPerform: boolean - Apakah user bisa perform action
 * - reason: string - Alasan jika tidak bisa perform
 * - isAtLimit: boolean - Apakah sudah mencapai limit
 * - currentUsage: number - Usage saat ini
 * - limit: number - Maximum limit
 *
 * Usage:
 * const { canPerform, reason, isAtLimit } = useCanPerformAction('create_document', currentDocCount);
 *
 * if (!canPerform) {
 *   // Show soft lock error
 *   return <SoftLockError errorMessage={reason} />;
 * }
 */
export const useCanPerformAction = (actionType, currentValue) => {
  const { quota } = useQuota();

  if (!quota) {
    return {
      canPerform: true,
      reason: null,
      isAtLimit: false,
      currentUsage: currentValue,
      limit: null,
    };
  }

  // Action type mapping ke limit dan pesan
  const actionMap = {
    create_document: {
      limit: quota.limits?.maxDocsPerGroup,
      currentUsage: currentValue,
      message: `Penyimpanan grup penuh (${currentValue}/${quota.limits?.maxDocsPerGroup} dokumen). Upgrade Admin Grup ke Premium untuk kapasitas 100 dokumen.`,
      shortMessage: `Limit dokumen grup tercapai (${quota.limits?.maxDocsPerGroup} dokumen)`,
    },
    create_group: {
      limit: quota.limits?.maxOwnedGroups,
      currentUsage: currentValue,
      message: `Anda telah mencapai batas pembuatan grup (${currentValue}/${quota.limits?.maxOwnedGroups} grup). Upgrade ke Premium untuk membuat hingga 10 grup.`,
      shortMessage: `Limit grup tercapai (${quota.limits?.maxOwnedGroups} grup)`,
    },
    add_member: {
      limit: quota.limits?.maxMembersPerGroup,
      currentUsage: currentValue,
      message: `Grup ini sudah penuh (${currentValue}/${quota.limits?.maxMembersPerGroup} anggota). Upgrade ke Premium untuk unlimited anggota grup.`,
      shortMessage: `Limit anggota grup tercapai (${quota.limits?.maxMembersPerGroup} anggota)`,
    },
    upload_file: {
      limit: quota.limits?.maxFileSize,
      currentUsage: currentValue,
      message: `File terlalu besar (${currentValue}). Maksimal ${quota.limits?.maxFileSizeLabel}${!quota.isPremiumActive ? ". Upgrade ke Premium untuk upload hingga 50 MB." : ""}`,
      shortMessage: `File terlalu besar (maksimal ${quota.limits?.maxFileSizeLabel})`,
    },
    create_version: {
      limit: quota.limits?.maxVersionsPerDocument,
      currentUsage: currentValue,
      message: `Batas revisi dokumen tercapai (${currentValue}/${quota.limits?.maxVersionsPerDocument} versi). Upgrade ke Premium untuk batas 20 versi.`,
      shortMessage: `Limit versi dokumen tercapai (${quota.limits?.maxVersionsPerDocument} versi)`,
    },
    create_package: {
      limit: quota.limits?.maxDocsPerPackage,
      currentUsage: currentValue,
      message: `Maksimal ${quota.limits?.maxDocsPerPackage} dokumen per paket. Upgrade ke Premium untuk kapasitas lebih besar (hingga 20 dokumen).`,
      shortMessage: `Limit dokumen per paket tercapai (${quota.limits?.maxDocsPerPackage} dokumen)`,
    },
  };

  const config = actionMap[actionType];

  if (!config) {
    console.warn(`[useCanPerformAction] Unknown action type: ${actionType}`);
    return {
      canPerform: true,
      reason: null,
      isAtLimit: false,
      currentUsage: currentValue,
      limit: null,
    };
  }

  const isAtLimit = config.currentUsage >= config.limit;
  const canPerform = !isAtLimit;

  return {
    canPerform,
    reason: isAtLimit ? config.message : null,
    shortReason: isAtLimit ? config.shortMessage : null,
    isAtLimit,
    currentUsage: config.currentUsage,
    limit: config.limit,
    isPremium: quota.isPremiumActive,
  };
};

export default useCanPerformAction;
