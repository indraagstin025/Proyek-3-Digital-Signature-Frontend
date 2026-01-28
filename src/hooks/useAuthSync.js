import { useEffect } from 'react';

/**
 * Hook untuk sinkronisasi status login antar tab browser.
 * Menggunakan BroadcastChannel untuk komunikasi yang lebih reliable.
 */
export const useAuthSync = () => {
    useEffect(() => {
        // 1. Buat Channel Komunikasi
        const channel = new BroadcastChannel('auth_channel');

        // 2. Listen pesan dari tab lain
        channel.onmessage = (event) => {
            const { type } = event.data;

            if (type === 'LOGIN_SUCCESS' || type === 'LOGOUT_SUCCESS') {
                console.log(`[AuthSync] Received ${type} from another tab. Reloading...`);
                // Force reload untuk memastikan state bersih dan cookie terbaru terbaca
                window.location.reload();
            }

            if (type === 'SESSION_EXPIRED') {
                // Opsional: Bisa trigger modal session expired tanpa reload
                window.dispatchEvent(new Event('sessionExpired'));
            }
        };

        // 3. Cleanup
        return () => {
            channel.close();
        };
    }, []);

    // Helper function untuk mengirim sinyal (dipanggil saat login/logout)
    const notifyAuthChange = (type) => {
        const channel = new BroadcastChannel('auth_channel');
        channel.postMessage({ type }); // type: 'LOGIN_SUCCESS' | 'LOGOUT_SUCCESS'
        channel.close();
    };

    return { notifyAuthChange };
};
