import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { ImSpinner9 } from "react-icons/im"; 
import IntegrationSystem from "../../assets/images/IntegrationSystem.png";
import UserExperience from "../../assets/images/UserExperience.png"; 
import WeSignVideos from "../../assets/videos/WeSign_Tanda_Tangan_Digital_Cerdas.mp4";

import {
  FaPlay,
  FaNetworkWired,
  FaBook,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaSearchPlus,
  FaTimes,
  FaLock,
  FaUsers,
  FaHistory,
  FaUndo // ✅ Icon baru untuk Rollback
} from 'react-icons/fa';

/* =========================
   Komponen Modal Preview (Portal)
========================= */
const ImagePreviewModal = ({ imageSrc, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !imageSrc) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
      onClick={onClose} 
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50"
      >
        <FaTimes size={24} />
      </button>

      <img 
        src={imageSrc} 
        alt="Preview Full" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); 
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => setSelectedImage(null);

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

  return (
    <main className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen pt-24 pb-24 relative">
      
      {/* Portal Modal Gambar */}
      <ImagePreviewModal 
        imageSrc={selectedImage} 
        onClose={closeModal} 
      />

      {/* === BAGIAN 1: HEADER (DENGAN 4 POIN) === */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-6 hover:scale-105 transition-transform cursor-default">
          <FaNetworkWired /> System Overview
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
          Jelajahi Ekosistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">WeSign</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
          Platform tanda tangan digital yang menggabungkan keamanan kriptografi mandiri dengan kolaborasi tim yang intuitif. 
          Simak bagaimana data Anda diproses dari enkripsi hingga verifikasi.
        </p>

        {/* 4 Value Points (GRID UPDATED) */}
        {/* Menggunakan lg:grid-cols-4 agar muat 4 kartu sejajar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
          
          {/* Poin 1: Kriptografi */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <FaLock className="text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Integritas Dokumen</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Menggunakan standar kriptografi PKI (<i>Self-Signed</i>) untuk menjamin dokumen anti-palsu dan aman.
            </p>
          </div>

          {/* Poin 2: Kolaborasi */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
              <FaUsers className="text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Kolaborasi Real-time</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mendukung tanda tangan multi-pihak dengan sinkronisasi status instan via WebSocket.
            </p>
          </div>

          {/* Poin 3: Audit Trail */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 mb-4">
              <FaHistory className="text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Jejak Audit Digital</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rekam jejak aktivitas lengkap (Log) yang transparan untuk verifikasi proses.
            </p>
          </div>

          {/* ✅ Poin 4: Document Versioning (BARU) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 mb-4">
              <FaUndo className="text-xl" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Versioning & Rollback</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Kesalahan saat tanda tangan? Kembalikan dokumen ke versi asli (V1) secara instan untuk proses ulang.
            </p>
          </div>

        </div>

        {/* Arrow Pointer */}
        <div className="mt-12 animate-bounce text-slate-400 dark:text-slate-500 text-sm font-medium">
            👇 Tonton Tur Singkat (2 Menit)
        </div>

      </div>

      {/* === BAGIAN 2: VIDEO TOUR === */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <div className="relative rounded-3xl p-2 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-slate-700 dark:to-slate-900 shadow-2xl border border-slate-300 dark:border-slate-700">
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
              <source src={WeSignVideos} />
              Browser Anda tidak mendukung video.
            </video>
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
            
            {/* Kiri: Diagram Image */}
            <div className="w-full lg:w-1/2 flex justify-center">
                <div 
                  className="relative group cursor-pointer max-w-md w-full"
                  onClick={() => setSelectedImage(IntegrationSystem)} 
                >
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-2 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-lg">
                        <img 
                          src={IntegrationSystem} 
                          className="w-full h-64 object-contain rounded-lg" 
                          alt="Diagram Integrasi Sistem" 
                        />
                    </div>
                    
                    <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FaSearchPlus className="text-white text-3xl mb-2" />
                        <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">
                          Klik untuk melihat Preview
                        </span>
                    </div>
                </div>
            </div>

            {/* Kanan: Penjelasan */}
            <div className="w-full lg:w-1/2">
                <span className="text-blue-600 font-bold tracking-wider text-sm uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                  Integrasi Sistem
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
                    Alur Integrasi WeSign Ecosystem
                </h2>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Kami menghadirkan sinergi inovatif antara manajemen dokumen digital yang efisien dengan standar keamanan tingkat tinggi. 
                    Alur integrasi ini dirancang secara sistematis untuk memastikan setiap dokumen yang diunggah terverifikasi, tersimpan aman, dan memiliki validitas hukum yang kuat melalui sertifikat digital terpusat.
                </p>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Sinkronisasi Dokumen Real-time
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Validasi Keamanan Berlapis
                        </span>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* === BAGIAN 4: USER EXPERIENCE === */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row-reverse items-center gap-12">
            
            {/* Kanan: Diagram Image */}
            <div className="w-full lg:w-1/2 flex justify-center">
                <div 
                  className="relative group cursor-pointer max-w-md w-full"
                  onClick={() => setSelectedImage(UserExperience)} 
                >
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-2 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-lg">
                         <img 
                           src={UserExperience} 
                           className="w-full h-64 object-contain rounded-lg" 
                           alt="User Experience Flow" 
                         />
                    </div>

                    <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FaSearchPlus className="text-white text-3xl mb-2" />
                        <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">
                          Klik untuk melihat Preview
                        </span>
                    </div>
                </div>
            </div>

            {/* Kiri: Penjelasan */}
            <div className="w-full lg:w-1/2">
                <span className="text-indigo-600 font-bold tracking-wider text-sm uppercase bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">
                  User Experience
                </span>
                
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">
                    Harmonisasi Alur Pengguna
                </h2>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Bukan sekadar antarmuka tanda tangan biasa. Didukung oleh <b>AI Analysis Engine</b>, WeSign secara cerdas mendeteksi konteks dan risiko dokumen sebelum Anda menandatangani. 
                    <i>Decision Support UI</i> kami beradaptasi secara dinamis—baik untuk tanda tangan personal maupun kolaborasi grup—memastikan pengalaman yang lancar, aman, dan tanpa hambatan teknis.
                </p>
                
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    <li>Analisis Risiko Dokumen Cerdas</li>
                    <li>Kolaborasi Multi-Pihak yang Adaptif</li>
                    <li>Verifikasi Publik Terintegrasi</li>
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
            <DocumentRow number="01" title="WeSign Whitepaper" status="Tersedia" link="#" />
            <DocumentRow number="02" title="API Documentation" status="Tersedia" link="#" />
            <DocumentRow number="03" title="Legal Compliance" status="Tinjauan" link="#" />
            <DocumentRow number="04" title="System Architecture" status="Tersedia" link="#" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default TourPage;