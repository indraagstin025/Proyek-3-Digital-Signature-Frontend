import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const PrivacyPolicyPage = () => {
  
  // Scroll ke atas saat halaman dibuka
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Header Dokumen */}
      <div className="max-w-4xl mx-auto mb-12">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6 font-medium transition-colors">
          <FaArrowLeft className="mr-2" /> Kembali ke Beranda
        </Link>
        
        <div className="text-center">
          <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <FaShieldAlt className="text-4xl text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Kebijakan Privasi
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Pendahuluan</h2>
            <p>
              Selamat datang di WeSign ("kami"). Kami berkomitmen untuk melindungi informasi pribadi Anda dan hak privasi Anda. 
              Jika Anda memiliki pertanyaan atau masalah tentang kebijakan ini, atau praktik kami terkait informasi pribadi Anda, 
              silakan hubungi kami.
            </p>
            <p>
              Saat Anda mengunjungi website kami dan menggunakan layanan kami, Anda mempercayakan informasi pribadi Anda kepada kami. 
              Kami menjaga privasi Anda dengan sangat serius.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela kepada kami saat Anda mendaftar di layanan kami, tertarik untuk memperoleh informasi tentang kami atau produk dan layanan kami.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Informasi Pribadi:</strong> Nama, alamat email, nomor telepon, dan data kontak lainnya.</li>
              <li><strong>Dokumen:</strong> File PDF yang Anda unggah untuk ditandatangani (dienkripsi).</li>
              <li><strong>Data Tanda Tangan:</strong> Gambar tanda tangan digital yang Anda buat.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Penggunaan Cookie</h2>
            <p>
              Kami menggunakan cookie dan teknologi pelacakan serupa (seperti web beacon dan piksel) untuk mengakses atau menyimpan informasi. 
              Informasi spesifik tentang bagaimana kami menggunakan teknologi tersebut dan bagaimana Anda dapat menolak cookie tertentu diuraikan dalam Pemberitahuan Cookie kami.
            </p>
            <div className="bg-blue-50 dark:bg-slate-700/50 p-4 rounded-lg border-l-4 border-blue-500 mt-4">
              <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">Jenis Cookie yang kami gunakan:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><strong>Cookie Penting:</strong> Diperlukan agar website berfungsi (misal: login).</li>
                <li><strong>Cookie Analitik:</strong> Membantu kami memahami bagaimana pengguna berinteraksi dengan website.</li>
                <li><strong>Cookie Fungsional:</strong> Mengingat preferensi Anda (misal: mode gelap/terang).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Keamanan Data</h2>
            <p>
              Kami telah menerapkan langkah-langkah keamanan teknis dan organisasi yang memadai untuk melindungi keamanan informasi pribadi apa pun yang kami proses. 
              Namun, harap diingat bahwa kami tidak dapat menjamin internet itu sendiri 100% aman.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Hak Privasi Anda</h2>
            <p>
              Tergantung pada hukum yang berlaku, Anda mungkin memiliki hak untuk mengakses dan memperoleh salinan informasi pribadi Anda, 
              meminta perbaikan atau penghapusan, dan membatasi pemrosesan informasi pribadi Anda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan atau komentar tentang kebijakan ini, Anda dapat mengirim email kepada kami di:
            </p>
            <a href="mailto:support@wesign.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline block mt-2">
              support@wesign.com
            </a>
          </section>

        </div>
      </div>

      {/* Footer Sederhana */}
      <div className="max-w-4xl mx-auto mt-12 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} WeSign. Hak cipta dilindungi undang-undang.
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;