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
      // Log biar mudah debug
      console.error("❌ Error addPersonalSignature:", error);

      // Ambil pesan dari backend kalau ada
      const message =
        error.response?.data?.message ||
        "Gagal menandatangani dokumen. Silakan coba lagi.";

      // Lempar error dengan pesan yang lebih bersih
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

      const message =
        error.response?.data?.message ||
        "Gagal mengambil detail verifikasi tanda tangan.";

      throw new Error(message);
    }
  },
};