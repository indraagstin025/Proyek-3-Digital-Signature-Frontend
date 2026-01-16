import React from "react";
import { useNavigate } from "react-router-dom";
// Tambahkan FaCodeBranch (Versioning) dan FaTags (Labeling)
import { 
  FaFilePdf, FaUsers, FaBoxOpen, FaArrowRight, FaLayerGroup, 
  FaShieldAlt, FaSignature, FaCodeBranch, FaTags 
} from "react-icons/fa";

// --- KOMPONEN BARU: INFO CARD ---
const DocumentsInfoCard = () => {
  return (
    <div
      className="mb-8 relative overflow-hidden rounded-2xl 
      bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-700
      dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900
      dark:border dark:border-indigo-500/30 dark:shadow-indigo-900/20
      px-6 py-6 text-white shadow-lg shadow-indigo-500/20 animate-fade-in transition-colors duration-300"
    >
      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-purple-400 opacity-20 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* BAGIAN KIRI: Teks & Penjelasan */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
              Pusat Kontrol <span className="text-indigo-100 drop-shadow-sm">Dokumen</span>
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold border border-white/20 backdrop-blur-sm">ALL-IN-ONE</span>
          </div>

          <p className="text-indigo-50 dark:text-slate-300 text-sm mb-5 leading-relaxed font-medium max-w-2xl opacity-90">
            Satu tempat untuk semua kebutuhan tanda tangan Anda. Kelola dokumen <strong>Personal</strong>, kolaborasi <strong>Grup</strong>, atau <strong>Paket</strong> massal. 
            Dilengkapi dengan <strong className="text-white">Versioning</strong> untuk melacak setiap revisi dan <strong className="text-white">Labeling</strong> agar arsip tetap rapi.
          </p>

          {/* FITUR HORIZONTAL (Pills) */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaShieldAlt className="text-red-300 text-xs" />
              <span className="text-xs font-semibold">Privasi Terjamin</span>
            </div>
            
            {/* Fitur Versioning */}
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaCodeBranch className="text-yellow-300 text-xs" />
              <span className="text-xs font-semibold">Auto Versioning</span>
            </div>

            {/* Fitur Labeling */}
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaTags className="text-pink-300 text-xs" />
              <span className="text-xs font-semibold">Smart Labeling</span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700 backdrop-blur-md transition-colors cursor-default">
              <FaSignature className="text-purple-300 text-xs" />
              <span className="text-xs font-semibold">Bulk Signing</span>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: Ilustrasi Icon Besar */}
        <div className="hidden md:flex flex-shrink-0 relative pr-4">
          <div className="absolute inset-0 bg-white blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <FaLayerGroup className="relative z-10 text-[6rem] text-white/20 dark:text-indigo-500/20 -rotate-12 transform transition-transform duration-700 hover:rotate-0 drop-shadow-xl" />
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const DashboardDocuments = () => {
  const navigate = useNavigate();

  // Konfigurasi Kartu Navigasi
  const documentSections = [
    {
      id: "personal",
      title: "Arsip Pribadi",
      description: "Kelola dokumen milik Anda sendiri. Upload, tanda tangani, dan simpan secara privat.",
      icon: <FaFilePdf className="w-8 h-8 text-red-600 dark:text-red-500" />,
      path: "/dashboard/documents/personal",
      colorClass: "from-red-500 to-rose-600",
      bgClass: "bg-red-50 dark:bg-red-900/10",
      borderClass: "group-hover:border-red-400 dark:group-hover:border-red-700",
      textClass: "text-red-600 dark:text-red-400"
    },
    {
      id: "group",
      title: "Arsip Grup",
      description: "Akses dokumen kolaborasi tim. Lihat dokumen yang dibagikan dalam Workspace Anda.",
      icon: <FaUsers className="w-8 h-8 text-blue-600 dark:text-blue-500" />,
      path: "/dashboard/documents/group",
      colorClass: "from-blue-500 to-indigo-600",
      bgClass: "bg-blue-50 dark:bg-blue-900/10",
      borderClass: "group-hover:border-blue-400 dark:group-hover:border-blue-700",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "package",
      title: "Riwayat Paket",
      description: "Lacak status pengiriman dokumen massal (Batch Signing) yang Anda kirimkan.",
      icon: <FaBoxOpen className="w-8 h-8 text-purple-600 dark:text-purple-500" />,
      path: "/dashboard/packages",
      colorClass: "from-purple-500 to-violet-600",
      bgClass: "bg-purple-50 dark:bg-purple-900/10",
      borderClass: "group-hover:border-purple-400 dark:group-hover:border-purple-700",
      textClass: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar relative bg-transparent">
      
      {/* --- HEADER SECTION --- */}
      <div className="sticky top-0 z-30 px-3 sm:px-8 pt-6 pb-2">
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md -z-10 shadow-sm border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" />
        
        <div className="flex flex-col gap-1 mb-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dokumen
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Pilih jenis penyimpanan dokumen yang ingin Anda akses.
            </p>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="px-3 sm:px-8 pb-24 max-w-7xl mx-auto mt-6">
        
        {/* 🔥 TAMPILKAN CARD INFO DI SINI */}
        <DocumentsInfoCard />

        {/* GRID NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documentSections.map((section) => (
                <div 
                    key={section.id}
                    onClick={() => navigate(section.path)}
                    className={`group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${section.borderClass}`}
                >
                    {/* Background Gradient Effect on Hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>

                    <div>
                        {/* Header Card */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${section.bgClass} transition-colors`}>
                                {section.icon}
                            </div>
                            <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-700/50 group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors">
                                <FaArrowRight className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {section.description}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center">
                        <span className={`text-xs font-semibold ${section.textClass} flex items-center gap-1`}>
                            Buka {section.title}
                        </span>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default DashboardDocuments;