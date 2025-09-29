import React, { useEffect } from "react";
import interact from "interactjs";
import { FaPenNib, FaQrcode } from "react-icons/fa";

// 1. Terima props baru: includeQrCode dan setIncludeQrCode
const SignatureSidebar = ({
  savedSignatureUrl,
  onOpenSignatureModal,
  onSave,
  isLoading,
  includeQrCode,
  setIncludeQrCode,
}) => {
  // useEffect untuk drag-and-drop tidak perlu diubah
  useEffect(() => {
    if (!savedSignatureUrl) return;
    let clone = null;
    interact(".draggable-signature").draggable({
      inertia: true,
      autoScroll: true,
      listeners: {
        start(event) {
          const original = event.target;
          clone = original.cloneNode(true);
          clone.classList.add("dragging-clone", "draggable-signature");
          clone.style.width = `${original.offsetWidth}px`;
          clone.style.height = `${original.offsetHeight}px`;
          document.body.appendChild(clone);
          const originalRect = original.getBoundingClientRect();
          clone.style.left = `${originalRect.left}px`;
          clone.style.top = `${originalRect.top}px`;
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
          if (clone) clone.remove();
          event.target.style.opacity = "1";
          event.target.style.transform = "translate(0px, 0px)";
          event.target.removeAttribute("data-x");
          event.target.removeAttribute("data-y");
        },
      },
    });
    return () => interact(".draggable-signature").unset();
  }, [savedSignatureUrl]);

  return (
    <aside
      className="w-96 h-full bg-slate-50 dark:bg-slate-900/70 backdrop-blur-sm
                 flex flex-col flex-shrink-0 border-l border-slate-200/80
                 dark:border-slate-700/50 shadow-2xl"
    >
      {/* Bagian Header Sidebar */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Tanda Tangan Anda
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Buat atau gunakan tanda tangan yang sudah ada.
        </p>
      </div>

      {/* Konten Utama */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Kartu Tanda Tangan */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
            Metode Gambar Langsung
          </p>
          {savedSignatureUrl ? (
            <div className="group relative">
              <div className="draggable-signature p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex justify-center items-center cursor-grab touch-none ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                <img
                  src={savedSignatureUrl}
                  alt="Tanda Tangan"
                  className="h-12 object-contain pointer-events-none"
                />
              </div>
              <button
                onClick={onOpenSignatureModal}
                className="absolute top-2 right-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-1 px-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Ubah
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSignatureModal}
              className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-blue-500 transition-colors duration-300"
            >
              <FaPenNib size={20} className="mb-2 text-slate-400" />
              <span className="text-sm font-semibold">Buat Tanda Tangan</span>
            </button>
          )}
        </div>

        {/* Persiapan Fitur QR Lain */}
        <div className="relative text-center">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 dark:bg-slate-900/70 text-slate-500">
              atau
            </span>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 font-semibold p-3 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors opacity-60 cursor-not-allowed">
          <FaQrcode />
          <span>Tanda Tangan dengan QR</span>
        </button>
      </div>

      {/* Bagian Aksi Final (Footer) */}
      <div className="p-6 border-t border-slate-200/80 dark:border-slate-700/50 mt-auto">
        {/* 2. Tambahkan UI untuk Toggle Switch di sini */}
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="qr-toggle"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Sertakan QR Code Verifikasi
          </label>
          <button
            id="qr-toggle"
            role="switch"
            aria-checked={includeQrCode}
            onClick={() => setIncludeQrCode(!includeQrCode)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900
              ${
                includeQrCode
                  ? "bg-blue-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200
                ${includeQrCode ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Tombol Aksi Utama */}
        <button
          onClick={onSave}
          disabled={isLoading || !savedSignatureUrl}
          className="w-full flex justify-center items-center text-white font-bold py-3 px-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-all transform hover:scale-[1.02] duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            "Terapkan Tanda Tangan"
          )}
        </button>
      </div>
    </aside>
  );
};

export default SignatureSidebar;