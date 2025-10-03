import apiClient from "./apiClient";

/**
 * Ambil Profile user yang sedang login.
 */
const getMyProfile = async () => {
  const response = await apiClient.get("/users/me");
  return response.data.data;
};

/**
 * Perbarui profile user. Fungsi ini menangani semua skenario:
 * 1. Update data teks saja.
 * 2. Update data teks + upload foto baru.
 * 3. Update data teks + pakai foto lama dari history.
 * @param {object} updateData - Data update (name, phoneNumber, dll).
 * @param {File|null} [newProfilePicture=null] - File foto baru.
 * @param {string|null} [oldProfilePictureId=null] - ID foto lama dari history.
 */
const updateMyProfile = async (updateData = {}, newProfilePicture = null, oldProfilePictureId = null) => {
  let payload;
  let headers;

  if (newProfilePicture) {
    payload = new FormData();
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        payload.append(key, updateData[key]);
      }
    });
    payload.append("profilePicture", newProfilePicture);

    headers = { "Content-Type": "multipart/form-data" };
  } else {
    payload = { ...updateData };
    if (oldProfilePictureId) {
      payload.profilePictureId = oldProfilePictureId;
    }
    headers = { "Content-Type": "application/json" };
  }

  const response = await apiClient.put("/users/me", payload, { headers });
  return response.data;
};

/**
 * Ambil semua history foto profil.
 */
const getProfilePictures = async () => {
  const response = await apiClient.get("/users/me/profile-pictures");
  return response.data.data;
};

/**
 * Hapus foto dari history.
 */
const deleteProfilePicture = async (pictureId) => {
  const response = await apiClient.delete(`/users/me/profile-pictures/${pictureId}`);
  return response.data;
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  getProfilePictures,
  deleteProfilePicture,
};
