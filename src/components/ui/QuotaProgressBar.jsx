import { useQuota } from "../../context/QuotaContext";

/**
 * QuotaProgressBar Component
 * Menampilkan progress bar penggunaan quota dengan color indication
 *
 * Props:
 * - type: string - Tipe quota ("groups", "docsPerGroup", "docsPerPackage", "versions", "members", "fileSize")
 * - currentValue: number - Nilai saat ini
 * - label: string - Label untuk ditampilkan
 * - showUpgradeLink: boolean - Tampilkan link upgrade (default: true)
 *
 * Usage:
 * <QuotaProgressBar type="groups" currentValue={3} label="Grup Dibuat" />
 */
export const QuotaProgressBar = ({ type, currentValue, label, showUpgradeLink = true }) => {
  const { quota, isPremium } = useQuota();

  if (!quota) return null;

  // Mapping tipe quota ke limit key
  const limitMap = {
    groups: quota.limits.maxOwnedGroups,
    docsPerGroup: quota.limits.maxDocsPerGroup,
    docsPerPackage: quota.limits.maxDocsPerPackage,
    versions: quota.limits.maxVersionsPerDocument,
    members: quota.limits.maxMembersPerGroup,
    fileSize: quota.limits.maxFileSize,
  };

  const maxValue = limitMap[type];
  if (!maxValue) {
    console.warn(`[QuotaProgressBar] Unknown type: ${type}`);
    return null;
  }

  const percentage = Math.min((currentValue / maxValue) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  // Determine color based on percentage
  let barColor = "bg-emerald-500";
  let textColor = "";
  let warningIcon = "";

  if (isAtLimit) {
    barColor = "bg-red-500";
    textColor = "text-red-600 dark:text-red-400";
    warningIcon = "🔒";
  } else if (isNearLimit) {
    barColor = "bg-amber-500";
    textColor = "text-amber-600 dark:text-amber-400";
    warningIcon = "⚠️";
  }

  return (
    <div className="w-full">
      {/* Header dengan Label dan Value */}
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className={`font-semibold ${textColor}`}>
          {currentValue}/{maxValue}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div className={`h-2.5 rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>

      {/* Warning Message */}
      {isNearLimit && !isPremium && (
        <p className={`text-xs mt-2 ${textColor} flex items-center gap-1.5`}>
          {warningIcon}
          <span>
            Hampir penuh!{" "}
            <a href="/pricing" className="underline font-semibold hover:opacity-80 transition-opacity">
              Upgrade ke Premium
            </a>
          </span>
        </p>
      )}

      {isAtLimit && (
        <p className={`text-xs mt-2 ${textColor} flex items-center gap-1.5`}>
          {warningIcon}
          <span>
            Limit tercapai!{" "}
            {!isPremium && (
              <a href="/pricing" className="underline font-semibold hover:opacity-80 transition-opacity">
                Upgrade sekarang
              </a>
            )}
          </span>
        </p>
      )}
    </div>
  );
};

export default QuotaProgressBar;
