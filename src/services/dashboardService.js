/**
 * @file dashboardService.js
 * @description Service untuk menangani request API terkait Dashboard.
 */

import apiClient from "./apiClient";

export const dashboardService = {
  /**
   * Mengambil ringkasan data dashboard (Counts, Action Items, Recent Activities).
   * @returns {Promise<Object>} Object berisi { success, message, data }
   */
  getDashboardSummary: async () => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },
};
