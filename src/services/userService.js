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
 * * @returns {Promise<{status: string, message: string, data: {user: object, profilePictures: Array<object>}}>}
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

  // Panggilan ke PUT /users/me
  const response = await apiClient.put("/users/me", payload, { headers });
  
  // ✅ Perubahan 1: Biarkan response.data dikembalikan (berisi status, message, dan data:{user, profilePictures})
  return response.data;
};

/**
 * Ambil semua history foto profil.
 * URL Disesuaikan agar konsisten dengan perubahan di backend routes.
 */
const getProfilePictures = async () => {
  // 🔄 Perubahan URL: Menggunakan /me/pictures agar sesuai dengan routes yang baru
  const response = await apiClient.get("/users/me/pictures"); 
  return response.data.data; // Mengembalikan array foto
};

/**
 * Hapus foto dari history.
 * @returns {Promise<{status: string, message: string, data: {user: object, profilePictures: Array<object>}}>}
 */
const deleteProfilePicture = async (pictureId) => {
  // 🔄 Perubahan URL: Menggunakan /me/pictures agar sesuai dengan routes yang baru
  const response = await apiClient.delete(`/users/me/pictures/${pictureId}`); 
  
  // ✅ Perubahan 2: Biarkan response.data dikembalikan (berisi status, message, dan data:{user, profilePictures})
  return response.data;
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  getProfilePictures,
  deleteProfilePicture,
};