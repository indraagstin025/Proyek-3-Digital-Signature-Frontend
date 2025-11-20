// file: src/components/SignatureSidebar/SignatureSidebar.jsx

import React, { useEffect } from "react";
import interact from "interactjs";
import { FaPenNib, FaQrcode, FaTimes } from "react-icons/fa";

const SignatureSidebar = ({ savedSignatureUrl, onOpenSignatureModal, onSave, isLoading, includeQrCode, setIncludeQrCode, isOpen, onClose }) => {
  useEffect(() => {
    if (!savedSignatureUrl) return;

    let clone = null;

    interact(".draggable-signature").draggable({
      inertia: true,
      autoScroll: true,
      listeners: {
        start(event) {
          document.body.classList.add("dragging-active");

          const original = event.target;
          clone = original.cloneNode(true);
          clone.classList.add("dragging-clone", "draggable-signature");
          clone.style.position = "absolute";
          clone.style.zIndex = "1000";
          
          // Clone akan mengambil ukuran persis dari elemen sidebar yang sekarang sudah KOTAK
          clone.style.width = `${original.offsetWidth}px`;
          clone.style.height = `${original.offsetHeight}px`;
          
          document.body.appendChild(clone);

          const originalRect = original.getBoundingClientRect();
          clone.style.left = `${originalRect.left}px`;
          clone.style.top = `${originalRect.top}px`;

          clone.setAttribute("data-x", 0);
          clone.setAttribute("data-y", 0);

          original.style.opacity = "0.4";
        },
        move(event) {
          if (!clone) return;
          const x = (parseFloat(clone.getAttribute("data-x")) || 0) + event.dx;
          const y = (parseFloat(clone.getAttribute("data-y")) || 0) + event.dy;
          clone.style.transform = `translate(${x}px, ${y}px)`;
          clone.setAttribute("data-x", x);
          clone.setAttribute("data-y", y);
        },
        end(event) {
          document.body.classList.remove("dragging-active");
          if (clone) clone.remove();
          event.target.style.opacity = "1";
        },
      },
    });

    return () => interact(".draggable-signature").unset();
  }, [savedSignatureUrl]);

  return (
    <aside
      className={`
        w-full max-w-xs lg:w-80 lg:max-w-md
        bg-slate-50 dark:bg-slate-900/70 backdrop-blur-sm
        flex flex-col flex-shrink-0 border-l border-slate-200/80
        dark:border-slate-700/50 shadow-2xl
        fixed top-16 right-0 z-40
        h-[calc(100vh-4rem)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:relative lg:h-full lg:translate-x-0 lg:top-0
        landscape:lg:relative landscape:lg:h-full 
        landscape:lg:translate-x-0 landscape:lg:top-0
        portrait:fixed portrait:top-16 portrait:right-0
        portrait:h-[calc(100vh-4rem)]
      `}
    >
      {/* Header */}
      <div className="py-6 px-6 border-b border-slate-200/80 dark:border-slate-700/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tanda Tangan Anda</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gunakan atau buat tanda tangan.</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white portrait:inline-flex landscape:hidden"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
            Metode Gambar Langsung
          </p>
          
          {savedSignatureUrl ? (
            <div className="group relative flex justify-center">
              {/* PERUBAHAN UTAMA DI SINI:
                 1. w-32 aspect-square: Memaksa container menjadi KOTAK (128x128px).
                 2. mx-auto: Supaya posisi di tengah.
                 3. padding dikurangi sedikit agar gambar lebih maksimal.
              */}
              <div className="draggable-signature w-32 aspect-square p-2 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 flex justify-center items-center cursor-grab touch-none shadow-sm hover:shadow-md hover:border-blue-400 transition-all">
                <img
                  src={savedSignatureUrl}
                  alt="Tanda Tangan"
                  // Gambar dipaksa fit di dalam kotak
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>
              
              <button
                onClick={onOpenSignatureModal}
                className="absolute -top-2 -right-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105"
              >
                Ubah
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSignatureModal}
              className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-blue-500 hover:text-blue-500 transition-all duration-300 group"
            >
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 mb-3 transition-colors">
                 <FaPenNib size={20} />
              </div>
              <span className="text-sm font-semibold">Buat Tanda Tangan</span>
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 dark:bg-slate-900/70 text-slate-500">atau</span>
          </div>
        </div>

        {/* Placeholder QR */}
        <button
          className="w-full flex items-center justify-center gap-3 text-slate-400 font-semibold p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-not-allowed"
        >
          <FaQrcode />
          <span>Tanda Tangan dengan QR</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200/80 dark:border-slate-700/50 mt-auto bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="qr-toggle"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            Sertakan QR Verifikasi
          </label>
          <button
            id="qr-toggle"
            role="switch"
            aria-checked={includeQrCode}
            onClick={() => setIncludeQrCode(!includeQrCode)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900
              ${includeQrCode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow-sm
                ${includeQrCode ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        <button
          onClick={onSave}
          disabled={isLoading || !savedSignatureUrl}
          className="w-full flex justify-center items-center text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            "Terapkan ke Dokumen"
          )}
        </button>
      </div>
    </aside>
  );
};

export default SignatureSidebar;