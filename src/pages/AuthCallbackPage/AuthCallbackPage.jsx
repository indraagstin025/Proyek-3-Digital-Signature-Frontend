// file: src/pages/AuthCallbackPage/AuthCallbackPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImSpinner9 } from "react-icons/im";
import { HiExclamationCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import authService from "../../services/authService";

/**
 * AuthCallbackPage - Menangkap token dari Supabase OAuth redirect
 * URL: /auth/callback
 * 
 * Flow:
 * 1. Supabase redirect ke /auth/callback#access_token=xxx&refresh_token=xxx
 * 2. Komponen ini extract token dari URL hash
 * 3. Kirim token ke backend untuk sync user
 * 4. Redirect ke dashboard
 */
const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const hasProcessedRef = useRef(false); // Prevent duplicate processing

    useEffect(() => {
        const processOAuthCallback = async () => {
            // Prevent duplicate processing (StrictMode runs effect twice)
            if (hasProcessedRef.current) return;
            hasProcessedRef.current = true;

            try {
                // 1. Extract token dari URL hash (Supabase mengirim di hash, bukan query)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get("access_token");
                const refreshToken = hashParams.get("refresh_token");

                // Fallback ke query params jika tidak ada di hash
                const queryAccessToken = searchParams.get("access_token");
                const queryRefreshToken = searchParams.get("refresh_token");

                const finalAccessToken = accessToken || queryAccessToken;
                const finalRefreshToken = refreshToken || queryRefreshToken;

                // 2. Validasi token
                if (!finalAccessToken || !finalRefreshToken) {
                    // Cek apakah ada error dari Supabase
                    const errorDescription = hashParams.get("error_description") || searchParams.get("error_description");
                    if (errorDescription) {
                        throw new Error(errorDescription);
                    }
                    throw new Error("Token autentikasi tidak ditemukan.");
                }

                // 3. Kirim token ke backend
                const { user } = await authService.googleCallback(finalAccessToken, finalRefreshToken);

                // 4. Success - check if there's a pending plan (from PricingPage)
                const pendingPlan = sessionStorage.getItem("pendingPlan");
                const pendingRedirect = pendingPlan ? "/pricing" : "/dashboard/shortcuts";

                toast.success(`Selamat datang, ${user.name}!`);

                // Clear hash dari URL sebelum redirect
                window.history.replaceState(null, "", window.location.pathname);

                navigate(pendingRedirect, { replace: true });

            } catch (err) {
                console.error("OAuth Callback Error:", err);
                setError(err.message || "Gagal login dengan Google.");
                setIsProcessing(false);
            }
        };

        processOAuthCallback();
    }, [navigate, searchParams]);

    // Error State
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiExclamationCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Login Gagal</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    // Loading State
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                <ImSpinner9 className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Memproses Login</h2>
                <p className="text-slate-600 dark:text-slate-400">Mohon tunggu sebentar...</p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
