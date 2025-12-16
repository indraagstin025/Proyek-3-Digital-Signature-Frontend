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
   * Mengirim data tanda tangan untuk dokumen GRUP (Finalisasi).
   * Endpoint: POST /api/signatures/group
   * @param {object} payload
   */
  addGroupSignature: async (payload) => {
    try {
      const response = await apiClient.post("signatures/group", payload);
      return response.data; // Mengembalikan { status, message, data: { isComplete, remainingSigners } }
    } catch (error) {
      console.error("❌ Error addGroupSignature:", error);
      const message = error.response?.data?.message || "Gagal menandatangani dokumen grup.";
      throw new Error(message);
    }
  },

  /**
   * Mengambil detail verifikasi dari sebuah tanda tangan berdasarkan ID uniknya.
   * @param {string} signatureId - ID unik dari tanda tangan (dari URL QR Code).
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
   */
  verifyUploadedFile: async (signatureId, file) => {
    const formData = new FormData();
    formData.append("signatureId", signatureId);
    formData.append("file", file);

    try {
      const response = await apiClient.post("signatures/verify-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
   * Meminta AI untuk menganalisis isi dokumen (Legal Check).
   */
  async analyzeDocument(documentId) {
    try {
      const response = await apiClient.post(`documents/${documentId}/analyze`);
      return response.data;
    } catch (error) {
      console.error("❌ Error analyzeDocument:", error);
      throw new Error(error.response?.data?.message || "Gagal menganalisis dokumen.");
    }
  },

  /**
   * [BARU] Menyimpan draft tanda tangan ke Database saat User melakukan Drop.
   * @param {string} documentId
   * @param {object} payload - { signatureImageUrl, pageNumber, positionX, positionY, width, height }
   * @param {boolean} isGroupDoc - [BARU] Status apakah ini dokumen grup
   * @param {boolean} includeQrCode - [BARU] Status apakah perlu QR Code (Opsional)
   */
async saveDraft(documentId, payload, isGroupDoc, includeQrCode) {
    try {
      const fullPayload = { 
        ...payload, 
        isGroupDoc, 
        includeQrCode 
      };
      
      const response = await apiClient.post(`signatures/draft/${documentId}`, fullPayload);
      return response.data.data;
    } catch (error) {
      console.error("❌ Error saveDraft:", error);
      const message = error.response?.data?.message || "Gagal menyimpan posisi tanda tangan.";
      throw new Error(message);
    }
  },

  /**
   * [BARU] Mengupdate posisi tanda tangan saat digeser (Drag) atau diubah ukuran (Resize).
   * * @param {string} signatureId - ID Asli Database (Bukan 'sig-temp...')
   * @param {object} payload - { positionX, positionY, width, height, pageNumber }
   */
async updatePosition(signatureId, payload) {
    try {
      const response = await apiClient.patch(`signatures/${signatureId}/position`, payload);
      return response.data.data;
    } catch (error) {
      // 🔥 PENANGANAN KHUSUS ERROR 404 🔥
      // Jika 404, artinya data belum masuk DB (masih loading/race condition).
      // Kita abaikan saja, jangan throw error merah.
      if (error.response && error.response.status === 404) {
        // console.warn opsional, bisa dihapus jika ingin console benar-benar bersih
        // console.warn(`[Info] Update skipped: ID ${signatureId} not ready.`);
        return null;
      }

      // Jika error lain (misal 500), baru kita log error merah
      console.error("❌ Error updatePosition:", error);
      // Jangan throw error agar UX drag tidak patah
    }
  },

  /**
   * [BARU] Menghapus draft tanda tangan dari database.
   * @param {string} signatureId - ID Asli Database
   */
async deleteSignature(signatureId) {
    try {
      await apiClient.delete(`signatures/${signatureId}`);
      return true;
    } catch (error) {
      // 🔥 PENANGANAN KHUSUS ERROR 404 🔥
      // Jika 404, artinya barang sudah tidak ada. Anggap sukses.
      if (error.response && error.response.status === 404) {
        return true; 
      }

      console.error("❌ Error deleteSignature:", error);
      const message = error.response?.data?.message || "Gagal menghapus tanda tangan.";
      throw new Error(message);
    }
  },
};



  
