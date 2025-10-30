import apiClient from "./apiClient";

/**
 * Ambil Profile user yang sedang login.
 */
const getMyProfile = async () => {
  const response = await apiClient.get("/users/me");
  return response.data.data;
};

/**
 * Perbarui profile user.
 * Menangani:
 * 1. Update teks saja.
 * 2. Upload foto baru.
 * 3. Gunakan foto lama dari riwayat.
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

  return {
    message: response.data.message,
    data: response.data.data,
  };
};

/**
 * Ambil semua history foto profil.
 */
const getProfilePictures = async () => {
  const response = await apiClient.get("/users/me/pictures");
  return response.data.data;
};

/**
 * Hapus foto dari history.
 */
const deleteProfilePicture = async (pictureId) => {
  const response = await apiClient.delete(`/users/me/pictures/${pictureId}`);

  return {
    message: response.data.message,
    data: response.data.data,
  };
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  getProfilePictures,
  deleteProfilePicture,
};
