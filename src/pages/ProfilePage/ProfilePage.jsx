// Import ikon-ikon baru yang akan kita gunakan
import {
  FaUser,
  FaSpinner,
  FaBriefcase,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaCamera,
} from "react-icons/fa";
import React, { useState, useEffect } from "react";
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
    className: "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200"
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={4}></textarea>
      ) : (
        <input {...commonProps} />
      )}
    </div>
  );
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    title: "",
    address: "",
  });

  const [profilePictures, setProfilePictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- (Semua logika useEffect dan handler functions tetap sama) ---
  useEffect(() => {
    let toastId;
    const fetchProfile = async () => {
      toastId = toast.loading("Memuat profil...");
      try {
        const userData = await userService.getMyProfile();
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phoneNumber: userData.phoneNumber || "",
          title: userData.title || "",
          address: userData.address || "",
        });
        const pictures = await userService.getProfilePictures();
        setProfilePictures(pictures);
        toast.dismiss(toastId);
      } catch (err) {
        toast.error(err.message || "Gagal memuat profil", { id: toastId });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const toastId = toast.loading("Menyimpan perubahan...");
    try {
      const response = await userService.updateMyProfile(formData);
      toast.success(response.message || "Profil berhasil diperbarui!", { id: toastId });
      const updatedUserData = await userService.getMyProfile();
      setUser(updatedUserData);
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui profil", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  // ... (Fungsi handleUploadNew, handleUseOldPicture, handleDeletePicture tetap sama, tidak perlu diubah)
  const handleUploadNew = async (file) => {
    const toastId = toast.loading("Mengunggah foto...");
    try {
      await userService.updateMyProfile(formData, file);
      const updatedUserData = await userService.getMyProfile();
      setUser(updatedUserData);

      const pictures = await userService.getProfilePictures();
      setProfilePictures(pictures);

      toast.success("Foto profil berhasil diunggah!", { id: toastId });
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Gagal upload foto", { id: toastId });
    }
  };

  const handleUseOldPicture = async (pictureId) => {
    const toastId = toast.loading("Mengganti foto...");
    try {
      await userService.useOldProfilePicture(pictureId);
      const updatedUserData = await userService.getMyProfile();
      setUser(updatedUserData);

      toast.success("Foto lama berhasil dipakai!", { id: toastId });
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Gagal mengganti foto lama", { id: toastId });
    }
  };

  const handleDeletePicture = async (pictureId) => {
    const toastId = toast.loading("Menghapus foto...");
    try {
      await userService.deleteProfilePicture(pictureId);
      setProfilePictures(profilePictures.filter((pic) => pic.id !== pictureId));

      toast.success("Foto berhasil dihapus!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Gagal menghapus foto", { id: toastId });
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* --- Header --- */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Profil Anda
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Jaga agar data diri Anda tetap terbaru.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- Foto Profil --- */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-6xl text-gray-400 dark:text-slate-500" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none"
            >
              Ubah Foto Profil
            </button>
          </div>

          {/* --- Form Fields --- */}
          <div className="bg-gray-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
             <InputField
                id="name"
                name="name"
                label="Nama Lengkap"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap Anda"
              />
              <InputField
                id="title"
                name="title"
                label="Jabatan"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Contoh: Software Engineer"
              />
              <InputField
                id="phoneNumber"
                name="phoneNumber"
                label="Nomor Telepon"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Nomor telepon aktif"
              />
              <InputField
                id="address"
                name="address"
                label="Alamat"
                type="textarea"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Alamat tempat tinggal Anda"
              />
          </div>

          {/* --- Tombol Simpan --- */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {updating ? (
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
        onUseOld={handleUseOldPicture}
        onDelete={handleDeletePicture}
      />
    </div>
  );
};

export default ProfilePage;