import apiClient from "./apiClient";

/**
 * Ambil Profile user yang sedang login.
 */
const getMyProfile = async () => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal mengambil profile pengguna");
  }
};

/**
 * Perbarui profile user
 * Bisa 3 Kondisi :
 * 1. Update data biasa
 * 2. Update + upload foto baru
 * 3. Update + pakai foto lama (profilePictureId)
 * @param {object} updateData - Data update (name, phoneNumber, title, address, dll)
 * @param {File|null} profilePicture - File foto baru (opsional).
 * @param {string|null} profilePictureId - ID foto lama dari history (opsional).
 */
const updateMyProfile = async (updateData = {}, profilePicture = null, profilePictureId = null) => {
  let payload;
  let headers;

  if (profilePicture) {
    payload = new FormData();
    Object.keys(updateData).forEach((key) => {
      if (updateData[key]) {
        payload.append(key, updateData[key]);
      }
    });
    payload.append("profilePicture", profilePicture);
    headers = { "Content-Type": "multipart/form-data" };
  } else {
    payload = { ...updateData };
    if (profilePictureId) {
      payload.profilePictureId = profilePictureId;
    }
    headers = { "Content-Type": "application/json" };
  }

  try {
    const response = await apiClient.put("/users/me", payload, { headers });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal memperbaharui profile.");
  }
};

/**
 * Ambil semua history foto profil
 */
const getProfilePictures = async () => {
  try {
    const response = await apiClient.get("/users/me/profile-pictures");
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal mengambil history profile.");
  }
};

/**
 * Pakai foto lama dari history
 */
const useOldProfilePicture = async (pictureId) => {
  try {
    const response = await apiClient.post(`/users/me/profile-pictures/${pictureId}/use`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal mengganti ke foto lama.");
  }
};

/**
 * Hapus foto dari history
 */
const deleteProfilePicture = async (pictureId) => {
  try {
    const response = await apiClient.delete(`/users/me/profile-pictures/${pictureId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Gagal menghapus foto profil.");

  }
}

export const userService = {
  getMyProfile,
  updateMyProfile,
  getProfilePictures,
  useOldProfilePicture,
  deleteProfilePicture,
};
