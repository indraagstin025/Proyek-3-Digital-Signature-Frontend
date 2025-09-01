// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null); 

useEffect(() => {
  let tokenFromUrl = authService.getTokenFromUrl();
  if (tokenFromUrl) {
    sessionStorage.setItem("resetToken", tokenFromUrl);
    setToken(tokenFromUrl);
  } else {
    // coba ambil dari sessionStorage kalau halaman di-refresh
    const savedToken = sessionStorage.getItem("resetToken");
    if (savedToken) {
      setToken(savedToken);
    } else {
      setError("Tautan tidak valid atau sudah kedaluwarsa.");
    }
  }
}, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok.');
            return;
        }

        if (!token) {
            setError('Token tidak ditemukan.');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, newPassword);
            setMessage('Password berhasil diubah. Mengalihkan ke halaman login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Reset password gagal:', err);
            setError(err.message || 'Gagal mengubah password. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && !error) {
        return (
            <div className="flex justify-center items-center py-20 px-4">
                <div className="text-gray-400">Memuat...</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center py-20 px-4">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-white/10">
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <Link to="/" className="text-3xl font-bold text-white">DigiSign.</Link>
                        <h1 className="text-2xl font-bold text-white mt-4">Atur Ulang Password</h1>
                        <p className="text-gray-400">Masukkan password baru Anda.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">Password Baru</label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Konfirmasi Password Baru</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mt-1"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                        {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105 duration-300"
                            disabled={loading || !newPassword || newPassword !== confirmPassword}
                        >
                            {loading ? 'Mengubah...' : 'Ubah Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
