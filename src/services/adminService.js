import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * Mengambil semua data pengguna dari sistem.
 * Endpoint: GET /api/admin/users
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
 * Endpoint: POST /api/admin/users
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
 * Endpoint: PUT /api/admin/users/:userId (Biasanya PUT untuk update profile admin)
 * @param {string} userId - ID pengguna.
 * @param {object} userData - Data baru.
 * @returns {Promise<object>} Data pengguna yang diperbarui.
 */
const updateUser = async (userId, userData) => {
    try {
        // [UPDATE] Gunakan PUT jika di backend route-nya router.put
        const response = await apiClient.put(`/admin/users/${userId}`, userData);
        return response.data?.data;
    } catch (error) {
        handleError(error, "Gagal memperbarui pengguna.");
    }
};

/**
 * Menghapus seorang pengguna berdasarkan ID-nya.
 * Endpoint: DELETE /api/admin/users/:userId
 * @param {string} userId - ID pengguna.
 * @returns {Promise<object>} Pesan sukses.
 */
const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        handleError(error, "Gagal menghapus pengguna.");
    }
};

/**
 * [PERBAIKAN] Mengambil ringkasan dashboard (Stats + Traffic + Trends).
 * Endpoint: GET /api/admin/dashboard
 * @returns {Promise<object>} { counts, traffic, trends }
 */
const getDashboardSummary = async () => {
    try {
        // [FIX] Endpoint disesuaikan dengan backend route "/dashboard"
        const response = await apiClient.get("/admin/dashboard");
        return response.data; // Backend controller mengembalikan { success: true, data: { ... } }
    } catch (error) {
        handleError(error, "Gagal mengambil data dashboard.");
    }
};

/**
 * Mengambil daftar Audit Log aktivitas admin.
 * Endpoint: GET /api/admin/audit-logs
 * @returns {Promise<Array>} Array object logs.
 */
const getAllAuditLogs = async (page = 1, limit = 10) => {
    try {
        // Kirim query param page & limit
        const response = await apiClient.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
        // Return full response (data + pagination meta)
        return response.data; 
    } catch (error) {
        handleError(error, "Gagal mengambil audit logs.");
    }
};

/**
 * Mengambil semua dokumen.
 * Endpoint: GET /api/admin/documents
 */
const getAllDocuments = async () => {
    try {
        const response = await apiClient.get("/admin/documents");
        return response.data?.data || [];
    } catch (error) {
        handleError(error, "Gagal mengambil daftar dokumen.");
    }
};

/**
 * Menghapus dokumen secara paksa (Force Delete).
 * Endpoint: DELETE /api/admin/documents/:id
 * @param {string} documentId - ID Dokumen target
 * @param {string} reason - Alasan penghapusan (Wajib)
 */
const forceDeleteDocument = async (documentId, reason) => {
    try {
        const response = await apiClient.delete(`/admin/documents/${documentId}`, {
            data: { reason }
        });
        return response.data;
    } catch (error) {
        handleError(error, "Gagal menghapus dokumen secara paksa.");
    }
};

// Export semua fungsi
export const adminService = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getDashboardSummary, // [FIX] Nama fungsi disesuaikan dengan panggilan di UI
    getAllDocuments,
    getAllAuditLogs,     // [FIX] Nama disesuaikan (sebelumnya getAuditLogs vs getAllAuditLogs)
    forceDeleteDocument
};