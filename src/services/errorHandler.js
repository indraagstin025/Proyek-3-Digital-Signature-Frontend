import toast from "react-hot-toast";

/**
 * Menangani error dari Axios secara terpusat dengan support untuk quota/premium limit errors (Soft Lock).
 * Fungsi ini melempar kembali objek error terstruktur dari backend,
 * atau melempar Error baru jika formatnya tidak dikenal.
 *
 * Special handling untuk error terkait limit/quota/soft lock:
 * - 403 Forbidden = Soft Lock (user mencoba action CREATE tapi limit tercapai)
 * - Display toast dengan icon khusus untuk limit errors
 * - Error message dari backend sudah deskriptif dan bisa langsung ditampilkan user
 *
 * @param {object} error - Object error yang ditangkap dari block catch.
 * @param {string} defaultMessage - Pesan default jika tidak ada pesan error spesifik.
 * @param {boolean} showToast - Apakah show toast notification (default: true)
 * @returns {never} Fungsi ini selalu melempar error.
 */
export const handleError = (error, defaultMessage = "Terjadi kesalahan", showToast = false) => {
  // 0. Handle Network Errors
  if (error.code === "ERR_NETWORK" || error.message === "Network Error" || error.message === "Offline-Detected") {
    const netMessage = "Koneksi terputus. Gagal menghubungi server. Periksa internet Anda.";
    if (showToast) toast.error(netMessage, { icon: "📡" });
    throw new Error(netMessage);
  }

  // 1. Lempar objek error terstruktur dari backend (misal: 400, 403, 404, 409)
  // Ini juga akan menangkap error 401 dan error jaringan dari interceptor Anda
  if (error.response?.data?.message) {
    const errorData = error.response.data;
    const message = errorData.message || defaultMessage;
    const status = error.response?.status;

    // Show toast jika diminta dan error terkait quota/limit/soft lock
    if (showToast) {
      const isSoftLockError = status === 403; // 403 = Soft Lock (CREATE limit reached)
      const isLimitError =
        message.toLowerCase().includes("upgrade") || message.toLowerCase().includes("limit") || message.toLowerCase().includes("batas") || message.toLowerCase().includes("kapasitas") || message.toLowerCase().includes("penuh");

      if (isSoftLockError || isLimitError) {
        // Soft lock error - user mencoba CREATE tapi sudah mencapai limit
        toast.error(message, {
          duration: 5000,
          icon: "🔒", // Lock icon untuk soft lock
        });
      } else if (status === 403) {
        // 403 Forbidden - permission denied (bukan soft lock)
        toast.error(message, {
          duration: 4000,
          icon: "⛔",
        });
      }
    }

    // Lempar *seluruh objek* { code, message }, BUKAN new Error(message)
    throw errorData;
  }

  // 2. Fallback untuk error lain (misal: error.message tapi tidak ada .response)
  if (error.message) {
    if (showToast) {
      toast.error(error.message, { duration: 3000 });
    }
    throw new Error(error.message);
  }

  // 3. Fallback terakhir
  if (showToast) {
    toast.error(defaultMessage, { duration: 3000 });
  }
  throw new Error(defaultMessage);
};

/**
 * Helper untuk menangani error dengan menampilkan toast otomatis
 * Gunakan ini di catch block ketika Anda ingin langsung show error ke user
 *
 * Khusus untuk soft lock errors (403), akan menampilkan icon 🔒 dan durasi lebih panjang
 *
 * @param {object} error - Object error
 * @param {string} defaultMessage - Pesan default jika tidak ada pesan spesifik
 */
export const handleErrorWithToast = (error, defaultMessage = "Terjadi kesalahan") => {
  return handleError(error, defaultMessage, true);
};
