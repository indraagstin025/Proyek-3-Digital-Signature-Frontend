import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * @description Kumpulan service untuk berinteraksi dengan
 * endpoint "Signing Package" (Amplop/Wizard).
 */
export const packageService = {
  /**
   * @description Membuat "Paket Tanda Tangan" (Amplop) baru di backend.
   * Ini adalah langkah 1 dari wizard.
   * @param {string[]} documentIds - Array berisi ID dokumen (BUKAN versi) yang akan dimasukkan.
   * @param {string} [title] - Judul opsional untuk paket ini.
   * @returns {Promise<object>} Data paket baru yang dibuat (termasuk packageId).
   * @throws {Error} Jika pembuatan paket gagal.
   */
  createPackage: async (documentIds, title = null) => {
    try {
      const payload = { documentIds, title };

      const response = await apiClient.post("/packages", payload);

      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal membuat paket tanda tangan.");
    }
  },

  /**
   * @description Mengambil detail lengkap paket, termasuk daftar dokumen di dalamnya.
   * Ini adalah langkah 2 dari wizard (memuat halaman TTD).
   * @param {string} packageId - ID dari paket yang akan diambil.
   * @returns {Promise<object>} Objek detail paket.
   * @throws {Error} Jika paket tidak ditemukan.
   */
  getPackageDetails: async (packageId) => {
    try {
      const response = await apiClient.get(`/packages/${packageId}`);

      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil detail paket.");
    }
  },

  /**
   * @description Mengirim semua data TTD yang sudah ditempatkan di wizard ke backend.
   * Ini adalah langkah terakhir (final) dari wizard.
   * @param {string} packageId - ID paket yang sedang diproses.
   * @param {Array<object>} signatures - Array berisi semua objek data TTD.
   * @returns {Promise<object>} Hasil dari proses batch (sukses/gagal).
   * @throws {Error} Jika proses penyimpanan gagal.
   */
  signPackage: async (packageId, signatures) => {
    try {
      const payload = { signatures };

      const response = await apiClient.post(`/packages/${packageId}/sign`, payload);

      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal menyelesaikan proses tanda tangan paket.");
    }
  },
};
