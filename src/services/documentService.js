import apiClient from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * @description Kumpulan service untuk berinteraksi dengan endpoint API dokumen.
 */
export const documentService = {
  /**
   * Mengunggah dokumen baru.
   */
  createDocument: async (file) => {
    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("documentFile", file);
    try {
      const response = await apiClient.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      handleError(error, "Gagal mengunggah dokumen.");
    }
  },

  /**
   * Mengambil daftar semua dokumen.
   */
  getAllDocuments: async () => {
    try {
      const response = await apiClient.get("/documents");
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil daftar dokumen.");
    }
  },

  /**
   * Mengambil detail satu dokumen.
   */
  getDocumentById: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}`);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil detail dokumen.");
    }
  },

  /**
   * Memperbarui metadata dokumen.
   */
  updateDocument: async (documentId, updates) => {
    try {
      const response = await apiClient.put(`/documents/${documentId}`, updates);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal memperbarui dokumen.");
    }
  },

  /**
   * Menghapus dokumen.
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await apiClient.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal menghapus dokumen.");
    }
  },

  /**
   * Mengambil riwayat versi.
   */
  getDocumentHistory: async (documentId) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/versions`);
      return response.data.data;
    } catch (error) {
      handleError(error, "Gagal mengambil riwayat dokumen.");
    }
  },

  /**
   * Menggunakan versi lama.
   */
  useOldVersion: async (documentId, versionId) => {
    try {
      const response = await apiClient.put(`/documents/${documentId}/versions/${versionId}/use`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal mengganti versi dokumen.");
    }
  },

  /**
   * Menghapus versi spesifik.
   */
  deleteVersion: async (documentId, versionId) => {
    try {
      const response = await apiClient.delete(`/documents/${documentId}/versions/${versionId}`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal menghapus versi dokumen.");
    }
  },

  /**
   * @function getDocumentFileUrl
   * @description Mendapatkan signed URL untuk versi AKTIF.
   * @param {string} documentId - ID dokumen.
   * @param {object} options - { signal, purpose: 'view' | 'download' }
   */
  getDocumentFileUrl: async (documentId, options = {}) => {
    const purpose = options.purpose || "view";
    const urlPath = `/documents/${documentId}/file?purpose=${purpose}`;

    try {
      const response = await apiClient.get(urlPath, { signal: options.signal });

      if (!response.data.url) {
        throw new Error("Gagal mendapatkan URL dokumen dari respons API.");
      }

      return response.data.url;
    } catch (error) {
      if (error.name === "CanceledError" || error.message === "canceled") {
        throw error;
      } else {
        handleError(error, "Gagal mendapatkan akses ke dokumen.");
        throw error;
      }
    }
  },

  /**
   * @function getDocumentVersionFileUrl
   * @description Mendapatkan signed URL untuk versi SPESIFIK.
   */
  getDocumentVersionFileUrl: async (documentId, versionId, options = {}) => {
    const purpose = options.purpose || "view";
    const urlPath = `/documents/${documentId}/versions/${versionId}/file?purpose=${purpose}`;

    try {
      const response = await apiClient.get(urlPath);
      if (!response.data.url) {
        throw new Error("Gagal mendapatkan URL versi dokumen dari respons API.");
      }

      return response.data.url;
    } catch (error) {
      handleError(error, "Gagal mendapatkan akses ke versi dokumen.");
    }
  },

  /**
   * @function downloadDocument
   * @description Mengunduh file dokumen (versi aktif).
   * Meminta URL dengan mode 'download' agar browser mendownloadnya sebagai file.
   */
  downloadDocument: async function (documentId) {
    try {
      const fileUrl = await this.getDocumentFileUrl(documentId, { purpose: "download" });

      const urlObj = new URL(fileUrl);
      const filenameParam = urlObj.searchParams.get("download");
      const filename = filenameParam || `document-${documentId}.pdf`;

      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);

      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      return { status: "success", message: `Pengunduhan dokumen dimulai.` };
    } catch (error) {
      handleError(error, "Gagal memulai pengunduhan dokumen.");
    }
  },
};
