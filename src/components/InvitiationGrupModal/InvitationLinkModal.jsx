import React, { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa"; // (Anda perlu: npm install react-icons)

export const InvitationLinkModal = ({ isOpen, onClose, link }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen || !link) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link undangan disalin ke clipboard!");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000); // Reset status
  };

  // Teks untuk dibagikan
  const shareText = `Anda telah diundang untuk bergabung dengan grup saya. Klik link ini: ${link}`;

  // Encode untuk URL
  const encodedShareText = encodeURIComponent(shareText);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700 animate-fadeIn">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Link Undangan Dibuat!</h3>
        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Bagikan link ini kepada siapa saja yang ingin Anda undang ke grup. Link ini akan kedaluwarsa dalam 7 hari.</p>

        {/* Input Link (Read-only) */}
        <div className="flex items-center mb-4">
          <input type="text" value={link} readOnly className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-gray-700 rounded-l-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none" />
          <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
            <HiOutlineClipboardCopy className="w-5 h-5" />
          </button>
        </div>
        {copySuccess && <p className="text-green-500 text-sm mb-4">Berhasil disalin!</p>}

        {/* Tombol Share (Saran Anda) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://api.whatsapp.com/send?text=${encodedShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaWhatsapp className="w-5 h-5" /> Bagikan ke WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${link}&text=${encodedShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
          >
            <FaTelegram className="w-5 h-5" /> Bagikan ke Telegram
          </a>
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors">
          Tutup
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
