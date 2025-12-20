import apiClient from "./apiClient";

export const groupSignatureService = {
  /**
   * [DRAFT] Menyimpan draft tanda tangan (Saat Drop Awal).
   * Endpoint: POST /api/group-signatures/draft/:documentId
   */
  saveDraft: async (documentId, payload) => {
    try {
      // Payload: { id, signatureImageUrl, pageNumber, positionX, positionY, width, height, method }
      const response = await apiClient.post(`group-signatures/draft/${documentId}`, payload);
      return response.data.data;
    } catch (error) {
      console.error("❌ Error Group saveDraft:", error);
      const message = error.response?.data?.message || "Gagal menyimpan draft grup.";
      throw new Error(message);
    }
  },

  /**
   * [UPDATE POSITION] Update posisi tanda tangan (Drag/Resize).
   * Endpoint: PATCH /api/group-signatures/:signatureId/position
   */
  updateDraftPosition: async (signatureId, payload) => {
    try {
      // Payload: { positionX, positionY, width, height, pageNumber }
      const response = await apiClient.patch(`group-signatures/${signatureId}/position`, payload);
      return response.data.data;
    } catch (error) {
      // Silent error untuk UX Drag & Drop jika data belum siap di DB (404)
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error("❌ Error Group updatePosition:", error);
      // Jangan throw error agar UI tidak patah
      return null;
    }
  },

  /**
   * [DELETE] Menghapus draft.
   * Endpoint: DELETE /api/group-signatures/:signatureId
   */
  deleteDraft: async (signatureId) => {
    try {
      await apiClient.delete(`group-signatures/${signatureId}`);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return true;
      }
      console.error("❌ Error Group deleteDraft:", error);
      const message = error.response?.data?.message || "Gagal menghapus draft.";
      throw new Error(message);
    }
  },

  /**
   * [USER ACTION] Member (User) melakukan tanda tangan (Finalisasi per User).
   * Endpoint: POST /api/group-signatures/:documentId/sign
   */
  signDocument: async (documentId, payload) => {
    try {
      // Payload: { id, signatureImageUrl, ... }
      const response = await apiClient.post(`group-signatures/${documentId}/sign`, payload);
      return response.data; 
    } catch (error) {
      console.error("❌ Error Group signDocument:", error);
      const message = error.response?.data?.message || "Gagal melakukan tanda tangan.";
      throw new Error(message);
    }
  },

  /**
   * [ADMIN ACTION] Finalisasi Dokumen (Burn to PDF).
   * Endpoint: POST /api/group-signatures
   */
  finalizeGroupDocument: async (payload) => {
    try {
      // Payload: { groupId, documentId }
      const response = await apiClient.post("group-signatures", payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error finalizeGroupDocument:", error);
      const message = error.response?.data?.message || "Gagal memfinalisasi dokumen grup.";
      throw new Error(message);
    }
  },
};