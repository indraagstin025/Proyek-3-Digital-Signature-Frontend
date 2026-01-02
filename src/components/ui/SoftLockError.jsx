import { HiX, HiLockClosed, HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

/**
 * SoftLockError Component
 * Menampilkan error ketika user mencoba action yang blocked karena limit (soft lock)
 * Data lama tetap accessible, hanya action CREATE yang diblock
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - errorMessage: string - Error message dari backend
 * - actionType: string - Tipe action yang diblock (create_document, create_group, etc)
 * - feature: string - Fitur yang mencapai limit (optional, untuk upgrade modal context)
 *
 * Usage:
 * const [softLockError, setSoftLockError] = useState(null);
 * <SoftLockError
 *   isOpen={!!softLockError}
 *   onClose={() => setSoftLockError(null)}
 *   errorMessage={softLockError?.message}
 *   actionType="create_document"
 * />
 */
export const SoftLockError = ({ isOpen, onClose, errorMessage = "Anda telah mencapai batas penggunaan. Upgrade ke Premium untuk melanjutkan.", actionType = "create", feature = "documents" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getActionDetails = () => {
    const details = {
      create_document: {
        title: "📄 Penyimpanan Penuh",
        action: "membuat dokumen baru",
        icon: "📄",
      },
      create_group: {
        title: "👥 Grup Penuh",
        action: "membuat grup baru",
        icon: "👥",
      },
      add_member: {
        title: "👤 Anggota Penuh",
        action: "menambah anggota grup",
        icon: "👤",
      },
      upload_file: {
        title: "📤 File Terlalu Besar",
        action: "upload file",
        icon: "📤",
      },
      create_version: {
        title: "🔄 Versi Penuh",
        action: "membuat versi baru dokumen",
        icon: "🔄",
      },
      create_package: {
        title: "📦 Paket Penuh",
        action: "membuat paket tanda tangan baru",
        icon: "📦",
      },
    };

    return (
      details[actionType] || {
        title: "⛔ Batas Tercapai",
        action: "melakukan aksi ini",
        icon: "⛔",
      }
    );
  };

  const details = getActionDetails();

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
            <HiX className="text-2xl" />
          </button>

          <div className="text-5xl mb-3">{details.icon}</div>
          <h3 className="text-2xl font-bold">{details.title}</h3>
          <p className="text-orange-100 text-sm mt-2">Anda tidak bisa {details.action} sekarang</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Error Message */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <HiLockClosed className="text-orange-600 dark:text-orange-400 text-xl flex-shrink-0" />
              <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">{errorMessage}</p>
            </div>
          </div>

          {/* What You Can Still Do */}
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">✅ Anda masih bisa:</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Melihat dan membuka dokumen yang sudah ada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Menandatangani dokumen yang sudah ditugaskan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Mengelola dan mengorganisir data yang ada</span>
              </li>
            </ul>
          </div>

          {/* Upgrade Benefits */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
              <HiSparkles className="text-yellow-500" />
              Premium Unlimited
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Upgrade sekarang untuk <span className="font-bold">{details.action} tanpa batas</span> dan nikmati semua fitur premium lainnya.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 bg-slate-50 dark:bg-slate-800">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Nanti
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <HiSparkles /> Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoftLockError;
