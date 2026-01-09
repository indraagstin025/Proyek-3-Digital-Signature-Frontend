import React, { useState, useEffect } from 'react';
import { ImSpinner9 } from "react-icons/im"; // ✅ Import Icon Spinner
import {
  FaPlay,
  FaNetworkWired,
  FaBook,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';

/* =========================
   Komponen Baris Dokumen
========================= */
const DocumentRow = ({ number, title, status, link }) => {
  const isAvailable = status === 'Tersedia';

  return (
    <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <span className="w-12 font-bold text-slate-400 dark:text-slate-500">
        {number}
      </span>

      <a
        href={link}
        className="flex-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
      >
        <FaFileAlt className="text-sm" />
        {title}
      </a>

      <span
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1
        ${
          isAvailable
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        }`}
      >
        {isAvailable ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
        {status}
      </span>
    </div>
  );
};

/* =========================
   Halaman Utama Tour
========================= */
const TourPage = () => {
  // 1. State untuk Loading
  const [isLoading, setIsLoading] = useState(true);

  // 2. Efek Loading & Scroll to Top
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll ke atas saat dibuka
    
    // Simulasi loading 1 detik
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 3. Tampilan Loading Spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
            <ImSpinner9 className="animate-spin h-10 w-10 text-blue-600" />
            <p className="text-slate-500 text-sm font-medium animate-pulse">Memuat Tour...</p>
        </div>
      </div>
    );
  }

  // 4. Konten Utama
  return (
    <main className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen pt-24 pb-24">
      
      {/* === BAGIAN 1: HEADER === */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-6">
          <FaNetworkWired /> System Overview
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          Jelajahi Ekosistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">WeSign</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Lihat bagaimana kami menggabungkan keamanan kriptografi dengan pengalaman pengguna yang kolaboratif dalam satu dashboard terintegrasi.
        </p>
      </div>

      {/* === BAGIAN 2: VIDEO TOUR === */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="relative rounded-3xl p-2 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-slate-700 dark:to-slate-900 shadow-2xl border border-slate-300 dark:border-slate-700">

          {/* Window Controls Decoration */}
          <div className="absolute top-6 left-6 flex gap-2 z-10">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
            <video
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              poster="/assets/images/video-thumbnail.jpg" 
              controls
            >
              <source
                src="/assets/videos/wesign-tour.mp4" 
                type="video/mp4"
              />
              Browser Anda tidak mendukung video.
            </video>

            {/* Play Button Overlay (Hiasan) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/50 shadow-lg">
                <FaPlay className="text-white ml-2 text-3xl opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === BAGIAN 3: INTEGRASI SISTEM === */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center gap-12">
            
            {/* Kiri: Diagram Placeholder */}
            <div className="w-full lg:w-1/2">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 aspect-[4/3] flex items-center justify-center relative overflow-hidden group">
                    <div className="text-center p-6">
                         <p className="text-slate-400 text-sm mb-2"><b>[Diagram Integrasi Sistem]</b></p>
                         <p className="text-xs text-slate-500">Folder: assets/images/diagram-integrasi.png</p>
                    </div>
                    {/* <img src="/assets/images/diagram-integrasi.png" className="absolute inset-0 w-full h-full object-contain" alt="Diagram Integrasi" /> */}
                </div>
            </div>

            {/* Kanan: Penjelasan */}
            <div className="w-full lg:w-1/2">
                <span className="text-blue-600 font-bold tracking-wider text-sm uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">Integrasi Sistem</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
                    Alur Integrasi Client-Server
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Kami menghadirkan sinergi inovatif antara antarmuka pengguna yang responsif dengan ketangguhan backend server. 
                    Setiap tanda tangan disinkronisasi secara <i>real-time</i> melalui WebSocket.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Frontend: React.js</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Backend: Node.js Express</span>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* === BAGIAN 4: SECURITY LOGIC === */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
         <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Kanan: Diagram Placeholder */}
            <div className="w-full lg:w-1/2">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 aspect-square flex items-center justify-center relative">
                     <div className="text-center">
                        <p className="text-slate-400 text-sm"><b>[Diagram Security Flow]</b></p>
                     </div>
                     {/* <img src="/assets/images/diagram-security.png" className="absolute inset-0 w-full h-full object-contain" alt="Security Flow" /> */}
                </div>
            </div>

            {/* Kiri: Penjelasan */}
            <div className="w-full lg:w-1/2">
                <span className="text-pink-600 font-bold tracking-wider text-sm uppercase bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-lg">Security Logic</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
                    Keamanan & Validasi
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Menggunakan algoritma <b>SHA-256</b> untuk menjamin integritas dokumen. Validasi berjalan di backend untuk memastikan keaslian *pixel* dokumen.
                </p>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>Enkripsi End-to-End</li>
                    <li>Digital Audit Trail (Log Aktifitas)</li>
                    <li>Verifikasi QR Code Dinamis</li>
                </ul>
            </div>
         </div>
      </section>

      {/* === BAGIAN 5: PUSTAKA DOKUMEN === */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div>
            <span className="text-green-600 font-bold text-sm uppercase bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
              Transparansi Data
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
              Pustaka Dokumen
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Dokumentasi API, desain sistem, dan metodologi pengembangan WeSign.
            </p>

            <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <FaBook /> Quick Stats
              </h4>
              <ul className="text-sm mt-2 space-y-2 text-slate-600 dark:text-slate-400">
                <li>• 50+ API Endpoints</li>
                <li>• PostgreSQL Schema</li>
                <li>• WebSocket Events</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 text-xs font-bold uppercase flex text-slate-500 dark:text-slate-300">
              <span className="w-12">No</span>
              <span className="flex-1">Nama Dokumen</span>
              <span className="w-32">Status</span>
            </div>

            <DocumentRow
              number="01"
              title="WeSign Whitepaper"
              status="Tersedia"
              link="#"
            />
            <DocumentRow
              number="02"
              title="API Documentation"
              status="Tersedia"
              link="#"
            />
            <DocumentRow
              number="03"
              title="Legal Compliance"
              status="Tinjauan"
              link="#"
            />
            <DocumentRow
              number="04"
              title="System Architecture"
              status="Tersedia"
              link="#"
            />
          </div>

        </div>
      </section>
    </main>
  );
};

export default TourPage;