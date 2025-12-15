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
   * * [PERBAIKAN] Urutan parameter ditukar agar sesuai dengan useDashboardDocuments.js
   * @param {string} title - Judul paket.
   * @param {string[]} documentIds - Array berisi ID dokumen.
   */
  createPackage: async (title, documentIds) => { // <--- DITUKAR: Title dulu, baru IDs
    try {
      // Payload tetap mengirim object { documentIds, title } sesuai Controller Backend
      const payload = { 
        title, 
        documentIds 
      };

      const response = await apiClient.post("/packages", payload);

      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal membuat paket tanda tangan.");
    }
  },

  /**
   * @description Mengambil detail lengkap paket, termasuk daftar dokumen di dalamnya.
   * Ini adalah langkah 2 dari wizard (memuat halaman TTD).
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