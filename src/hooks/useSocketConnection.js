import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';

/**
 * ✅ Custom Hook untuk Socket Connection Status
 * 
 * Memberikan informasi realtime tentang status koneksi socket,
 * dan fungsi untuk force reconnect.
 * 
 * @returns {Object} { isConnected, transport, forceReconnect, connectionInfo }
 * 
 * @example
 * const { isConnected, forceReconnect } = useSocketConnection();
 * 
 * if (!isConnected) {
 *   return <ReconnectBanner onRetry={forceReconnect} />;
 * }
 */
export const useSocketConnection = () => {
    const [connectionState, setConnectionState] = useState({
        isConnected: false,
        transport: null,
        error: null,
        reason: null,
    });

    useEffect(() => {
        // Subscribe ke connection changes
        const unsubscribe = socketService.onConnectionChange((state) => {
            setConnectionState({
                isConnected: state.connected,
                transport: state.transport || null,
                error: state.error || null,
                reason: state.reason || null,
            });
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    const forceReconnect = useCallback(() => {
        socketService.forceReconnect();
    }, []);

    return {
        isConnected: connectionState.isConnected,
        transport: connectionState.transport,
        error: connectionState.error,
        reason: connectionState.reason,
        forceReconnect,
        connectionInfo: socketService.getConnectionInfo(),
    };
};

export default useSocketConnection;
