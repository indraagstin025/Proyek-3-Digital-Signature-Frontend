import apiClient from "./apiClient";

const TAG = "[UserService]";

/**
 * 🟢 HELPER URL GAMBAR
 * Karena Backend (Socket & Controller) sudah mengirimkan URL LENGKAP (Full URL),
 * fungsi ini sekarang hanya bertugas mengembalikan nilai apa adanya (Pass-through).
 * * Kita tetap pertahankan fungsi ini agar tidak perlu menghapus pemanggilannya
 * di komponen UI (SigningHeader, Sidebar, dll).
 */
const getProfilePictureUrl = (path) => {
  return path;
};

/**
 * Ambil Profile user yang sedang login.
 * Backend akan mengembalikan JSON dengan profilePictureUrl yang sudah lengkap.
 */
const getMyProfile = async () => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Perbarui profile user.
 * Menangani: Update Teks, Upload File, atau Pakai Foto Lama.
 */
const updateMyProfile = async (updateData = {}, newProfilePicture = null, oldProfilePictureId = null) => {
  let payload;
  let headers;

  // SKENARIO 1: Upload Foto Baru (Multipart/Form-Data)
  if (newProfilePicture) {
    payload = new FormData();

    // Append Text Data
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        payload.append(key, updateData[key]);
      }
    });

    // Append File
    payload.append("profilePicture", newProfilePicture);
    headers = { "Content-Type": "multipart/form-data" };
  }
  // SKENARIO 2: Update Teks / Foto Lama (JSON)
  else {
    payload = { ...updateData };

    if (oldProfilePictureId) {
      payload.profilePictureId = oldProfilePictureId;
    }

    headers = { "Content-Type": "application/json" };
  }

  try {
    const response = await apiClient.put("/users/me", payload, { headers });
    console.groupEnd();

    return {
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.groupEnd();
    throw error;
  }
};

/**
 * Ambil semua history foto profil.
 * Data response dari backend sudah berisi URL lengkap untuk setiap item.
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

/**
 * Ambil User Quota.
 */
const getQuota = async () => {
  const response = await apiClient.get("/users/me/quota");
  return response.data.data;
};

/**
 * Update Status Tour Progress.
 * Digunakan untuk menandai bahwa user sudah menyelesaikan panduan fitur tertentu.
 * @param {string} tourKey - Key unik panduan (misal: "dashboard_welcome", "signature_intro")
 */
const updateTourProgress = async (tourKey) => {
  try {
    const response = await apiClient.patch("/users/me/tour-progress", { tourKey });
    return response.data;
  } catch (error) {
    return error;
  }
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  getProfilePictures,
  deleteProfilePicture,
  getQuota,
  getProfilePictureUrl,
  updateTourProgress,
};

// Export getQuota & helper juga sebagai named export
export { getQuota, getProfilePictureUrl, updateTourProgress };
