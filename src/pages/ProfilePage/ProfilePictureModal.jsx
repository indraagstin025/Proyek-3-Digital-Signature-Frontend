import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUpload, FaCheck, FaTrash, FaSpinner } from "react-icons/fa";

const ProfilePictureModal = ({ isOpen, onClose, profilePictures = [], onUploadNew, onUseOld, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUploadNew(selectedFile);
      setSelectedFile(null);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseOldPicture = async (pictureId) => {
    await onUseOld(pictureId);
    onClose();
  };

  const handleDelete = async (pictureId) => {
    setIsDeleting(pictureId);
    try {
      await onDelete(pictureId);
    } finally {
      setIsDeleting(null);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ubah Foto Profil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Upload baru */}
          <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-4 text-center">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="upload-input" />
            {preview ? (
              <div className="flex flex-col items-center space-y-4">
                <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-full shadow-md" />
                <div className="flex gap-2 w-full">
                  <button onClick={handleUpload} disabled={isUploading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                    {isUploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        Unggah
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="upload-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                <FaUpload className="text-3xl text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Klik untuk unggah foto baru</span>
              </label>
            )}
          </div>

          {/* Riwayat foto lama */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Gunakan Foto Sebelumnya</h3>

            {profilePictures.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Belum ada riwayat foto.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto custom-scrollbar">
                {profilePictures.map((pic) => (
                  <div key={pic.id} className="relative group border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <img src={pic.url} alt="Foto Profil Lama" className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button onClick={() => handleUseOldPicture(pic.id)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors" title="Gunakan Foto Ini">
                        <FaCheck />
                      </button>
                      <button onClick={() => handleDelete(pic.id)} disabled={isDeleting === pic.id} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-60" title="Hapus Foto Ini">
                        {isDeleting === pic.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Close Button */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-6">
          <button onClick={onClose} className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProfilePictureModal;
