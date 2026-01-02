import apiClient from "./apiClient";

const TAG = "[UserService]";

/**
 * Ambil Profile user yang sedang login.
 * * [DATA BARU OTOMATIS]:
 * Karena backend sudah diupdate, fungsi ini sekarang juga akan mengembalikan:
 * - user.userStatus ("FREE" | "PREMIUM")
 * - user.premiumUntil (Date String / null)
 */
const getMyProfile = async () => {
  console.log(`${TAG} 📡 Fetching user profile...`);
  try {
    const response = await apiClient.get("/users/me");
    console.log(`${TAG} ✅ Profile loaded:`, response.data.data);
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
  console.log("Input Params:", { updateData, newProfilePicture, oldProfilePictureId });

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

    // DEBUG: Intip isi FormData
    console.log("📦 FormData Content:");
    for (let pair of payload.entries()) {
      console.log(`   - ${pair[0]}:`, pair[1]);
    }
  }
  // SKENARIO 2: Update Teks / Foto Lama (JSON)
  else {
    console.log("👉 Mode: Update JSON (Text/History)");
    payload = { ...updateData };

    if (oldProfilePictureId) {
      console.log("   - Using Old Picture ID:", oldProfilePictureId);
      payload.profilePictureId = oldProfilePictureId;
    }

    console.log("📦 JSON Payload:", payload);
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
 */
const getProfilePictures = async () => {
  console.log(`${TAG} 📡 Fetching profile pictures history...`);
  try {
    const response = await apiClient.get("/users/me/pictures");
    console.log(`${TAG} ✅ Pictures loaded. Count:`, response.data.data.length);
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
    console.log(`${TAG} ✅ Picture deleted successfully.`);

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
 * Ambil User Quota dan Limit Information.
 * Endpoint ini mengembalikan:
 * - userStatus ("FREE" | "PREMIUM")
 * - isPremiumActive (boolean)
 * - premiumUntil (Date string | null)
 * - limits (object dengan semua limit berdasarkan status)
 * - usage (object dengan usage saat ini)
 * - quotaPercentages (object dengan persentase penggunaan)
 */
const getQuota = async () => {
  console.log(`${TAG} 📡 Fetching user quota...`);
  try {
    const response = await apiClient.get("/users/me/quota");
    console.log(`${TAG} ✅ Quota loaded:`, response.data.data);
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
};

// Export getQuota juga sebagai named export untuk kemudahan import
export { getQuota };
