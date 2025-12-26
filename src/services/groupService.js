import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * Service untuk operasi terkait Group dan Invitation.
 */
export const groupService = {
  /**
   * Membuat grup baru.
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
   * Mengupload dokumen baru ke grup dan menentukan penanda tangan.
   */
  async uploadGroupDocument(groupId, file, title, signerUserIds) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
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
   */
  async assignDocumentToGroup(groupId, documentId, signerUserIds = []) {
    try {
      const response = await apiClient.put(`/groups/${groupId}/documents`, {
        documentId,
        signerUserIds,
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
   * [PENTING UNTUK ANTI-DELAY] 
   * Backend mengembalikan Object Dokumen lengkap di dalam `response.data.data`.
   * Frontend Hook akan menggunakannya untuk update UI instan.
   */
  async updateDocumentSigners(groupId, documentId, signerUserIds) {
    try {
      const response = await apiClient.put(
        `/groups/${groupId}/documents/${documentId}/signers`,
        { signerUserIds }
      );
      // Pastikan backend controller mengembalikan format { status: 'success', data: documentObject }
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

  async deleteGroupDocument(groupId, documentId) {
    const response = await apiClient.delete(`/groups/${groupId}/documents/${documentId}/delete`);
    return response.data;
  },
};