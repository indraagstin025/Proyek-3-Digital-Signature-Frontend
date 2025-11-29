import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  confirmButtonColor = "bg-red-600 hover:bg-red-700" // Default ke merah untuk aksi destruktif
}) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose} // Menutup modal saat mengklik di luar area
    >
      {/* Konten Modal */}
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-white/10"
        onClick={e => e.stopPropagation()} // Mencegah klik di dalam modal ikut menutup
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        
        {/* Tombol Aksi */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${confirmButtonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
