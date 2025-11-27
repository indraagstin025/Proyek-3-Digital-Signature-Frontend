import { FaUser, FaSpinner, FaSave } from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { userService } from "../../services/userService";
import ProfilePictureModal from "./ProfilePictureModal";
import toast from "react-hot-toast";

const InputField = ({ id, name, label, type = "text", value, onChange, ...props }) => {
  const commonProps = {
    id,
    name,
    type,
    value,
    onChange,
    ...props,
    className:
      "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200",
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {type === "textarea" ? <textarea {...commonProps} rows={4}></textarea> : <input {...commonProps} />}
    </div>
  );
};

const ProfilePage = () => {
  const { user, onProfileUpdate } = useOutletContext();

  const [formData, setFormData] = useState({ name: "", phoneNumber: "", title: "", address: "" });
  
  // [FIX 1] Tambahkan State Lokal untuk Gambar agar update instan
  const [displayProfileUrl, setDisplayProfileUrl] = useState(null);
  
  const [profilePictures, setProfilePictures] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cleanupPayload = (data) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

const updateStatesFromBackend = useCallback(
    (data) => {
      // 1. Update Context Global
      onProfileUpdate(data.user);

      // 2. Update State Lokal dengan CACHE BUSTING
      if (data.user && data.user.profilePictureUrl) {
        // Cek apakah URL sudah mengandung '?' (query params)
        const separator = data.user.profilePictureUrl.includes("?") ? "&" : "?";
        
        // Tambahkan timestamp unik (milidetik saat ini) agar browser reload gambar
        const freshUrl = `${data.user.profilePictureUrl}${separator}t=${new Date().getTime()}`;
        
        setDisplayProfileUrl(freshUrl);
      }

      // 3. Update data form lainnya
      setProfilePictures(data.profilePictures);
      setFormData({
        name: data.user.name || "",
        phoneNumber: data.user.phoneNumber || "",
        title: data.user.title || "",
        address: data.user.address || "",
      });
    },
    [onProfileUpdate]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      if (user) {
        // [FIX 3] Sinkronisasi awal state lokal dengan user context
        setDisplayProfileUrl(user.profilePictureUrl);

        setFormData({
          name: user.name || "",
          phoneNumber: user.phoneNumber || "",
          title: user.title || "",
          address: user.address || "",
        });

        try {
          const pictures = await userService.getProfilePictures();
          setProfilePictures(pictures);
        } catch (err) {
          toast.error(err.response?.data?.message || "Gagal memuat daftar foto riwayat.");
        }
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = useCallback(
    async ({ updateData, newPicture = null, oldPictureId = null }) => {
      setIsUpdating(true);
      const toastId = toast.loading("Memperbarui profil...");
      try {
        const response = await userService.updateMyProfile(updateData, newPicture, oldPictureId);

        updateStatesFromBackend(response.data);

        toast.success(response.message || "Profil berhasil diperbarui!", { id: toastId });
        setShowModal(false);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Gagal memperbarui profil.", { id: toastId });
      } finally {
        setIsUpdating(false);
      }
    },
    [updateStatesFromBackend]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = cleanupPayload(formData);
    if (Object.keys(payload).length === 0) {
      toast("Tidak ada perubahan untuk disimpan.");
      return;
    }
    handleProfileUpdate({ updateData: payload });
  };

  const handleUploadNew = useCallback(
    (file) => {
      const payload = cleanupPayload(formData);
      handleProfileUpdate({ updateData: payload, newPicture: file });
    },
    [formData, handleProfileUpdate]
  );

  const handleUseOld = useCallback(
    (pictureId) => {
      const payload = cleanupPayload(formData);
      handleProfileUpdate({ updateData: payload, oldPictureId: pictureId });
    },
    [formData, handleProfileUpdate]
  );

  const handleDeletePicture = useCallback(
    async (pictureId) => {
      const toastId = toast.loading("Menghapus foto...");
      try {
        const response = await userService.deleteProfilePicture(pictureId);
        updateStatesFromBackend(response.data);
        toast.success(response.message || "Foto berhasil dihapus!", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Gagal menghapus foto.", { id: toastId });
      }
    },
    [updateStatesFromBackend]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Profil Anda</h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Jaga agar data diri Anda tetap terbaru.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shadow-md">
              {/* [FIX 4] Gunakan displayProfileUrl (State Lokal) alih-alih user.profilePictureUrl */}
              {displayProfileUrl ? (
                <img 
                  src={displayProfileUrl} 
                  alt="Profil" 
                  className="w-full h-full object-cover"
                  // Trik agar browser me-refresh gambar jika URL sama tapi konten beda (opsional)
                  key={displayProfileUrl} 
                />
              ) : (
                <FaUser className="text-6xl text-gray-400 dark:text-slate-500" />
              )}
            </div>
            <button type="button" onClick={() => setShowModal(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none">
              Ubah Foto Profil
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
            <InputField id="name" name="name" label="Nama Lengkap" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap Anda" />
            <InputField id="title" name="title" label="Jabatan" value={formData.title} onChange={handleInputChange} placeholder="Contoh: Software Engineer" />
            <InputField id="phoneNumber" name="phoneNumber" label="Nomor Telepon" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Nomor telepon aktif" />
            <InputField id="address" name="address" label="Alamat" type="textarea" value={formData.address} onChange={handleInputChange} placeholder="Alamat tempat tinggal Anda" />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Menyimpan...
                </span>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>

      <ProfilePictureModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        profilePictures={profilePictures} 
        onUploadNew={handleUploadNew} 
        onUseOld={handleUseOld} 
        onDelete={handleDeletePicture} 
      />
    </div>
  );
};

export default ProfilePage;