import React from 'react';
import { useSocketConnection } from '../../hooks/useSocketConnection';
import { IoWifi, IoWifiOutline, IoRefresh } from 'react-icons/io5';
import './ConnectionStatus.css';

/**
 * ✅ Komponen untuk menampilkan status koneksi socket
 * 
 * Menampilkan:
 * - Banner reconnecting ketika koneksi terputus
 * - Tombol manual reconnect
 * 
 * @example
 * // Di App.jsx atau layout utama
 * <ConnectionStatus />
 */
const ConnectionStatus = () => {
    const { isConnected, forceReconnect, reason, error } = useSocketConnection();
    const [showBanner, setShowBanner] = React.useState(false);

    React.useEffect(() => {
        if (isConnected) {
            setShowBanner(false);
            return;
        }

        // Jika disconnected, tunggu 5 detik sebelum menampilkan banner
        // Ini mencegah flashing saat refresh page atau transport upgrade dan toleransi sinyal mobile lemah
        const timer = setTimeout(() => {
            setShowBanner(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isConnected]);

    // Jika connected atau belum melewati grace period, sembunyikan
    if (isConnected || !showBanner) {
        return null;
    }

    console.log("[ConnectionStatus] Rendering Banner. Reason:", reason, "Error:", error);

    // Tentukan pesan berdasarkan reason
    const getMessage = () => {
        if (reason === 'offline') {
            return 'Tidak ada koneksi internet';
        }
        if (error?.includes('Authentication')) {
            return 'Sesi Anda telah berakhir.';
        }
        return 'Koneksi terputus. Mencoba menyambung kembali...';
    };

    return (
        <div className="connection-status-banner">
            <div className="connection-status-content">
                <div className="connection-status-icon">
                    <IoWifiOutline className="wifi-icon disconnected" />
                </div>
                <span className="connection-status-message">
                    {getMessage()}
                </span>
                <div className="flex gap-2">
                    <button
                        className="connection-status-retry"
                        onClick={forceReconnect}
                        title="Coba sambungkan kembali"
                    >
                        <IoRefresh className="refresh-icon" />
                        <span>Coba Lagi</span>
                    </button>
                    {/* Tombol Reload untuk solusi pamungkas jika cookie/socket nyangkut */}
                    <button
                        className="connection-status-retry"
                        style={{ backgroundColor: '#dc2626' }} // Merah untuk refresh hard
                        onClick={() => window.location.reload()}
                        title="Muat ulang halaman"
                    >
                        <IoRefresh className="refresh-icon" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * ✅ Komponen indikator kecil untuk header/sidebar
 * Hanya menampilkan icon status tanpa banner
 */
export const ConnectionIndicator = () => {
    const { isConnected, forceReconnect } = useSocketConnection();

    return (
        <button
            className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}
            onClick={!isConnected ? forceReconnect : undefined}
            title={isConnected ? 'Terhubung' : 'Terputus - Klik untuk reconnect'}
        >
            {isConnected ? (
                <IoWifi className="indicator-icon connected" />
            ) : (
                <IoWifiOutline className="indicator-icon disconnected" />
            )}
        </button>
    );
};

export default ConnectionStatus;
