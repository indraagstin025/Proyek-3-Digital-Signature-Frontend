import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaFilePdf, FaWifi, FaExclamationTriangle } from "react-icons/fa";
import { useSocketConnection } from "../../hooks/useSocketConnection";

const messages = [
    "Mempersiapkan dokumen...",
    "Menanamkan tanda tangan...",
    "Mengenkripsi data...",
    "Finalisasi dokumen...",
];

/**
 * Komponen Loading Cerdas Terpusat.
 * Menampilkan status proses dan mendeteksi kondisi offline secara otomatis.
 */
const ProcessStatus = ({ isOpen, customMessage }) => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Gunakan hook socket untuk deteksi deep disconnection (opsional, sebagai backup)
    const { isConnected } = useSocketConnection();

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        // Sinkronisasi dengan status socket jika navigator online tapi socket mati
        if (navigator.onLine && !isConnected) {
            // Opsional: Bisa dianggap offline atau 'Reconnecting'
            // Untuk saat ini kita percayakan navigator.onLine sebagai indikator utama koneksi internet
        }
    }, [isConnected]);

    useEffect(() => {
        if (!isOpen) {
            setMsgIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 1500);

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm transition-opacity duration-300">
            <div className="max-w-md w-full text-center p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 mx-4">

                {/* --- KONDISI OFFLINE --- */}
                {isOffline ? (
                    <div className="animate-pulse">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaWifi className="text-red-500 text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                            Koneksi Terputus
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                            Proses tertunda. Menunggu koneksi internet kembali...
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium">
                            <FaExclamationTriangle />
                            <span>Jangan tutup halaman ini</span>
                        </div>
                    </div>
                ) : (
                    /* --- KONDISI NORMAL (LANCAR) --- */
                    <div>
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            {/* Lingkaran Luar Statis */}
                            <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>

                            {/* Lingkaran Loading Berputar */}
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>

                            {/* Ikon PDF Berdenyut di Tengah */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaFilePdf className="text-blue-600 text-3xl animate-pulse" />
                            </div>
                        </div>

                        {/* Teks Status */}
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-all duration-300">
                            {customMessage || messages[msgIndex]}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Mohon jangan tutup halaman ini...
                        </p>
                    </div>
                )}
            </div>
        </div >,
        document.body
    );
};

export default ProcessStatus;
