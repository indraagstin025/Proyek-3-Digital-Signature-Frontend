import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook untuk sinkronisasi status login antar tab browser.
 * Menggunakan BroadcastChannel & Visibility API untuk mencegah reload loop.
 */
export const useAuthSync = () => {
    useEffect(() => {
        const channel = new BroadcastChannel('auth_channel');

        channel.onmessage = (event) => {
            const { type, timestamp } = event.data;

            // Hiraukan pesan yg sudah usang (> 2 detik)
            if (Date.now() - timestamp > 2000) return;

            console.log(`[AuthSync] Received ${type} from another tab.`);

            if (type === 'LOGIN_SUCCESS' || type === 'LOGOUT_SUCCESS') {
                // Skema Aman:
                // 1. Jika tab sedang TIDAK DILIHAT (Hidden) -> Auto Reload
                // 2. Jika tab sedang DILIHAT (Visible) -> Tampilkan Notifikasi (hindari kaget/loop)

                if (document.visibilityState === 'hidden') {
                    console.log("[AuthSync] Tab is hidden. Auto-reloading to sync session.");
                    window.location.reload();
                } else {
                    console.log("[AuthSync] Tab is visible. Showing toast instead of reload.");
                    if (type === 'LOGIN_SUCCESS') {
                        toast.success("Sesi diperbarui di tab lain. Halaman akan dimuat ulang...", { duration: 3000 });
                        // Beri jeda sedikit sebelum reload agar user sempat baca
                        setTimeout(() => window.location.reload(), 2000);
                    } else {
                        toast("Anda telah logout di tab lain.", { icon: '🔒' });
                        setTimeout(() => window.location.reload(), 2000);
                    }
                }
            }

            if (type === 'SESSION_EXPIRED') {
                window.dispatchEvent(new Event('sessionExpired'));
            }
        };

        return () => channel.close();
    }, []);

    // Helper function untuk mengirim sinyal
    const notifyAuthChange = (type) => {
        const channel = new BroadcastChannel('auth_channel');
        channel.postMessage({
            type,
            timestamp: Date.now()
        });
        channel.close();
        console.log(`[AuthSync] Broadcast sent: ${type}`);
    };

    return { notifyAuthChange };
};
