/* eslint-disable no-irregular-whitespace */
import React, { useState, useRef, useEffect } from "react";
// Menggunakan ikon yang relevan untuk tampilan File Manager
import { FaTrash, FaCheck, FaTimes, FaCloudUploadAlt, FaImage } from "react-icons/fa";

const ProfilePictureModal = ({ isOpen, onClose, profilePictures, onUploadNew, onUseOld, onDelete }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // =======================================================
  // 🔍 DEBUGGING LOG: Mencegah looping (Hanya bergantung pada isOpen)
  // =======================================================
  useEffect(() => {
    if (isOpen) {
      console.log("==========================================");
      console.log("🔍 DEBUG: Profile Picture Modal Data Load");
      console.log("Modal Status:", isOpen ? "OPEN" : "CLOSED");
      console.log("Total Riwayat Foto Diterima:", profilePictures.length);
      
      if (profilePictures.length > 0) {
        const logPictures = profilePictures.slice(0, 3); 
        console.log("Detail Riwayat Foto (3 foto pertama):");
        logPictures.forEach((pic, index) => {
          // Log URL yang dipotong agar tidak terlalu panjang
          console.log(`  [${index + 1}] ID: ${pic.id}, URL: ${pic.url.substring(0, 50)}...`); 
        });
      } else {
        console.log("Riwayat Foto Kosong.");
      }
      console.log("==========================================");
    }
  }, [isOpen]); // 🎯 PERBAIKAN: Hanya bergantung pada [isOpen]

  if (!isOpen) return null;

  // Helper untuk menampilkan ukuran file dalam format yang mudah dibaca
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      console.log("✅ File Baru Dipilih:", selected.name, ", Ukuran:", formatFileSize(selected.size));
    }
  };

  const handleUpload = () => {
    if (file) {
      console.log("⬆️ Mengunggah file:", file.name);
      onUploadNew(file);
      
      setFile(null); 
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancelUpload = () => {
    setFile(null); 
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
    console.log("❌ Upload Dibatalkan.");
  };

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
      console.log("✅ File Ditarik & Dilepas:", selected.name, ", Ukuran:", formatFileSize(selected.size));
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };
  
  const handleUseOld = (id) => {
    console.log("🔄 Menggunakan Foto Lama dengan ID:", id);
    onUseOld(id);
  }

  const handleDelete = (id) => {
    console.log("🗑️ Menghapus Foto dengan ID:", id);
    onDelete(id);
  }

  // =======================================================
  // 🖼️ RENDER UI MODAL
  // =======================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity" onClick={onClose}>
      {/* Panel Modal - Klik di dalam dihentikan agar tidak menutup modal */}
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Kelola Foto Profil</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                <FaTimes size={20} />
            </button>
        </div>

        {/* Konten Utama (Layout Dua Kolom) */}
        <div className="flex flex-col md:flex-row">
            
            {/* Kolom Kiri: Area Upload Baru */}
            <div className="md:w-1/2 p-6 md:border-r border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
                    <FaCloudUploadAlt className="mr-2" /> Unggah Foto Baru
                </h3>

                {/* Drop Zone Interaktif */}
                <div
                    onClick={openFilePicker}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-10 min-h-[150px] border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                        isDragging 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg" 
                        : "border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    }`}
                >
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    
                    {!file ? (
                        <>
                            <FaImage className="text-4xl text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                <span className="text-blue-600 dark:text-blue-400 hover:underline">Pilih file</span> atau seret dan lepas di sini
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hanya file Gambar (PNG, JPG, GIF). Maks 10MB.</p>
                        </>
                    ) : (
                        <div className="text-center w-full">
                            <FaCheck className="text-3xl text-green-500 mx-auto mb-2" />
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)} - Siap Diunggah</p>
                            <div className="flex justify-center space-x-3 mt-4">
                                <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                    <FaCloudUploadAlt className="inline mr-1" /> Unggah Sekarang
                                </button>
                                <button onClick={handleCancelUpload} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors">
                                    <FaTimes className="inline mr-1" /> Batal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Kolom Kanan: Riwayat Foto (File List) */}
            <div className="md:w-1/2 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <FaImage className="mr-2" /> Riwayat Foto Anda
                </h3>
                
                {profilePictures.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2">
                        {profilePictures.map((pic) => (
                            <div key={pic.id} className="relative group aspect-square rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                                <img 
                                    src={pic.url} 
                                    alt="history" 
                                    className="w-full h-full object-cover" 
                                    onError={() => console.error(`⚠️ ERROR memuat gambar dengan ID: ${pic.id} dari URL: ${pic.url}`)}
                                /> 
                                {/* Overlay Interaksi */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 transition-opacity duration-300">
                                    <p className="text-xs text-white mb-2 font-medium">Opsi</p>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleUseOld(pic.id)} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow-md transform hover:scale-110 transition-transform" title="Gunakan">
                                            <FaCheck size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(pic.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md transform hover:scale-110 transition-transform" title="Hapus">
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                        <FaImage className="text-3xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Anda belum memiliki riwayat foto.</p>
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
};

// 🎯 PENAMBAHAN WAJIB: Menggunakan React.memo untuk mencegah re-render yang tidak perlu
export default React.memo(ProfilePictureModal);