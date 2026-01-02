/* eslint-disable no-unused-vars */
import apiClient from "./apiClient";
import { handleError } from "./errorHandler";
import { toast } from "react-hot-toast";

export const packageService = {
  // ... createPackage dan getPackageDetails tetap sama ...
  createPackage: async (title, documentIds) => {
    try {
      const payload = { title, documentIds };
      const response = await apiClient.post("/packages", payload);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal membuat paket tanda tangan.");
    }
  },

  getPackageDetails: async (packageId) => {
    try {
      const response = await apiClient.get(`/packages/${packageId}`);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil detail paket.");
    }
  },

  /**
   * REVISI: Fungsi ini dibuat lebih robust.
   * Kita tidak lagi memaksa cek /health sebelum POST, 
   * karena jika /health timeout tapi /sign lancar, user tetap dianggap offline.
   */
  signPackage: async (packageId, signatures) => {
    // Listener status network browser (hanya untuk UX visual)
    const handleOffline = () => toast.loading("Koneksi terputus...", { id: "net-status" });
    const handleOnline = () => toast.success("Terhubung kembali!", { id: "net-status" });

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    try {
      console.log("🚀 Mengirim data tanda tangan:", JSON.stringify(signatures, null, 2)); // LOGGING TAMBAHAN

      const response = await apiClient.post(
        `/packages/${packageId}/sign`,
        { signatures },
        { withCredentials: true }
      );
      
      return response.data.data;

    } catch (error) {
      console.error("🔥 Error Detail pada signPackage:", error); // LOGGING DETIL

      // Case 1: Server merespon (misal 400 Bad Request, 500 Internal Server Error)
      if (error.response) {
        // Ini BUKAN masalah koneksi. Lempar error asli agar bisa dibaca di UI.
        console.error("❌ Server Response Error:", error.response.data);
        throw error; 
      }

      // Case 2: Tidak ada respon (Network Error / CORS / DNS failure)
      if (error.request) {
        if (navigator.onLine === false) {
           throw new Error("Offline-Detected");
        }
        // Jika navigator.onLine true tapi request gagal, mungkin server down atau time out
        console.error("❌ No Response Received:", error.request);
        throw new Error("Server tidak merespon. Silakan coba lagi nanti.");
      }

      // Case 3: Error setting up request
      throw error;
    } finally {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      toast.dismiss("net-status");
    }
  },
};