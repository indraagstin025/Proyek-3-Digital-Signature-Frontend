import React from 'react';
import { createPortal } from 'react-dom'; // 1. Import createPortal

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  confirmButtonColor = "bg-red-600 hover:bg-red-700"
}) => {
  if (!isOpen) return null;

  // 2. Definisikan konten modal dalam variabel (agar lebih rapi seperti DocumentManagementModal)
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // Menutup modal saat mengklik backdrop
    >
      {/* Konten Modal */}
      <div 
        className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all scale-100"
        onClick={e => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
          {message}
        </p>
        
        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {cancelText}
          </button>
          
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-transform active:scale-95 ${confirmButtonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // 3. Render menggunakan createPortal ke document.body
  return createPortal(modalContent, document.body);
};

export default ConfirmationModal;