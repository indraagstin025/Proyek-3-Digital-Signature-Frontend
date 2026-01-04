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
  console.log(`${TAG} 📡 Fetching user profile...`);
  try {
    const response = await apiClient.get("/users/me");
    // console.log(`${TAG} ✅ Profile loaded:`, response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(`${TAG} ❌ Failed to fetch profile:`, error);
    throw error;
  }
};

/**
 * Perbarui profile user.
 * Menangani: Update Teks, Upload File, atau Pakai Foto Lama.
 */
const updateMyProfile = async (updateData = {}, newProfilePicture = null, oldProfilePictureId = null) => {
  console.group(`${TAG} 🛠 Updating Profile`);

  let payload;
  let headers;

  // SKENARIO 1: Upload Foto Baru (Multipart/Form-Data)
  if (newProfilePicture) {
    console.log("👉 Mode: Upload New Picture");
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
    console.log("👉 Mode: Update JSON (Text/History)");
    payload = { ...updateData };

    if (oldProfilePictureId) {
      console.log("   - Using Old Picture ID:", oldProfilePictureId);
      payload.profilePictureId = oldProfilePictureId;
    }

    headers = { "Content-Type": "application/json" };
  }

  try {
    const response = await apiClient.put("/users/me", payload, { headers });
    console.log("✅ Update Success:", response.data);
    console.groupEnd();

    return {
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error("❌ Update Failed:", error.response?.data || error.message);
    console.groupEnd();
    throw error;
  }
};

/**
 * Ambil semua history foto profil.
 * Data response dari backend sudah berisi URL lengkap untuk setiap item.
 */
const getProfilePictures = async () => {
  console.log(`${TAG} 📡 Fetching profile pictures history...`);
  try {
    const response = await apiClient.get("/users/me/pictures");
    return response.data.data;
  } catch (error) {
    console.error(`${TAG} ❌ Failed to fetch pictures:`, error);
    throw error;
  }
};

/**
 * Hapus foto dari history.
 */
const deleteProfilePicture = async (pictureId) => {
  console.log(`${TAG} 🗑 Deleting picture ID: ${pictureId}...`);
  try {
    const response = await apiClient.delete(`/users/me/pictures/${pictureId}`);
    return {
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    console.error(`${TAG} ❌ Failed to delete picture:`, error);
    throw error;
  }
};

/**
 * Ambil User Quota.
 */
const getQuota = async () => {
  console.log(`${TAG} 📡 Fetching user quota...`);
  try {
    const response = await apiClient.get("/users/me/quota");
    return response.data.data;
  } catch (error) {
    console.error(`${TAG} ❌ Failed to fetch quota:`, error);
    throw error;
  }
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  getProfilePictures,
  deleteProfilePicture,
  getQuota,
  getProfilePictureUrl, // ✅ Tetap diexport agar tidak error di komponen lain
};

// Export getQuota & helper juga sebagai named export
export { getQuota, getProfilePictureUrl };