// file: src/components/SignatureSidebar/SignatureSidebar.jsx

import React, { useEffect } from "react";
import interact from "interactjs";
import { FaPenNib, FaQrcode, FaTimes, FaMagic, FaRobot } from "react-icons/fa";

const SignatureSidebar = ({ 
  savedSignatureUrl, 
  onOpenSignatureModal, 
  onSave, 
  isLoading, 
  includeQrCode, 
  setIncludeQrCode, 
  isOpen, 
  onClose,
  onAutoTag,
  onAnalyze
}) => {
  
// src/components/SignatureSidebar/SignatureSidebar.jsx

  // ... (kode atas tetap sama)

  // --- LOGIKA DRAG & DROP DARI SIDEBAR ---
  useEffect(() => {
    if (!savedSignatureUrl) return;

    let clone = null;
    let startPos = { x: 0, y: 0 };

    interact(".draggable-signature").draggable({
      inertia: true,
      autoScroll: false, 
      listeners: {
        start(event) {
          const original = event.target;
          const rect = original.getBoundingClientRect();
          startPos = { x: event.clientX, y: event.clientY };

          // [HAPUS BAGIAN INI DARI START]
          // if (window.innerWidth < 1024) onClose(); <--- HAPUS INI
          // Alasan: Kalau ditutup di sini, elemen induknya "kabur", drag jadi putus.

          clone = original.cloneNode(true);
          
          // Optimasi performa & visual clone
          clone.style.position = "fixed"; 
          clone.style.left = `${rect.left}px`;
          clone.style.top = `${rect.top}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.zIndex = "9999"; 
          clone.style.opacity = "0.8";
          clone.style.pointerEvents = "none"; // PENTING: Agar event tembus ke dropzone di bawahnya
          clone.style.touchAction = "none";   // PENTING: Mencegah scroll layar saat drag

          clone.classList.add("dragging-clone");
          document.body.appendChild(clone);

          original.style.opacity = "0.4";
        },
        move(event) {
          if (!clone) return;
          const dx = event.clientX - startPos.x;
          const dy = event.clientY - startPos.y;
          clone.style.transform = `translate(${dx}px, ${dy}px)`;
        },
        end(event) {
          // 1. Hapus Clone
          if (clone) {
             clone.remove();
             clone = null;
          }
          event.target.style.opacity = "1";

          // 2. [PINDAHKAN KE SINI] Auto-Close Sidebar (Khusus Mobile)
          // Sidebar baru menutup SETELAH user selesai menaruh tanda tangan.
          // Ini mencegah drag terputus di tengah jalan.
          if (window.innerWidth < 1024) { 
             onClose();
          }
        },
      },
    });

    return () => interact(".draggable-signature").unset();
  }, [savedSignatureUrl, onClose]);

  // ... (sisa kode return tetap sama)

  return (
    <aside
      // PERBAIKAN 1: Gunakan 'h-[calc(100dvh-4rem)]'
      // 100dvh (Dynamic Viewport Height) adalah satuan paling akurat untuk browser HP modern
      // Ia otomatis menyesuaikan diri saat address bar browser muncul/hilang.
      className={`
        w-full max-w-xs lg:w-80 lg:max-w-md
        bg-slate-50 dark:bg-slate-900/70 backdrop-blur-sm
        flex flex-col flex-shrink-0 border-l border-slate-200/80
        dark:border-slate-700/50 shadow-2xl
        
        fixed 
        top-16 
        right-0 
        z-40
        
        /* Tinggi dinamis dikurangi tinggi header (4rem) */
        h-[calc(100dvh-4rem)]
        
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        
        /* Reset untuk Desktop */
        lg:relative lg:h-full lg:translate-x-0 lg:top-0
        landscape:lg:relative landscape:lg:h-full landscape:lg:translate-x-0 landscape:lg:top-0
        
        portrait:fixed portrait:top-16 portrait:right-0 portrait:h-[calc(100dvh-4rem)]
      `}
    >
      {/* Header */}
      <div className="py-6 px-6 border-b border-slate-200/80 dark:border-slate-700/50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tanda Tangan</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Panel kontrol dokumen.</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white portrait:inline-flex landscape:hidden"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0 custom-scrollbar">
        
        {/* ... Bagian Tanda Tangan, Auto Tag, dll (SAMA SEPERTI SEBELUMNYA) ... */}
        {/* --- 1. BAGIAN TANDA TANGAN --- */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
            Drag & Drop ke Dokumen
          </p>
          
          {savedSignatureUrl ? (
            <div className="group relative flex justify-center">
              <div className="draggable-signature w-32 aspect-square p-2 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 flex justify-center items-center cursor-grab touch-none shadow-sm hover:shadow-md hover:border-blue-400 transition-all active:cursor-grabbing">
                <img src={savedSignatureUrl} alt="Tanda Tangan" className="w-full h-full object-contain pointer-events-none select-none" />
              </div>
              <button onClick={onOpenSignatureModal} className="absolute -top-2 -right-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105">Ubah</button>
            </div>
          ) : (
            <button onClick={onOpenSignatureModal} className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-blue-500 hover:text-blue-500 transition-all duration-300 group">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 mb-3 transition-colors"><FaPenNib size={20} /></div>
              <span className="text-sm font-semibold">Buat Tanda Tangan</span>
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="relative text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300 dark:border-slate-700" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-50 dark:bg-slate-900/70 text-slate-500 font-medium">Asisten Cerdas</span></div>
        </div>
        
        {/* AI Buttons Placeholders (SAMA) */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-slate-700">
           <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg dark:bg-slate-700 dark:text-purple-400"><FaMagic size={14} /></div><p className="text-sm font-bold text-slate-700 dark:text-white">Auto Placement</p></div>
           <button onClick={onAutoTag} disabled={isLoading} className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow hover:border-purple-300 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
             {isLoading ? <span className="animate-pulse">Memproses...</span> : <span>Otomatis Pasang TTD</span>}
           </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700">
           <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-slate-700 dark:text-indigo-400"><FaRobot size={14} /></div><p className="text-sm font-bold text-slate-700 dark:text-white">Legal Assistant</p></div>
           <button onClick={onAnalyze} disabled={isLoading} className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow hover:border-indigo-300 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
             {isLoading ? <span className="animate-pulse">Menganalisis...</span> : <span>Cek Risiko Dokumen</span>}
           </button>
        </div>
        
        <button className="w-full flex items-center justify-center gap-3 text-slate-400 text-sm font-semibold p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-not-allowed opacity-70"><FaQrcode /><span>QR Verification (Coming Soon)</span></button>
      </div>

      {/* Footer */}
      {/* PERBAIKAN 2: Padding Super Besar di Bawah (pb-24) 
         Saya menambahkan 'pb-24' (6rem/96px) khusus untuk mobile.
         Ini akan memaksa tombol naik jauh ke atas, menjauhi area "gesture bar" HP.
         Di desktop (lg:), kita kembalikan ke normal (lg:pb-6).
      */}
      <div className="p-6 border-t border-slate-200/80 dark:border-slate-700/50 mt-auto bg-slate-50/50 dark:bg-slate-800/30 shrink-0 z-20 pb-24 lg:pb-6">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="qr-toggle" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Sertakan QR Code
          </label>
          <button
            id="qr-toggle"
            role="switch"
            aria-checked={includeQrCode}
            onClick={() => setIncludeQrCode(!includeQrCode)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 ${includeQrCode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow-sm ${includeQrCode ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <button
          onClick={onSave}
          disabled={isLoading || !savedSignatureUrl}
          className="w-full flex justify-center items-center text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Memproses...
            </>
          ) : (
            "Simpan Dokumen"
          )}
        </button>
      </div>
    </aside>
  );
};

export default SignatureSidebar;