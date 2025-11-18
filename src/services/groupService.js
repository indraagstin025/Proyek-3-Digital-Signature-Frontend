import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * Service untuk operasi terkait Group dan Invitation.
 */
export const groupService = {
  /**
   * Membuat grup baru.
   * @async
   * @param {string} name - Nama grup yang akan dibuat.
   * @returns {Promise<Object>} Data grup yang berhasil dibuat.
   * @throws {Error} Jika terjadi kegagalan saat membuat grup.
   */
  async createGroup(name) {
    try {
      const response = await apiClient.post("/groups", { name });
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal membuat grup baru.");
    }
  },

  /**
   * Mengambil semua grup yang dimiliki user.
   * @async
   * @returns {Promise<Array>} Daftar grup milik user.
   * @throws {Error} Jika terjadi kesalahan saat pengambilan data grup.
   */
  async getAllUserGroups() {
    try {
      const response = await apiClient.get("/groups");
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil daftar grup.");
    }
  },

  /**
   * Mengambil detail grup berdasarkan ID.
   * @async
   * @param {string} groupId - ID grup yang ingin diambil.
   * @returns {Promise<Object>} Detail grup.
   * @throws {Error} Jika gagal mengambil detail grup.
   */
  async getGroupById(groupId) {
    try {
      const response = await apiClient.get(`/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil detail grup.");
    }
  },

  /**
   * Membuat undangan untuk bergabung dalam grup.
   * @async
   * @param {string} groupId - ID grup tempat undangan dibuat.
   * @param {string} role - Role yang diberikan kepada penerima undangan.
   * @returns {Promise<Object>} Token atau detail undangan.
   * @throws {Error} Jika gagal membuat undangan.
   */
  async createInvitation(groupId, role) {
    try {
      const response = await apiClient.post(`/groups/${groupId}/invitations`, { role });
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal membuat undangan.");
    }
  },

  /**
   * Menerima undangan menggunakan token.
   * @async
   * @param {string} token - Token undangan.
   * @returns {Promise<Object>} Data keanggotaan atau grup yang berhasil di-join.
   */
  async acceptInvitation(token) {
    const response = await apiClient.post("/groups/invitations/accept", { token });
    return response.data.data;
  },

  /**
   * Menghubungkan dokumen ke grup tertentu.
   * @async
   * @param {string} groupId - ID grup.
   * @param {string} documentId - ID dokumen yang akan ditambahkan.
   * @returns {Promise<Object>} Data hasil penghubungan dokumen.
   * @throws {Error} Jika gagal menghubungkan dokumen.
   */
  async assignDocumentToGroup(groupId, documentId) {
    try {
      const response = await apiClient.put(`/groups/${groupId}/documents`, { documentId });
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal menghubungkan dokumen ke grup.");
    }
  },

  /**
   * Menghapus anggota dari grup.
   * @async
   * @param {string} groupId - ID grup.
   * @param {string} userIdToRemove - ID user yang akan dihapus.
   * @returns {Promise<Object>} Response dari server.
   * @throws {Error} Jika gagal menghapus anggota.
   */
  async removeMember(groupId, userIdToRemove) {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/members/${userIdToRemove}`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal mengeluarkan anggota.");
    }
  },

  /**
   * Memperbarui data grup.
   * @async
   * @param {string} groupId - ID grup yang akan diperbarui.
   * @param {Object} data - Data perubahan grup.
   * @returns {Promise<Object>} Data grup setelah diperbarui.
   * @throws {Error} Jika gagal memperbarui grup.
   */
  async updateGroup(groupId, data) {
    try {
      const response = await apiClient.put(`/groups/${groupId}`, data);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal memperbarui grup.");
    }
  },

  /**
   * Menghapus grup berdasarkan ID.
   * @async
   * @param {string} groupId - ID grup yang akan dihapus.
   * @returns {Promise<Object>} Response penghapusan.
   * @throws {Error} Jika gagal menghapus grup.
   */
  async deleteGroup(groupId) {
    try {
      const response = await apiClient.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal menghapus grup.");
    }
  },

  /**
   * Melepaskan dokumen dari grup.
   * @async
   * @param {string} groupId - ID grup.
   * @param {string} documentId - ID dokumen yang akan dilepaskan.
   * @returns {Promise<Object>} Response pelepasan dokumen.
   * @throws {Error} Jika gagal melepaskan dokumen.
   */
  async unassignDocumentFromGroup(groupId, documentId) {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal melepaskan dokumen dari grup.");
    }
  },
};
