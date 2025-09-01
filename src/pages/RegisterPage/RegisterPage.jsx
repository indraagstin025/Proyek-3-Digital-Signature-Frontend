import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.register(name, email, password);
            console.log('Registrasi berhasil!');
            setIsRegistered(true);
        } catch (err) {
            console.error('Registrasi gagal:', err);
            setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (isRegistered) {
        // PERUBAHAN: Hapus kelas layout layar penuh, ganti dengan padding
        return (
            <div className="flex justify-center py-20 px-4 text-center">
                <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-white/10">
                    <h1 className="text-2xl font-bold text-white mb-4">Pendaftaran Berhasil!</h1>
                    <p className="text-gray-400 mb-6">
                        Silakan cek inbox email Anda untuk memverifikasi akun. Setelah verifikasi, Anda dapat login.
                    </p>
                    <Link to="/login" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105 duration-300 inline-block">
                        Kembali ke Halaman Login
                    </Link>
                </div>
            </div>
        );
    }

    // PERUBAHAN: Hapus kelas layout layar penuh, ganti dengan padding
    return (
        <div className="flex justify-center py-20 px-4">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl border border-white/10">
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <a href="#" className="text-3xl font-bold text-white">DigiSign.</a>
                        <h1 className="text-2xl font-bold text-white mt-4">Buat Akun Baru</h1>
                        <p className="text-gray-400">Bergabunglah bersama kami sekarang.</p>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nama Lengkap</label>
                            <div className="mt-1">
                                <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Alamat Email</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="pt-4">
                            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity transform hover:scale-105 duration-300" disabled={loading}>
                                {loading ? 'Memuat...' : 'Buat Akun'}
                            </button>
                        </div>
                    </form>
                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="mx-4 text-xs text-gray-400">ATAU</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>
                    <div>
                        <a href="#" className="w-full flex items-center justify-center gap-3 bg-white/10 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/20 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                                {/* PERUBAHAN: Path SVG Google diisi */}
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.22,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.783,44,30.886,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                            <span>Daftar dengan Google</span>
                        </a>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Sudah punya akun?
                            <Link to="/login" className="font-semibold text-blue-400 hover:underline">Login di sini</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;