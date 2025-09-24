import apiClient from "./apiClient";

const handleError = (error, defaultMessage) => {
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }

    if (error.message) {
        throw new Error(error.message);
    }

    throw new Error(defaultMessage);
};

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
    try{
        const response = await apiClient.post('signatures/personal', payload);
        return response.data;
    } catch (error) {
        handleError(error, "Gagal menambahkan tanda tangan");
    }
  },

  /**
   * Mengambil detail verifikasi dari sebuah tanda tangan berdasarkan ID uniknya.
   * @param {string} signatureId - ID unik dari tanda tangan (dari URL QR Code).
   * @returns {Promise<object} Detail data untuk halaman verifikasi.
   */
  getVerificationDetails: async (signatureId) => {
    try{
        const response = await apiClient.get(`signatures/verify/${signatureId}`);
        return response.data;
    } catch (error) {
        handleError(error, "Gagal mengambil detail verifikasi.")
    }
  },
};