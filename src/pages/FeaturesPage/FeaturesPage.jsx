import React, { useState, useEffect } from 'react';
import { ImSpinner9 } from "react-icons/im";
import { Link } from 'react-router-dom';
import { 
  FaPenNib, 
  FaLayerGroup, 
  FaUsers, 
  FaWhatsapp, 
  FaBolt, 
  FaMagic,
  FaCheckCircle
} from 'react-icons/fa';

/* =========================================
   Reusable Component: FeatureRow
   ========================================= */
const FeatureRow = ({ 
  title, 
  description, 
  badge, 
  badgeColor, 
  icon: Icon, 
  featuresList, 
  imagePlaceholder, 
  isReversed 
}) => {
  return (
    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 mb-24 last:mb-0`}>
      
      {/* --- BAGIAN GAMBAR (Placeholder) --- */}
      <div className="w-full lg:w-1/2">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 aspect-[4/3] flex items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors">
            
            <div className="text-center p-8">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-slate-400">
                    <Icon />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-sm font-bold mb-2">
                    {imagePlaceholder.title}
                </p>
                <p className="text-xs text-slate-400">
                    {imagePlaceholder.subtitle}
                </p>
            </div>
            {/* <img src={imagePlaceholder.src} alt={title} className="absolute inset-0 w-full h-full object-cover" /> */}
        </div>
      </div>

      {/* --- BAGIAN TEKS --- */}
      <div className="w-full lg:w-1/2">
        <span className={`font-bold tracking-wider text-sm uppercase px-3 py-1 rounded-lg mb-4 inline-block ${badgeColor}`}>
          {badge}
        </span>
        
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
          {title}
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
          {description}
        </p>

        {featuresList && (
          <ul className="space-y-3">
            {featuresList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <FaCheckCircle className="mt-1 text-green-500 shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

const FeaturesPage = () => {
  // 1. State untuk Loading
  const [isLoading, setIsLoading] = useState(true);

  // 2. Efek Loading & Scroll to Top
  useEffect(() => {
    window.scrollTo(0, 0); // Pastikan scroll ke atas saat halaman dibuka
    
    // Simulasi loading selama 0.8 detik
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // 3. Tampilan Loading Spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
           <ImSpinner9 className="animate-spin h-10 w-10 text-indigo-600" />
           <p className="text-slate-500 text-sm font-medium animate-pulse">Menyiapkan Fitur...</p>
        </div>
      </div>
    );
  }

  // 4. Konten Utama
  return (
    <main className="w-full bg-white dark:bg-slate-900 min-h-screen pt-24 pb-24 transition-colors duration-300">
      
      {/* === HERO SECTION === */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-wider mb-6">
          <FaMagic /> Fitur Lengkap
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
          Solusi Tanda Tangan untuk <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Setiap Kebutuhan Bisnis
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Dari penggunaan pribadi hingga kolaborasi tim korporat. Pelajari bagaimana WeSign mempermudah alur dokumen Anda.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* 1. PERSONAL SIGNING */}
        <FeatureRow 
          isReversed={false}
          icon={FaPenNib}
          badge="Individual"
          badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          title="Tanda Tangan Personal"
          description="Fitur dasar untuk kebutuhan sehari-hari. Upload dokumen PDF tunggal, bubuhkan tanda tangan, inisial, atau stempel tanggal dengan mudah melalui editor drag-and-drop."
          featuresList={[
            "Editor Dokumen Intuitif (Drag & Drop).",
            "Mendukung Tanda Tangan Gambar, Tulis, atau Font.",
            "Unduh langsung hasil PDF tervalidasi."
          ]}
          imagePlaceholder={{
            title: "[Screenshot Editor Personal]",
            subtitle: "Tampilkan UI saat user menaruh tanda tangan di PDF."
          }}
        />

        {/* 2. PACKAGE SIGNING */}
        <FeatureRow 
          isReversed={true}
          icon={FaLayerGroup}
          badge="Bulk Action"
          badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          title="Package Signing (Multi-Dokumen)"
          description="Efisiensi waktu untuk HRD atau Legal. Tanda tangani puluhan dokumen sekaligus (seperti Kontrak Karyawan atau Invoice) dalam satu kali proses upload."
          featuresList={[
            "Upload Banyak File PDF sekaligus.",
            "Bubuhkan tanda tangan ke posisi yang sama di semua halaman.",
            "Output berupa file ZIP yang berisi semua dokumen."
          ]}
          imagePlaceholder={{
            title: "[Visual Package/Bulk]",
            subtitle: "Tampilkan list banyak file yang sedang diproses sekaligus."
          }}
        />

        {/* DIVIDER */}
        <div className="py-16 text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent w-full mb-8"></div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Deep Dive: Group Signing</h3>
            <p className="text-slate-500 text-sm">Kolaborasi tim tingkat lanjut dengan alur kerja terautomasi.</p>
        </div>

        {/* 3. GROUP - SETUP & INVITE */}
        <FeatureRow 
          isReversed={false}
          icon={FaUsers}
          badge="Langkah 1: Setup"
          badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          title="Buat Grup & Undang Anggota"
          description="Mulai dengan membuat 'Room' tanda tangan. Undang pihak internal maupun eksternal via email. Tentukan siapa yang hanya melihat (Viewer) dan siapa yang harus tanda tangan (Signer)."
          featuresList={[
            "Manajemen anggota grup yang mudah.",
            "Atur peran: Admin, Signer, atau Viewer.",
            "Mendukung urutan penandatanganan (Sequential/Parallel)."
          ]}
          imagePlaceholder={{
            title: "[UI Modal Invite Member]",
            subtitle: "Tampilkan form invite user dan list anggota grup."
          }}
        />

        {/* 4. GROUP - WHATSAPP NOTIF */}
        <FeatureRow 
          isReversed={true}
          icon={FaWhatsapp}
          badge="Langkah 2: Notifikasi"
          badgeColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          title="Notifikasi via WhatsApp"
          description="Tidak semua orang rajin cek email. Sistem kami terintegrasi dengan WhatsApp Gateway untuk mengirim link akses dokumen secara instan kepada penandatangan saat giliran mereka tiba."
          featuresList={[
            "Pesan otomatis terkirim ke nomor WA terdaftar.",
            "Link akses aman (tanpa perlu login ribet).",
            "Reminder otomatis jika belum ditandatangani."
          ]}
          imagePlaceholder={{
            title: "[Mockup Chat WhatsApp]",
            subtitle: "Tampilkan simulasi chat WA berisi link dokumen WeSign."
          }}
        />

        {/* 5. GROUP - REALTIME SYNC */}
        <FeatureRow 
          isReversed={false}
          icon={FaBolt}
          badge="Langkah 3: Eksekusi"
          badgeColor="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
          title="Real-time Collaboration (Live)"
          description="Pengalaman futuristik layaknya Canva/Figma. Lihat kursor dan aktivitas penandatangan lain secara langsung di layar Anda. Transparan dan mencegah konflik edit."
          featuresList={[
            "Sinkronisasi kursor & posisi tanda tangan (WebSocket).",
            "Indikator 'User sedang mengetik/tanda tangan'.",
            "Update status dokumen secara live tanpa refresh halaman."
          ]}
          imagePlaceholder={{
            title: "[Visual Real-time Canvas]",
            subtitle: "Tampilkan dokumen dengan banyak kursor warna-warni."
          }}
        />

      </div>

      {/* === CTA SECTION === */}
      <section className="mt-24 py-16 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
         <div className="max-w-4xl mx-auto px-6 text-center">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Siap Meningkatkan Produktivitas Tim?
             </h2>
             <p className="text-slate-600 dark:text-slate-400 mb-8">
                Pilih fitur yang sesuai dengan skala bisnis Anda. Mulai dari Personal hingga Enterprise Group Signing.
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
                
                {/* Tombol Demo mengarah ke /demo */}
                <Link 
                  to="/demo" 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 inline-flex items-center justify-center"
                >
                   Coba Demo Group Sign
                </Link>

                <button className="px-8 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                   Lihat Paket Harga
                </button>
             </div>
         </div>
      </section>

    </main>
  );
};

export default FeaturesPage;