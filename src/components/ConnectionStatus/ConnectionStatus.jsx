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

    // Jika connected, tidak perlu tampilkan apa-apa
    if (isConnected) {
        return null;
    }

    console.log("[ConnectionStatus] Rendering Banner. Reason:", reason, "Error:", error);

    // Tentukan pesan berdasarkan reason
    const getMessage = () => {
        if (reason === 'offline') {
            return 'Tidak ada koneksi internet';
        }
        if (error?.includes('Authentication')) {
            return 'Sesi Anda telah berakhir. Silakan refresh halaman.';
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
                <button
                    className="connection-status-retry"
                    onClick={forceReconnect}
                    title="Coba sambungkan kembali"
                >
                    <IoRefresh className="refresh-icon" />
                    <span>Coba Lagi</span>
                </button>
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
