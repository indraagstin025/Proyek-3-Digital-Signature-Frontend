// src/components/ProfilePictureModal.jsx
import React, { useState, useRef } from "react";
import { FaTrash, FaCheck, FaTimes, FaUpload } from "react-icons/fa"; // ✨ Tambahkan FaTimes dan FaUpload

const ProfilePictureModal = ({
  isOpen,
  onClose,
  profilePictures,
  onUploadNew,
  onUseOld,
  onDelete,
}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUploadNew(file);
      setFile(null);
    }
  };
  
  // ✨ Fungsi untuk drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files[0];
    if (selected) {
        setFile(selected);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity">
      {/* Panel Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl transform transition-all">
        {/* ✨ Tombol Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Ganti Foto Profil
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Unggah foto baru atau pilih dari riwayat Anda.
            </p>
          </div>

          {/* ✨ Area Upload Drag-and-Drop Baru */}
          <div className="space-y-4 mb-8">
            <div
              onClick={openFilePicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <FaUpload className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Klik untuk memilih</span> atau seret file ke sini
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
            {file && (
              <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-4">
                  File: {file.name}
                </p>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            )}
          </div>

          {/* ✨ Area Riwayat Foto yang Diperbarui */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Riwayat Foto
            </h3>
            {profilePictures.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 max-h-40 overflow-y-auto pr-2">
                {profilePictures.map((pic) => (
                  <div key={pic.id} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={pic.url}
                      alt="history"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition-opacity">
                      <button
                        onClick={() => onUseOld(pic.id)}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow transform hover:scale-110 transition-transform"
                        title="Gunakan foto ini"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => onDelete(pic.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow transform hover:scale-110 transition-transform"
                        title="Hapus foto"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                   Belum ada riwayat foto.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;