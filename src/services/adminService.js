import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * Mengambil semua data pengguna dari sistem.
 * @returns {Promise<Array>} Array berisi objek pengguna.
 */
const getAllUsers = async () => {
    try {
        const response = await apiClient.get("/admin/users");
        return response.data?.data || [];
    } catch (error) {
        handleError(error, "Gagal mengambil daftar pengguna.");
    }
};

/**
 * Membuat pengguna baru melalui endpoint admin.
 * @param {object} userData - Data pengguna baru.
 * @returns {Promise<object>} Data pengguna yang baru dibuat.
 */
const createUser = async (userData) => {
    try {
        const response = await apiClient.post("/admin/users", userData);
        return response.data?.data;
    } catch (error) {
        handleError(error, "Gagal membuat pengguna baru.");
    }
};

/**
 * Mengubah data pengguna berdasarkan ID-nya.
 * @param {string} userId - ID pengguna yang akan diubah.
 * @param {object} userData - Data baru untuk pengguna (misal: { name, email, isSuperAdmin }).
 * @returns {Promise<object>} Data pengguna yang sudah diperbarui.
 */
const updateUser = async (userId, userData) => {
    try {
        const response = await apiClient.patch(`/admin/users/${userId}`, userData);
        return response.data?.data;
    } catch (error) {
        handleError(error, "Gagal memperbarui pengguna.");
    }
};

/**
 * Menghapus seorang pengguna berdasarkan ID-nya.
 * @param {string} userId - ID pengguna yang akan dihapus.
 * @returns {Promise<object>} Pesan konfirmasi keberhasilan.
 */
const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        handleError(error, "Gagal menghapus pengguna.");
    }
};

export const adminService = {
    getAllUsers,
    createUser,
    updateUser, // <-- Tambahkan di sini
    deleteUser,
};