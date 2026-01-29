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
            const { type, userId } = event.data;

            // [FIX] Hapus batasan timestamp 2 detik
            // Browser sering men-throttle background tab sehingga event baru diterima setelah >2 detik.
            // if (Date.now() - timestamp > 2000) return;

            console.log(`[AuthSync] Received ${type} from another tab.`);

            if (type === 'LOGIN_SUCCESS') {
                // Cek user saat ini
                const storedUser = localStorage.getItem("authUser");
                const currentUser = storedUser ? JSON.parse(storedUser) : null;

                // [FIX] Silent Sync: Jika user ID sama, tidak perlu reload (masalah ghost toast)
                if (currentUser && currentUser.id === userId) {
                    console.log("[AuthSync] Same user logged in via another tab. Syncing silently.");
                    // Opsional: Bisa trigger refetch data jika perlu, tapi tidak perlu reload penuh
                    return;
                }

                // Jika user berbeda atau belum login, lakukan reload/toast
                if (document.visibilityState === 'hidden') {
                    console.log("[AuthSync] Tab is hidden. Auto-reloading to sync session.");
                    window.location.reload();
                } else {
                    console.log("[AuthSync] Tab is visible. Showing toast instead of reload.");
                    toast.success("Sesi diperbarui di tab lain. Halaman akan dimuat ulang...", { duration: 3000 });
                    // Beri jeda sedikit sebelum reload agar user sempat baca
                    setTimeout(() => window.location.reload(), 2000);
                }
            } else if (type === 'LOGOUT_SUCCESS') {
                // [FIX] Cek apakah user masih login di tab ini
                // Jika sudah logout (localStorage kosong), skip toast (ini adalah tab yang logout sendiri)
                const currentUser = localStorage.getItem("authUser");

                if (!currentUser) {
                    console.log("[AuthSync] Already logged out in this tab. Skipping toast.");
                    return; // Skip, karena ini tab yang logout sendiri
                }

                // Jika masih ada user (tab lain), tampilkan toast dan reload
                if (document.visibilityState === 'hidden') {
                    window.location.reload();
                } else {
                    toast("Anda telah logout di tab lain.", { icon: '🔒' });
                    setTimeout(() => window.location.reload(), 2000);
                }
            }

            if (type === 'SESSION_EXPIRED') {
                window.dispatchEvent(new Event('sessionExpired'));
            }
        };

        return () => channel.close();
    }, []);

    // Helper function untuk mengirim sinyal
    const notifyAuthChange = (type, payload = {}) => {
        const channel = new BroadcastChannel('auth_channel');
        channel.postMessage({
            type,
            timestamp: Date.now(),
            ...payload
        });
        channel.close();
        console.log(`[AuthSync] Broadcast sent: ${type}`);
    };

    return { notifyAuthChange };
};
