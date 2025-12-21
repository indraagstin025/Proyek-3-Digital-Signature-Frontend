import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * @description Kumpulan service untuk berinteraksi dengan
 * endpoint "Signing Package" (Amplop/Wizard).
 */
export const packageService = {
  /**
   * @description Membuat "Paket Tanda Tangan" (Amplop) baru di backend.
   * Langkah 1 Wizard.
   */
  createPackage: async (title, documentIds) => {
    try {
      const payload = {
        title,
        documentIds,
      };

      const response = await apiClient.post("/packages", payload);

      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal membuat paket tanda tangan.");
    }
  },

  /**
   * @description Mengambil detail lengkap paket.
   * Langkah 2 Wizard.
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
   * @description Mengirim semua data TTD (Final Step).
   * 🔥 PROSES BERAT (Bisa memakan waktu > 1 menit).
   * Kita override timeout secara eksplisit di sini agar aman.
   */
  signPackage: async (packageId, signatures) => {
    try {
      const payload = { signatures };
      
      // Override timeout khusus untuk request ini menjadi 5 menit (300000ms)
      // Ini memastikan request tidak diputus browser walau global config berubah.
      const response = await apiClient.post(`/packages/${packageId}/sign`, payload, {
        timeout: 300000, 
      });
      
      return response.data.data;
    } catch (error) {
      // Deteksi error timeout spesifik untuk memberikan pesan yang lebih jelas
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
         console.error("Sign Package Timeout:", error);
         // Kita lempar error baru agar UI tau ini masalah waktu, bukan bug
         throw new Error("Proses tanda tangan memakan waktu terlalu lama. Coba kurangi jumlah dokumen dalam paket.");
      }
      handleError(error, "Gagal menyelesaikan proses tanda tangan paket.");
    }
  },
};