// src/services/documentService.js
import apiClient from "./apiClient";
import { handleError } from "./errorHandler";



/**
 * @description Kumpulan service untuk berinteraksi dengan endpoint API dokumen.
 */
export const documentService = {
  /**
   * Mengunggah dokumen baru. Judul dokumen diambil secara otomatis dari nama file.
   * @param {File} file - Objek file yang akan diunggah.
   * @returns {Promise<object>} Data dokumen yang baru dibuat.
   * @throws {Error} Jika unggahan gagal.
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
   * Mengambil daftar semua dokumen milik pengguna yang terotentikasi.
   * @returns {Promise<Array<object>>} Array berisi objek dokumen.
   * @throws {Error} Jika pengambilan data gagal.
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
   * Mengambil detail satu dokumen spesifik berdasarkan ID-nya.
   * @param {string} documentId - ID dari dokumen yang akan diambil.
   * @returns {Promise<object>} Objek detail dokumen.
   * @throws {Error} Jika dokumen tidak ditemukan atau terjadi kegagalan.
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
   * Memperbarui metadata dokumen (misalnya, judul).
   * @param {string} documentId - ID dari dokumen yang akan diperbarui.
   * @param {object} updates - Objek berisi data untuk diperbarui, contoh: { title: "Judul Baru" }.
   * @returns {Promise<object>} Data dokumen yang telah diperbarui.
   * @throws {Error} Jika pembaruan gagal.
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
   * Menghapus dokumen berdasarkan ID-nya.
   * @param {string} documentId - ID dari dokumen yang akan dihapus.
   * @returns {Promise<object>} Respons sukses dari API.
   * @throws {Error} Jika penghapusan gagal.
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
   * Mengambil riwayat versi lengkap dari sebuah dokumen.
   * @param {string} documentId - ID dari dokumen induk.
   * @returns {Promise<Array<object>>} Array berisi objek riwayat versi.
   * @throws {Error} Jika pengambilan riwayat gagal.
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
   * Mengatur versi lama untuk menjadi versi aktif saat ini.
   * @param {string} documentId - ID dari dokumen induk.
   * @param {string} versionId - ID dari versi yang akan diaktifkan.
   * @returns {Promise<object>} Data dokumen yang telah diperbarui.
   * @throws {Error} Jika penggantian versi gagal.
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
   * Menghapus satu versi spesifik dari riwayat dokumen.
   * @param {string} documentId - ID dari dokumen induk.
   * @param {string} versionId - ID dari versi yang akan dihapus.
   * @returns {Promise<object>} Respons sukses dari API.
   * @throws {Error} Jika penghapusan versi gagal.
   */
  deleteVersion: async (documentId, versionId) => {
    try {
      const response = await apiClient.delete(`/documents/${documentId}/versions/${versionId}`);
      return response.data;
    } catch (error) {
      handleError(error, "Gagal menghapus versi dokumen.");
    }
  },

getDocumentFileUrl: async (documentId, options = {}) => {
  try {
    console.log("[documentService] 🔄 Requesting signed URL:", `/documents/${documentId}/file`);
    const response = await apiClient.get(`/documents/${documentId}/file`, { signal: options.signal });
    console.log("[documentService] ✅ Response:", response);

    if (!response.data.url) {
      throw new Error("Gagal mendapatkan URL dokumen dari respons API.");
    }

    return response.data.url;
  } catch (error) {
    console.error("[documentService] ❌ Error:", error);
    handleError(error, "Gagal mendapatkan akses ke dokumen.");
  }
},


  /**
   * @function getDocumentVersionFileUrl
   * @description Mendapatkan signed URL untuk mengakses file dari versi SPESIFIK.
   * @param {string} documentId - ID dari dokumen induk.
   * @param {string} versionId - ID dari versi spesifik yang akan diakses.
   * @returns {Promise<string>} Signed URL yang valid.
   * @throws {Error} Jika gagal mendapatkan URL akses.
   */
getDocumentVersionFileUrl: async (documentId, versionId) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}/versions/${versionId}/file`);

    // ✅ PERBAIKAN: Cek 'response.data.url', bukan 'signedUrl'
    if (!response.data.url) { 
      throw new Error("Gagal mendapatkan URL versi dokumen dari respons API.");
    }

    // ✅ PERBAIKAN: Kembalikan 'response.data.url'
    return response.data.url; 
  } catch (error) {
    handleError(error, "Gagal mendapatkan akses ke versi dokumen.");
  }
},

  /**
   * @function downloadDocument
   * @description Mengunduh file dokumen (versi aktif) dan memicu download di browser.
   * @param {string} documentId - ID dari dokumen yang akan diunduh.
   */
downloadDocument: async function (documentId) {
  try {
    const fileUrl = await this.getDocumentFileUrl(documentId);
    const urlObj = new URL(fileUrl);
    const filenameParam = urlObj.searchParams.get("download");
    const filename = filenameParam || `document-${documentId}.pdf`;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { status: "success", message: `Pengunduhan dokumen "${filename}" dimulai.` };
  } catch (error) {
    handleError(error, "Gagal memulai pengunduhan dokumen.");
  }
},
};