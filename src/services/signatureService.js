/* eslint-disable no-irregular-whitespace */
import apiClient from "./apiClient";

export const signatureService = {
  /**
   * Mengirim data tanda tangan mandiri (personal) ke backend.
   * @param {object} payload - Data lengkap untuk membuat tanda tangan.
   * @param {string} payload.documentVersionId - ID dari versi dokumen yang ditandatangani.
   * @param {string} payload.method - Metode yang digunakan ('canvas' atau 'qrcode').
   * @param {string} payload.signatureImageUrl - Gambar tanda tangan dalam format Base64.
   * @param {number} payload.positionX - Koordinat X penempatan di PDF.
   * @param {number} payload.positionY - Koordinat Y penempatan di PDF.
   * @param {number} payload.pageNumber - Nomor halaman penempatan di PDF.
   * @returns {Promise<object>} Data dokumen yang sudah di-update oleh backend.
   */
  addPersonalSignature: async (payload) => {
    try {
      const response = await apiClient.post("signatures/personal", payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error addPersonalSignature:", error);

      const message = error.response?.data?.message || "Gagal menandatangani dokumen. Silakan coba lagi.";

      throw new Error(message);
    }
  },

  /**
   * Mengambil detail verifikasi dari sebuah tanda tangan berdasarkan ID uniknya.
   * @param {string} signatureId - ID unik dari tanda tangan (dari URL QR Code).
   * @returns {Promise<object} Detail data untuk halaman verifikasi.
   */
  getVerificationDetails: async (signatureId) => {
    try {
      const response = await apiClient.get(`signatures/verify/${signatureId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error getVerificationDetails:", error);

      const message = error.response?.data?.message || "Gagal mengambil detail verifikasi tanda tangan.";

      throw new Error(message);
    }
  },

  /**
   * @description Mengirim file PDF yang diunggah untuk diverifikasi integritasnya (Hash Check).
   * Digunakan untuk menguji dokumen yang telah diedit di luar sistem.
   * @param {string} signatureId - ID unik dari tanda tangan yang dicari.
   * @param {File} file - Objek File PDF yang akan diunggah (dari input type="file").
   * @returns {Promise<object} Detail hasil verifikasi kriptografi.
   */
  verifyUploadedFile: async (signatureId, file) => {
    const formData = new FormData();
    formData.append("signatureId", signatureId);
    formData.append("file", file);

    try {
      const response = await apiClient.post("signatures/verify-file", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(" Error verifyUploadedFile:", error);

      const message = error.response?.data?.message || "Gagal memverifikasi file yang diunggah.";

      throw new Error(message);
    }
  },

  /**
   * Meminta AI untuk mendeteksi posisi tanda tangan secara otomatis.
   * Backend akan menganalisis PDF dan menyimpan placeholder di database.
   * @param {string} documentId - ID dokumen yang sedang dibuka.
   * @returns {Promise<object>} Response sukses dari backend berisi jumlah lokasi yang ditemukan
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
   * [BARU] Meminta AI untuk menganalisis isi dokumen (Legal Check).
   * @param {string} documentId
   */
  async analyzeDocument(documentId) {
    try {
      // Endpoint baru di Node.js
      const response = await apiClient.post(`documents/${documentId}/analyze`);
      return response.data; // Mengembalikan { status: 'success', data: { ...JSON Gemini... } }
    } catch (error) {
      console.error("❌ Error analyzeDocument:", error);
      throw new Error(error.response?.data?.message || "Gagal menganalisis dokumen.");
    }
  },
};
