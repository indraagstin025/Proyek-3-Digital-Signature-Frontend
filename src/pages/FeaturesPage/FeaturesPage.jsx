import React, { useState, useEffect } from "react";
import { ImSpinner9 } from "react-icons/im";
import { Link } from "react-router-dom";
import {
  FaPenNib, FaLayerGroup, FaUsers, FaWhatsapp, FaBolt, FaMagic,
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaImage
} from "react-icons/fa";

// Import Gambar
import foto1 from "../../assets/images/Foto1.png";
import foto2 from "../../assets/images/Foto2.png";
import foto3 from "../../assets/images/Foto3.jpeg";
import foto4 from "../../assets/images/Foto4.jpeg";
import foto5 from "../../assets/images/Foto5.jpeg";
import foto6 from "../../assets/images/Foto6.jpeg";
// import foto_ws1 from "../../assets/images/Foto_ws1.jpeg";
import foto_pkt1 from "../../assets/images/FotoPkt1.png"; // Ganti dengan nama file Anda
import foto_pkt2 from "../../assets/images/FotoPkt2.png"; // Ganti dengan nama file Anda
import foto_pkt3 from "../../assets/images/FotoPkt3.png"; // Ganti dengan nama file Anda
import foto_pkt4 from "../../assets/images/FotoPkt4.png"; // Ganti dengan nama file Anda
//import gambar group settup
import foto_group1 from "../../assets/images/FotoGroup1.png"; 
import foto_group2 from "../../assets/images/FotoGroup2.png";
import foto_group3 from "../../assets/images/FotoGroup3.png";
import foto_group4 from "../../assets/images/FotoGroup4.png";
// import GROUP NOTIFICATION
import foto_notif1 from "../../assets/images/FotoNotif1.png";
import foto_notif2 from "../../assets/images/FotoNotif2.png";
import foto_notif3 from "../../assets/images/FotoNotif3.png";
// import GROUP REALTIME
import foto_groupRealtime1 from "../../assets/images/FotoGroupRealtime1.png";
import foto_groupRealtime2 from "../../assets/images/FotoGroupRealtime2.png";
import foto_groupRealtime3 from "../../assets/images/FotoGroupRealtime3.png";
import foto_groupRealtime4 from "../../assets/images/FotoGroupRealtime4.png";




const FeatureRow = ({
  title, description, badge, badgeColor, icon: Icon, featuresList, slides = [], isReversed
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 mb-24 last:mb-0`}>

      {/* --- SLIDER AREA --- */}
      <div className="w-full lg:w-1/2">
        <div className="relative group bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 aspect-[4/3] overflow-hidden hover:border-blue-400 transition-colors shadow-sm">

          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900">
                {/* 1. BAGIAN GAMBAR */}
                <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden p-1">
                  {slide.src ? (
                    <img
                      src={slide.src}
                      alt={slide.title || `Slide ${index}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-3xl text-slate-300">
                      {slide.icon ? <slide.icon /> : <FaImage />}
                    </div>
                  )}
                </div>

                {/* 2. BAGIAN TEKS */}
                {(slide.title || slide.subtitle) && (
                  <div className="shrink-0 w-full py-3 px-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center relative z-20">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{slide.title}</p>
                    {slide.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{slide.subtitle}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigasi Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-700/90 p-2 rounded-full text-slate-700 dark:text-white shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-30"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-700/90 p-2 rounded-full text-slate-700 dark:text-white shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-30"
              >
                <FaChevronRight size={14} />
              </button>

              <div className="absolute bottom-[4.5rem] left-0 right-0 flex justify-center gap-1.5 z-30 pointer-events-none">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all shadow-sm ${currentSlide === idx ? "bg-blue-500 w-4" : "bg-slate-300/80 w-1.5"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- TEXT CONTENT --- */}
      <div className="w-full lg:w-1/2">
        <span className={`font-bold tracking-wider text-sm uppercase px-3 py-1 rounded-lg mb-4 inline-block ${badgeColor}`}>
          {badge}
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">{title}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">{description}</p>
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Memastikan FeaturesPage sendiri load dari paling atas
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <main className="w-full bg-white dark:bg-slate-900 min-h-screen pt-24 pb-24 transition-colors duration-300">

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-wider mb-6">
          <FaMagic /> Fitur Lengkap
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
          Solusi Tanda Tangan untuk <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Setiap Kebutuhan Bisnis</span>
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
          description="Fitur dasar untuk kebutuhan sehari-hari. Upload dokumen PDF tunggal, bubuhkan tanda tangan, inisial, atau stempel tanggal dengan mudah."
          featuresList={[
            "Editor Dokumen Intuitif (Drag & Drop).",
            "Mendukung Tanda Tangan Gambar, Tulis, atau Font.",
            "Unduh langsung hasil PDF tervalidasi."
          ]}
          slides={[
            { src: foto1, title: "Dashboard Utama", subtitle: "Tampilan awal dashboard dokumen." },
            { src: foto2, title: "Upload Dokumen", subtitle: "Proses upload file PDF." },
            { src: foto3, title: "Editor Tanda Tangan", subtitle: "Drag & drop tanda tangan ke halaman." },
            { src: foto4, title: "Setting Penanda Tangan", subtitle: "Atur posisi dan ukuran." },
            { src: foto5, title: "Preview Dokumen", subtitle: "Lihat hasil sebelum finalisasi." },
            { src: foto6, title: "Dokumen Selesai", subtitle: "Download hasil PDF yang sudah ditandatangani." }
          ]}
        />

        {/* 2. PACKAGE SIGNING */}
        <FeatureRow
          isReversed={true}
          icon={FaLayerGroup}
          badge="Bulk Action"
          badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          title="Package Signing (Multi-Dokumen)"
          description="Tanda tangani banyak dokumen sekaligus dengan efisien. Upload beberapa file PDF, pilih dokumen yang ingin ditandatangani, lalu bubuhkan tanda tangan ke setiap dokumen dengan mudah."
          featuresList={[
            "Upload multiple dokumen PDF dalam satu waktu.",
            "Pilih dokumen dengan sistem checklist yang fleksibel.",
            "Drag & Drop tanda tangan ke setiap halaman dokumen.",
            "Simpan semua dokumen yang sudah ditandatangani secara langsung."
          ]}
          slides={[
            { src: foto_pkt1, title: "Upload Dokumen", subtitle: "Upload 2 atau lebih dokumen PDF sekaligus." },
            { src: foto_pkt2, title: "Pilih Dokumen", subtitle: "Centang dokumen yang ingin ditandatangani.", icon: FaCheckCircle },
            { src: foto_pkt3, title: "Tanda Tangan", subtitle: "Drag & drop tanda tangan ke setiap dokumen.", icon: FaPenNib },
            { src: foto_pkt4, title: "Simpan Langsung", subtitle: "Klik simpan untuk menyimpan semua dokumen.", icon: FaBolt }
          ]}
        />

        <div className="py-16 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent w-full mb-8"></div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Deep Dive: Group Signing</h3>
          <p className="text-slate-500 text-sm">Kolaborasi tim tingkat lanjut dengan alur kerja terautomasi.</p>
        </div>

        {/* 3. GROUP SETUP */}
        <FeatureRow
          isReversed={false}
          icon={FaUsers}
          badge="Langkah 1: Setup"
          badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          title="Buat Grup & Undang Anggota"
          description="Mulai dengan membuat grup tanda tangan digital. Undang anggota tim menggunakan link undangan, lalu upload dokumen dan atur siapa saja yang menjadi penandatangan."
          featuresList={[
            "Buat grup kolaborasi dengan mudah.",
            "Invite anggota melalui link undangan.",
            "Upload dokumen langsung ke dalam grup.",
            "Atur signer yang akan menandatangani dokumen.",
            "Berbagi dokumen dengan seluruh anggota grup."
          ]}
          slides={[
            { src: foto_group1, title: "Buat Grup", subtitle: "Buat room kolaborasi baru.", icon: FaUsers },
            { src: foto_group2, title: "Invite Anggota", subtitle: "Bagikan link undangan ke tim.", icon: FaPenNib },
            { src: foto_group3, title: "Upload Dokumen", subtitle: "Upload dokumen yang akan ditandatangani.", icon: FaLayerGroup },
            { src: foto_group4, title: "Atur Signer", subtitle: "Pilih dan atur anggota sebagai penandatangan.", icon: FaCheckCircle }
          ]}
        />

        {/* 4. GROUP NOTIFICATION */}
        <FeatureRow
          isReversed={true}
          icon={FaWhatsapp}
          badge="Langkah 2: Notifikasi"
          badgeColor="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          title="Notifikasi Otomatis via WhatsApp"
          description="Setelah pengupload dokumen mengatur dan menyimpan daftar penandatangan, sistem akan otomatis mengirimkan notifikasi ke WhatsApp setiap signer dengan link akses dokumen."
          featuresList={[
            "Notifikasi otomatis terkirim saat signer diatur.",
            "Pesan berisi link langsung ke dokumen yang perlu ditandatangani.",
            "Akses aman tanpa perlu login berulang.",
            "Reminder otomatis untuk signer yang belum menandatangani."
          ]}
          slides={[
            { src: foto_notif1, title: "Pengaturan Signer", subtitle: "Atur dan simpan daftar penandatangan.", icon: FaUsers },
            { src: foto_notif2, title: "Kirim Otomatis", subtitle: "Notifikasi WhatsApp terkirim otomatis.", icon: FaWhatsapp },
            { src: foto_notif3, title: "Akses Dokumen", subtitle: "Signer klik link untuk akses langsung.", icon: FaBolt }
          ]}
        />

        {/* 5. GROUP REALTIME */}
        <FeatureRow
          isReversed={false}
          icon={FaBolt}
          badge="Langkah 3: Eksekusi & Finalisasi"
          badgeColor="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
          title="Tanda Tangan Real-time & Finalisasi"
          description="Pengalaman kolaborasi futuristik seperti Canva dan Google Docs. Semua penandatangan dapat melihat dan membubuhkan tanda tangan secara live. Setelah semua signer selesai, pengupload dokumen dapat melakukan finalisasi."
          featuresList={[
            "Tanda tangan secara live dan realtime.",
            "Lihat aktivitas penandatangan lain secara langsung.",
            "Sinkronisasi posisi tanda tangan dengan WebSocket.",
            "Finalisasi dokumen oleh pengupload setelah semua selesai.",
            "Dokumen final siap diunduh atau dibagikan."
          ]}
          slides={[
            { src: foto_groupRealtime1, title: "Live Signing", subtitle: "Tanda tangan bersama secara realtime.", icon: FaBolt },
            { src: foto_groupRealtime2, title: "Lihat Progres", subtitle: "Pantau status setiap penandatangan.", icon: FaUsers },
            { src: foto_groupRealtime3, title: "Finalisasi", subtitle: "Pengupload memfinalisasi dokumen.", icon: FaCheckCircle },
            { src: foto_groupRealtime4, title: "Dokumen Selesai", subtitle: "Download atau bagikan dokumen final.", icon: FaLayerGroup }
          ]}
        />

      </div>

      {/* CTA SECTION */}
      <section className="mt-24 py-16 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Siap Meningkatkan Produktivitas Tim?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Pilih fitur yang sesuai dengan skala bisnis Anda. Mulai dari Personal hingga Enterprise.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/demo"
              // Opsional: Jika Demo juga butuh scroll ke atas
              onClick={() => window.scrollTo(0, 0)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              Coba Demo
            </Link>

            {/* [PERBAIKAN] Tambahkan onClick window.scrollTo(0,0) di sini */}
            <Link
              to='/pricing'
              onClick={() => window.scrollTo(0, 0)}
              className="px-8 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Lihat Paket Harga
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default FeaturesPage;