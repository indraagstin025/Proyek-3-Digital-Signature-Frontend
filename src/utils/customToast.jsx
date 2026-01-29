import toast from 'react-hot-toast';

/**
 * Custom Toast Utilities
 * Usage: import { showSuccess, showError } from '@/utils/customToast'
 */

// Success Toast (Gradient Hijau)
export const showSuccess = (message, options = {}) => {
    return toast.custom(
        (t) => (
            <div
                className={`
          bg-gradient-to-r from-emerald-500 to-lime-500
          text-white font-semibold
          px-6 py-4 rounded-xl shadow-lg
          flex items-center gap-3
          transform transition-all duration-300
          ${t.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}
            >
                <span className="text-2xl">✅</span>
                <span>{message}</span>
            </div>
        ),
        {
            duration: 3000,
            position: 'top-center',
            ...options,
        }
    );
};

// Error Toast (Gradient Merah)
export const showError = (message, options = {}) => {
    return toast.custom(
        (t) => (
            <div
                className={`
          bg-gradient-to-r from-red-500 to-rose-600
          text-white font-semibold
          px-6 py-4 rounded-xl shadow-lg
          flex items-center gap-3
          transform transition-all duration-300
          ${t.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}
            >
                <span className="text-2xl">❌</span>
                <span>{message}</span>
            </div>
        ),
        {
            duration: 3000,
            position: 'top-center',
            ...options,
        }
    );
};

// Warning Toast (Gradient Kuning)
export const showWarning = (message, options = {}) => {
    return toast.custom(
        (t) => (
            <div
                className={`
          bg-gradient-to-r from-amber-500 to-orange-500
          text-white font-semibold
          px-6 py-4 rounded-xl shadow-lg
          flex items-center gap-3
          transform transition-all duration-300
          ${t.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}
            >
                <span className="text-2xl">⚠️</span>
                <span>{message}</span>
            </div>
        ),
        {
            duration: 3000,
            position: 'top-center',
            ...options,
        }
    );
};

// Info Toast (Gradient Biru)
export const showInfo = (message, options = {}) => {
    return toast.custom(
        (t) => (
            <div
                className={`
          bg-gradient-to-r from-blue-500 to-indigo-600
          text-white font-semibold
          px-6 py-4 rounded-xl shadow-lg
          flex items-center gap-3
          transform transition-all duration-300
          ${t.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}
            >
                <span className="text-2xl">ℹ️</span>
                <span>{message}</span>
            </div>
        ),
        {
            duration: 3000,
            position: 'top-center',
            ...options,
        }
    );
};

// Login Success Toast (Special dengan nama user)
export const showLoginSuccess = (userName, options = {}) => {
    return toast.custom(
        (t) => (
            <div
                className={`
          bg-gradient-to-r from-blue-700 to-indigo-900
          text-white font-semibold
          px-6 py-4 rounded-xl shadow-lg
          flex items-center gap-3
          transform transition-all duration-300
          ${t.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}
            >
                <span className="text-2xl">👋</span>
                <div className="flex flex-col">
                    <span>Login berhasil!</span>
                    <span className="text-sm opacity-90">Selamat datang, {userName}!</span>
                </div>
            </div>
        ),
        {
            duration: 3000,
            position: 'top-center',
            ...options,
        }
    );
};

// Logout Toast
export const showLogoutSuccess = (options = {}) => {
    return toast.custom(
        (t) => (
            <div
                className={`
          bg-gradient-to-r from-slate-600 to-slate-800
          text-white font-semibold
          px-6 py-4 rounded-xl shadow-lg
          flex items-center gap-3
          transform transition-all duration-300
          ${t.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
        `}
            >
                <span className="text-2xl">👋</span>
                <span>Logout berhasil. Sampai jumpa!</span>
            </div>
        ),
        {
            duration: 2000,
            position: 'top-center',
            ...options,
        }
    );
};
