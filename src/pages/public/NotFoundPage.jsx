import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <h1 className="text-6xl md:text-9xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
            <h2 className="text-2xl md:text-4xl font-bold mt-4">Halaman Tidak Ditemukan</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
            <Link 
                to="/" 
                className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
};

export default NotFoundPage;