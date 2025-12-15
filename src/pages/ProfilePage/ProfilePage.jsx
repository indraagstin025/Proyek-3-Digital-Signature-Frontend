import { FaUser, FaSpinner, FaSave } from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { userService } from "../../services/userService";
import ProfilePictureModal from "./ProfilePictureModal";
import toast from "react-hot-toast";

// Komponen Input Field (Tidak Berubah)
const InputField = ({ id, name, label, type = "text", value, onChange, ...props }) => {
  const commonProps = {
    id,
    name,
    type,
    value,
    onChange,
    ...props,
    className:
      "block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200 transition-all",
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
      onProfileUpdate(data.user);
      if (data.user && data.user.profilePictureUrl) {
        const separator = data.user.profilePictureUrl.includes("?") ? "&" : "?";
        const freshUrl = `${data.user.profilePictureUrl}${separator}t=${new Date().getTime()}`;
        setDisplayProfileUrl(freshUrl);
      }
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
          // Silent fail or minimal toast
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
      <div className="flex justify-center items-center h-full w-full bg-transparent">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    // WRAPPER SCROLLABLE (Penting!)
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
        
      {/* Container 
          - pt-6: Padding atas secukupnya
          - pb-24: Padding bawah agar tidak terpotong
      */}
      <div className="max-w-3xl mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profil Anda</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Jaga agar data diri Anda tetap terbaru.</p>
        </div>

        {/* Card Form */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-800">
                    {displayProfileUrl ? (
                        <img
                        src={displayProfileUrl}
                        alt="Profil"
                        className="w-full h-full object-cover"
                        key={displayProfileUrl}
                        />
                    ) : (
                        <FaUser className="text-6xl text-gray-400 dark:text-slate-500" />
                    )}
                    </div>
                    {/* Overlay Edit Button (Optional, bisa juga pakai tombol teks di bawah) */}
                    <button 
                        type="button" 
                        onClick={() => setShowModal(true)}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
                        title="Ubah Foto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                </div>
                
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{formData.name || "User"}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formData.title || "Anggota"}</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <InputField id="name" name="name" label="Nama Lengkap" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap Anda" />
                    <InputField id="title" name="title" label="Jabatan" value={formData.title} onChange={handleInputChange} placeholder="Contoh: Software Engineer" />
                </div>
                
                <InputField id="phoneNumber" name="phoneNumber" label="Nomor Telepon" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Nomor telepon aktif" />
                <InputField id="address" name="address" label="Alamat" type="textarea" value={formData.address} onChange={handleInputChange} placeholder="Alamat tempat tinggal Anda" />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="h-4 w-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
        </div>
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