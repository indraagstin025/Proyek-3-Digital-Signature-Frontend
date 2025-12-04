import apiClient from "./apiClient";

export const historyService = {
  /**
   * Mengambil seluruh riwayat aktivitas tanda tangan user (Personal, Group, Package).
   * Endpoint: GET /api/history
   * @returns {Promise<Array>} List history data
   */
  async getMyHistory() {
    try {
      const response = await apiClient.get("/history");

      return response.data.data;
    } catch (error) {
      console.error("Gagal mengambil data history:", error);
      throw error;
    }
  },

  /**
   * (Opsional) Jika nanti Anda butuh filter by type di level API
   * Endpoint: GET /api/history?type=PERSONAL
   */
  async getHistoryByType(type) {
    const response = await apiClient.get(`/history`, {
      params: { type },
    });
    return response.data.data;
  },
};
