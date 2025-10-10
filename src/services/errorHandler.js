/**
 * Menangani error dari Axios secara terpusat.
 * Jika error adalah 401 (Unauthorized), error asli akan dilempar kembali.
 * agar bisa ditangani secara spesidik oleh interceptor atau komponen.
 * Untuk error lainnya, error akan diformat ulang dengan pesan yang lebih jelas.
 * 
 * @param {object} error - Object error yang ditangkap dari block cathh.
 * @param {string} defaultMessage - Pesan default jika tidak ada pesan error spesifik.
 * @returns {never} Fungsi ini selalu melempar error, tidak pernah mengembalikan nilai.
 */
export const handleError = (error, defaultMessage) => {
    if (error.response?.status === 401) {
        throw error;
    }

    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }

    if (error.message) {
        throw new Error(error.message);
    }

    throw new Error(defaultMessage);
}