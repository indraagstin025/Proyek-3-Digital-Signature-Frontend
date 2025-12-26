/* eslint-disable no-unused-vars */
import apiClient from "./apiClient";
import { handleError } from "./errorHandler";
import { toast } from "react-hot-toast";

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

  checkServerConnection: async () => {
    try {
      await apiClient.head("/health", { timeout: 5000 });
      return true;
    } catch (e) {
      return false;
    }
  },

  signPackage: async (packageId, signatures) => {
    const handleOffline = () => toast.loading("Koneksi terputus. Menunggu...", { id: "net-status" });
    const handleOnline = () => toast.success("Terhubung kembali!", { id: "net-status" });

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    try {
      const isOnline = await packageService.checkServerConnection();
      if (!isOnline) {
        toast.error("Gagal terhubung ke server. Periksa koneksi Anda.");
        throw new Error("Offline-Detected");
      }

      const response = await apiClient.post(
        `/packages/${packageId}/sign`,
        { signatures },
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      if (error.message === "Offline-Detected") throw error;

      if (error.response) {
        throw error;
      }

      if (error.code === "ERR_NETWORK") {
        if (navigator.onLine) toast.error("Koneksi tidak stabil.");
        throw new Error("Offline-Detected");
      }

      throw error;
    } finally {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      toast.dismiss("net-status");
    }
  },
};
