/**
 * Menangani error dari Axios secara terpusat.
 * Fungsi ini melempar kembali objek error terstruktur dari backend,
 * atau melempar Error baru jika formatnya tidak dikenal.
 * * @param {object} error - Object error yang ditangkap dari block catch.
 * @param {string} defaultMessage - Pesan default jika tidak ada pesan error spesifik.
 * @returns {never} Fungsi ini selalu melempar error.
 */
export const handleError = (error, defaultMessage = "Terjadi kesalahan") => {
    // 1. Lempar objek error terstruktur dari backend (misal: 400, 403, 404, 409)
    // Ini juga akan menangkap error 401 dan error jaringan dari interceptor Anda
    if (error.response?.data?.message) {
        // Lempar *seluruh objek* { code, message }, BUKAN new Error(message)
        throw error.response.data;
    }

    // 2. Fallback untuk error lain (misal: error.message tapi tidak ada .response)
    if (error.message) {
        throw new Error(error.message);
    }

    // 3. Fallback terakhir
    throw new Error(defaultMessage);
}