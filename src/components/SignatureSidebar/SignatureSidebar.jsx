import React, { useEffect } from "react";
import interact from "interactjs";
import { FaPenNib, FaTimes, FaRobot, FaLock, FaEye, FaSpinner } from "react-icons/fa";

const SignatureSidebar = ({ 
  savedSignatureUrl, onOpenSignatureModal, onSave, isLoading, includeQrCode, setIncludeQrCode, 
  isOpen, onClose, onAnalyze, readOnly = false, isSignedSuccess = false, onViewResult = () => {},
  hasPlacedSignature = false // Default false
}) => {
  
  useEffect(() => {
    if (!savedSignatureUrl || readOnly || isSignedSuccess) return;
    let clone = null;
    let offset = { x: 0, y: 0 };

    interact(".draggable-signature").draggable({
      inertia: false, autoScroll: false,
      listeners: {
        start(event) {
          const original = event.target;
          const rect = original.getBoundingClientRect();
          offset.x = rect.width / 2;
          offset.y = rect.height / 2;
          clone = original.cloneNode(true);
          Object.assign(clone.style, {
            position: "fixed", left: "0px", top: "0px",
            width: `${rect.width}px`, height: `${rect.height}px`,
            zIndex: "99999", pointerEvents: "none", touchAction: "none",
            willChange: "transform", transition: "none", opacity: "0.9",
            boxShadow: "0 15px 30px rgba(0,0,0,0.3)"
          });
          const x = event.clientX - offset.x;
          const y = event.clientY - offset.y;
          clone.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.05)`;
          clone.classList.add("dragging-signature-clone");
          document.body.appendChild(clone);
          original.style.opacity = "0.5";
        },
        move(event) {
          if (!clone) return;
          const x = event.clientX - offset.x;
          const y = event.clientY - offset.y;
          clone.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.05)`;
        },
        end(event) {
          if (clone) { clone.remove(); clone = null; }
          event.target.style.opacity = "1";
          if (window.innerWidth < 1024) onClose();
        },
      },
    });
    return () => interact(".draggable-signature").unset();
  }, [savedSignatureUrl, onClose, readOnly, isSignedSuccess]);

  return (
    <aside className={`select-none w-full max-w-xs lg:w-80 lg:max-w-md bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col flex-shrink-0 border-l border-slate-200/80 dark:border-slate-700/50 shadow-2xl fixed top-16 right-0 z-40 h-[calc(100dvh-4rem)] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} lg:relative lg:h-full lg:translate-x-0 lg:top-0 landscape:lg:relative landscape:lg:h-full landscape:lg:translate-x-0 landscape:lg:top-0 portrait:fixed portrait:top-16 portrait:right-0 portrait:h-[calc(100dvh-4rem)]`}>
      
      {/* Header */}
      <div className="py-6 px-6 border-b border-slate-200/80 dark:border-slate-700/50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Panel Kontrol
            {isSignedSuccess ? <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 animate-pulse">Selesai</span> : (readOnly && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full border border-yellow-200">View Only</span>)}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{isSignedSuccess ? "Tanda tangan berhasil disimpan." : readOnly ? "Dokumen terkunci." : "Geser tanda tangan ke dokumen."}</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white portrait:inline-flex landscape:hidden"><FaTimes size={20} /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0 custom-scrollbar">
        <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 transition-opacity ${readOnly || isSignedSuccess ? "opacity-60 grayscale-[0.5]" : ""}`}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanda Tangan Anda</p>
            {(readOnly || isSignedSuccess) && <FaLock className="text-slate-400 w-3 h-3" />}
          </div>
          {savedSignatureUrl ? (
            <div className="group relative flex justify-center">
              <div className={`draggable-signature w-32 aspect-square p-2 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 flex justify-center items-center shadow-sm transition-all ${readOnly || isSignedSuccess ? "cursor-not-allowed border-dashed" : "cursor-grab hover:shadow-md hover:border-blue-400 active:cursor-grabbing"}`}>
                <img src={savedSignatureUrl} alt="Tanda Tangan" className="w-full h-full object-contain pointer-events-none select-none" />
              </div>
              {!readOnly && !isSignedSuccess && <button onClick={onOpenSignatureModal} className="absolute -top-2 -right-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105">Ubah</button>}
            </div>
          ) : (
            <button onClick={() => !readOnly && !isSignedSuccess && onOpenSignatureModal()} disabled={readOnly || isSignedSuccess} className={`w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 transition-all duration-300 group ${readOnly || isSignedSuccess ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-blue-500 hover:text-blue-500"}`}>
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 mb-3 transition-colors"><FaPenNib size={20} /></div>
              <span className="text-sm font-semibold">Buat Tanda Tangan</span>
            </button>
          )}
        </div>
        <div className="relative text-center"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300 dark:border-slate-700" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-50 dark:bg-slate-900/70 text-slate-500 font-medium">Asisten Cerdas</span></div></div>
        <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700 ${readOnly ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-slate-700 dark:text-indigo-400"><FaRobot size={14} /></div><p className="text-sm font-bold text-slate-700 dark:text-white">Legal Assistant</p></div>
          <button onClick={onAnalyze} disabled={isLoading} className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow hover:border-indigo-300 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? <span className="animate-pulse">Menganalisis...</span> : <span>Cek Risiko Dokumen</span>}</button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200/80 dark:border-slate-700/50 mt-auto bg-slate-50/50 dark:bg-slate-800/30 shrink-0 z-20 pb-24 lg:pb-6">
        {!isSignedSuccess && (
          <div className={`flex items-center justify-between mb-4 ${readOnly ? "opacity-50 pointer-events-none" : ""}`}>
            <label htmlFor="qr-toggle" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">Sertakan QR Code</label>
            <button id="qr-toggle" onClick={() => setIncludeQrCode(!includeQrCode)} disabled={readOnly} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none ${includeQrCode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow-sm ${includeQrCode ? "translate-x-6" : "translate-x-1"}`} /></button>
          </div>
        )}
        <button
          onClick={isSignedSuccess ? onViewResult : onSave}
          // [PERBAIKAN LOGIC BUTTON]
          // Jika Loading -> Disabled
          // Jika ReadOnly & Belum Sukses -> Disabled
          // Jika TIDAK ADA draft di canvas & Belum Sukses -> Disabled
          // KITA TIDAK LAGI STRICTLY CEK `!savedSignatureUrl` JIKA `hasPlacedSignature` SUDAH TRUE
          disabled={
            isLoading || 
            (readOnly && !isSignedSuccess) ||
            (!hasPlacedSignature && !isSignedSuccess)
          }
          className={`w-full flex justify-center items-center text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none ${isSignedSuccess ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-500/30" : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30"}`}
        >
          {isLoading ? <><FaSpinner className="animate-spin mr-3"/> Memproses...</> : isSignedSuccess ? <><FaEye className="mr-2" /> Lihat Hasil Tanda Tangan</> : readOnly ? "Mode Lihat Saja" : "Simpan Dokumen"}
        </button>
      </div>
    </aside>
  );
};

export default SignatureSidebar;