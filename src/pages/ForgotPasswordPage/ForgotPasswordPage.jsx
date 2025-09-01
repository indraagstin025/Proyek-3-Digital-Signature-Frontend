// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setMessage('Jika email terdaftar, tautan reset password telah dikirimkan ke email Anda.');
        } catch (err) {
            console.error('Lupa password gagal:', err);
            // Menampilkan pesan error yang lebih umum untuk keamanan
            setError('Terjadi kesalahan. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center py-20 px-4">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-white/10">
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <Link to="/" className="text-3xl font-bold text-white">DigiSign.</Link>
                        <h1 className="text-2xl font-bold text-white mt-4">Lupa Password</h1>
                        <p className="text-gray-400">Masukkan email Anda untuk menerima tautan reset password.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Alamat Email</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                        {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105 duration-300"
                                disabled={loading}
                            >
                                {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Ingat password Anda?{' '}
                            <Link to="/login" className="font-semibold text-blue-400 hover:underline">Masuk di sini</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;