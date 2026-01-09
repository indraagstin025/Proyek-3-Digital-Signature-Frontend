import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract, FaExclamationTriangle } from 'react-icons/fa';

const TermsPage = () => {
  
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
          <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            {/* Menggunakan Icon FileContract untuk Syarat & Ketentuan */}
            <FaFileContract className="text-4xl text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Syarat & Ketentuan
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Persetujuan Syarat</h2>
            <p>
              Dengan mengakses atau menggunakan layanan WeSign, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. 
              Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, maka Anda tidak diizinkan untuk mengakses layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Akun Pengguna</h2>
            <p>
              Saat Anda membuat akun di WeSign, Anda harus memberikan informasi yang akurat, lengkap, dan terkini. 
              Kegagalan untuk melakukannya merupakan pelanggaran terhadap Syarat, yang dapat mengakibatkan penghentian akun Anda segera.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda.</li>
              <li>Anda tidak boleh menggunakan akun orang lain tanpa izin.</li>
              <li>Anda harus segera memberi tahu kami jika ada pelanggaran keamanan atau penggunaan akun Anda tanpa izin.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Penggunaan Layanan</h2>
            <p>
              Layanan kami memungkinkan Anda untuk menandatangani dokumen secara elektronik. Anda setuju untuk tidak menggunakan layanan ini untuk tujuan ilegal atau melanggar hukum apa pun.
            </p>
            
            {/* Alert Box untuk Peringatan Penting */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500 mt-4 flex gap-3">
              <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">Larangan Keras:</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Anda dilarang mengunggah dokumen yang mengandung virus, malware, atau konten yang melanggar hak kekayaan intelektual orang lain.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Batasan Tanggung Jawab</h2>
            <p>
              WeSign menyediakan layanan "sebagaimana adanya" (*as is*). Kami tidak menjamin bahwa layanan akan tidak terganggu atau bebas dari kesalahan. 
              Validitas hukum dari tanda tangan elektronik dapat bervariasi tergantung pada yurisdiksi dan jenis dokumen. 
              Pengguna bertanggung jawab penuh untuk memastikan dokumen yang ditandatangani memenuhi persyaratan hukum setempat.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Kekayaan Intelektual</h2>
            <p>
              Layanan dan konten aslinya (tidak termasuk Konten yang disediakan oleh pengguna), fitur, dan fungsionalitas adalah dan akan tetap menjadi milik eksklusif WeSign dan pemberi lisensinya. 
              Layanan ini dilindungi oleh hak cipta, merek dagang, dan hukum lainnya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Penghentian</h2>
            <p>
              Kami dapat menghentikan atau menangguhkan akses Anda segera, tanpa pemberitahuan atau kewajiban sebelumnya, 
              karena alasan apa pun, termasuk namun tidak terbatas pada jika Anda melanggar Syarat & Ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Perubahan Syarat</h2>
            <p>
              Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Syarat ini kapan saja. 
              Jika revisi bersifat material, kami akan mencoba memberikan pemberitahuan setidaknya 30 hari sebelum syarat baru berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Kontak</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami:
            </p>
            <a href="mailto:legal@wesign.com" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline block mt-2">
              legal@wesign.com
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

export default TermsPage;