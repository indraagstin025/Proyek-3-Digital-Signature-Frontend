import apiClient from "./apiClient";

// Helper untuk menangani error secara konsisten
const handleError = (error, defaultMessage) => {
    if (error.response?.data?.message) {
        return new Error(error.response.data.message);
    }
    if (error.message) {
        return new Error(error.message);
    }
    return new Error(defaultMessage);
};

export const documentService = {
    createDocument: async (title, file) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('documentFile', file);
        try {
            const response = await apiClient.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw handleError(error, "Gagal mengunggah dokumen.");
        }
    },

    getAllDocuments: async () => {
        try {
            const response = await apiClient.get('/documents');
            return response.data.data;
        } catch (error) {
            throw handleError(error, "Gagal mengambil daftar dokumen.");
        }
    },

    getDocumentById: async (documentId) => {
        try {
            const response = await apiClient.get(`/documents/${documentId}`);
            return response.data.data;
        } catch (error) {
            throw handleError(error, "Gagal mengambil detail dokumen.");
        }
    },

    updateDocument: async (documentId, updates, newFile = null) => {
        const formData = new FormData();
        if (updates.title) {
            formData.append("title", updates.title);
        }
        if (newFile) {
            formData.append("documentFile", newFile);
        }
        try {
            const response = await apiClient.put(`/documents/${documentId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            throw handleError(error, "Gagal memperbarui dokumen.");
        }
    },

    deleteDocument: async (documentId) => {
        try {
            const response = await apiClient.delete(`/documents/${documentId}`);
            return response.data;
        } catch (error) {
            throw handleError(error, "Gagal menghapus dokumen.");
        }
    },

    // --- FUNGSI RIWAYAT VERSI ---

    getDocumentHistory: async (documentId) => {
        try {
            const response = await apiClient.get(`/documents/${documentId}/versions`);
            return response.data.data;
        } catch (error) {
            throw handleError(error, "Gagal mengambil riwayat dokumen.");
        }
    },

    useOldVersion: async (documentId, versionId) => {
        try {
            const response = await apiClient.post(`/documents/${documentId}/versions/${versionId}/use`);
            return response.data;
        } catch (error) {
            throw handleError(error, "Gagal mengganti versi dokumen.");
        }
    },

    deleteVersion: async (documentId, versionId) => {
        try {
            const response = await apiClient.delete(`/documents/${documentId}/versions/${versionId}`);
            return response.data;
        } catch (error) {
            throw handleError(error, "Gagal menghapus versi dokumen.");
        }
    },
};