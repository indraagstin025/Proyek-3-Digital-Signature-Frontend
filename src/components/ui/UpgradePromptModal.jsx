import { useNavigate } from "react-router-dom";
import { HiX, HiSparkles, HiCheckCircle } from "react-icons/hi";

/**
 * UpgradePromptModal Component
 * Modal yang muncul ketika user mencapai limit dan perlu upgrade ke premium
 *
 * Props:
 * - isOpen: boolean - Kontrol modal visibility
 * - onClose: function - Callback ketika modal ditutup
 * - feature: string - Nama fitur yang mencapai limit
 *
 * Usage:
 * const [showUpgradeModal, setShowUpgradeModal] = useState(false);
 * <UpgradePromptModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature="groups" />
 */
export const UpgradePromptModal = ({ isOpen, onClose, feature = "groups" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Feature messages explaining the benefit
  const featureMessages = {
    groups: {
      title: "Buat Lebih Banyak Grup",
      current: "1 grup",
      premium: "hingga 10 grup",
      icon: "📁",
    },
    fileSize: {
      title: "Upload File Lebih Besar",
      current: "10 MB per file",
      premium: "hingga 50 MB per file",
      icon: "📤",
    },
    members: {
      title: "Undang Anggota Tanpa Batas",
      current: "5 anggota per grup",
      premium: "unlimited anggota",
      icon: "👥",
    },
    docs: {
      title: "Simpan Lebih Banyak Dokumen",
      current: "10 dokumen per grup",
      premium: "hingga 100 dokumen per grup",
      icon: "📄",
    },
    versions: {
      title: "Versi Dokumen Lebih Banyak",
      current: "5 versi per dokumen",
      premium: "hingga 20 versi per dokumen",
      icon: "🔄",
    },
    package: {
      title: "Tandatangani Lebih Banyak Dokumen",
      current: "3 dokumen per paket",
      premium: "hingga 20 dokumen per paket",
      icon: "✍️",
    },
  };

  const featureData = featureMessages[feature] || featureMessages.groups;

  const benefits = [
    { icon: "📤", text: "Upload file hingga 50 MB" },
    { icon: "📁", text: "Buat hingga 10 grup" },
    { icon: "👥", text: "Undang anggota tanpa batas" },
    { icon: "📄", text: "Simpan hingga 100 dokumen per grup" },
    { icon: "🔄", text: "Simpan hingga 20 versi per dokumen" },
    { icon: "✍️", text: "Tandatangani hingga 20 dokumen sekaligus" },
  ];

  const handleNavigateToPricing = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in">
        {/* Header dengan Close Button */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
            <HiX className="text-2xl" />
          </button>

          <div className="text-4xl mb-3">{featureData.icon}</div>
          <h3 className="text-2xl font-bold">{featureData.title}</h3>
          <p className="text-blue-100 text-sm mt-2">Upgrade ke Premium untuk unlimited akses</p>
        </div>

        {/* Current vs Premium Comparison */}
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            {/* Current Plan */}
            <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
              <div className="text-2xl">📦</div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Paket FREE Anda</p>
                <p className="text-sm">{featureData.current}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="text-2xl">⬇️</div>
            </div>

            {/* Premium Plan */}
            <div className="flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
              <HiSparkles className="text-2xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Paket PREMIUM</p>
                <p className="text-sm">{featureData.premium}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">✨ Semua Keuntungan Premium:</h4>
          <ul className="space-y-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <HiCheckCircle className="text-emerald-500 flex-shrink-0" />
                <span>
                  {benefit.icon} {benefit.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Nanti Saja
          </button>
          <button
            onClick={handleNavigateToPricing}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <HiSparkles /> Upgrade Sekarang
          </button>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">💳 Pembayaran aman. Anda bisa cancel kapan saja.</div>
      </div>
    </div>
  );
};

export default UpgradePromptModal;
