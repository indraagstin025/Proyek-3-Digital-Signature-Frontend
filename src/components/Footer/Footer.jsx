import React from 'react';

const Footer = () => {
  return (
    // 1. Tambahkan bg-gray-900 untuk warna latar
    // 2. Kurangi margin atas menjadi mt-16 agar tidak terlalu jauh
    <footer className="bg-gray-900 border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-400">
        <p className="text-sm">&copy; 2025 DigiSign. Platform Tanda Tangan Digital Modern.</p>
      </div>
    </footer>
  );
};

export default Footer;