/* eslint-disable no-irregular-whitespace */
import apiClient from "./apiClient";

export const signatureService = {
  /**
   * [PERSONAL] Mengirim data tanda tangan mandiri ke backend.
   * Endpoint: POST /api/signatures/personal
   */
  addPersonalSignature: async (payload) => {
    try {
      const response = await apiClient.post("signatures/personal", payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error addPersonalSignature:", error);
      const message = error.response?.data?.message || "Gagal menandatangani dokumen.";
      throw new Error(message);
    }
  },

  /**
   * [PUBLIC] Mengambil detail verifikasi (Scan QR Code).
   * Endpoint: GET /api/signatures/verify/:id
   */
  getVerificationDetails: async (signatureId) => {
    try {
      const response = await apiClient.get(`signatures/verify/${signatureId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error getVerificationDetails:", error);
      const message = error.response?.data?.message || "Gagal mengambil detail verifikasi.";
      throw new Error(message);
    }
  },

  /**
   * [PUBLIC] Verifikasi file PDF manual (Upload).
   * Endpoint: POST /api/signatures/verify-file
   */
  verifyUploadedFile: async (signatureId, file) => {
    const formData = new FormData();
    formData.append("signatureId", signatureId);
    formData.append("file", file);

    try {
      const response = await apiClient.post("signatures/verify-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error verifyUploadedFile:", error);
      const message = error.response?.data?.message || "Gagal memverifikasi file.";
      throw new Error(message);
    }
  },

  /**
   * [HELPER] AI Auto-Tagging
   */
  autoTagDocument: async (documentId) => {
    try {
      const response = await apiClient.post(`documents/${documentId}/auto-tag`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Gagal menjalankan AI Auto-Tagging";
      throw new Error(message);
    }
  },

  /**
   * [HELPER] AI Analyze Document
   */
  async analyzeDocument(documentId) {
    try {
      const response = await apiClient.post(`documents/${documentId}/analyze`);
      return response.data.data;
    } catch (error) {
      console.error("❌ Error analyzeDocument:", error);
      throw new Error(error.response?.data?.message || "Gagal menganalisis dokumen.");
    }
  },
};