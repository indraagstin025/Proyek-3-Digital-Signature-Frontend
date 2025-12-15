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
   * @description Mengupload dokumen baru ke grup dan menentukan penanda tangan.
   * Endpoint: POST /api/groups/:groupId/documents/upload
   * @param {string} groupId - ID Grup
   * @param {File} file - File PDF
   * @param {string} title - Judul Dokumen
   * @param {string[]} signerUserIds - Array ID user yang wajib tanda tangan
   */
  async uploadGroupDocument(groupId, file, title, signerUserIds) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    // Mengirim array via FormData harus di-stringify agar terbaca sebagai satu field JSON oleh backend
    // Backend (Controller) harus mem-parse ini kembali menjadi Array.
    formData.append("signerUserIds", JSON.stringify(signerUserIds));

    try {
      const response = await apiClient.post(`/groups/${groupId}/documents/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengupload dokumen grup.");
    }
  },

  /**
   * Mengambil semua grup yang dimiliki user.
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
   */
  async acceptInvitation(token) {
    const response = await apiClient.post("/groups/invitations/accept", { token });
    return response.data.data;
  },

  /**
   * Menghubungkan dokumen (yang sudah ada di draft) ke grup tertentu.
   * @async
   * @param {string} groupId - ID grup.
   * @param {string} documentId - ID dokumen yang akan ditambahkan.
   * @param {string[]} signerUserIds - Array ID User yang harus tanda tangan.
   */
  async assignDocumentToGroup(groupId, documentId, signerUserIds = []) {
    try {
      const response = await apiClient.put(`/groups/${groupId}/documents`, {
        documentId,
        signerUserIds, // Mengirim daftar signer ke backend
      });
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal menghubungkan dokumen ke grup.");
    }
  },

  async finalizeDocument(groupId, documentId) {
    try {
      const response = await apiClient.post(`/groups/${groupId}/documents/${documentId}/finalize`);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal memfinalisasi dokumen.");
    }
  },

  /**
   * [BARU] Memperbarui daftar penanda tangan (Checklist) untuk dokumen yang sudah ada.
   * Digunakan untuk fitur Edit Signers jika Admin lupa mencentang anggota.
   * @param {string} groupId
   * @param {string} documentId
   * @param {string[]} signerUserIds - Daftar ID user terbaru
   */
  async updateDocumentSigners(groupId, documentId, signerUserIds) {
    try {
      const response = await apiClient.put(
        `/groups/${groupId}/documents/${documentId}/signers`,
        { signerUserIds }
      );
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal memperbarui daftar penanda tangan.");
    }
  },

  /**
   * Menghapus anggota dari grup.
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
   * Melepaskan dokumen dari grup (Unassign).
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