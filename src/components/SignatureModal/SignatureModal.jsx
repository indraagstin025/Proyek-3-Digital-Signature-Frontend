import React, { useRef } from 'react';
// 1. Impor komponen dari library wrapper
import SignaturePad from 'react-signature-pad-wrapper';

/**
 * Komponen modal untuk membuat tanda tangan.
 * @param {object} props
 * @param {function} props.onSave - Fungsi yang dipanggil saat TTD disimpan, mengirimkan data URL (Base64).
 * @param {function} props.onClose - Fungsi untuk menutup modal.
 */
const SignatureModal = ({ onSave, onClose }) => {
  // Kita hanya butuh satu ref sekarang, untuk mengakses instance komponen SignaturePad
  const signaturePadRef = useRef(null);

  // 2. Tidak perlu lagi useEffect untuk inisialisasi manual!

  const handleClear = () => {
    // Akses metode `clear` langsung dari ref
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      // Ambil data gambar sebagai string Base64 PNG
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      onSave(dataUrl); // Kirim data kembali ke komponen induk
    } else {
      alert('Silakan buat tanda tangan Anda terlebih dahulu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg border border-white/10">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Buat Tanda Tangan Anda</h3>
          {/* 3. Gunakan komponen <SignaturePad /> di sini */}
          <div className="bg-white rounded-lg overflow-hidden">
            <SignaturePad
              ref={signaturePadRef}
              options={{ 
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)'
              }}
              // Wrapper ini akan membuat canvas secara otomatis
              // Kita bisa memberinya class untuk styling
              canvasProps={{
                className: 'w-full h-48'
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 p-4 bg-gray-900/50 rounded-b-xl">
          <button onClick={onClose} className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg transition-colors">Batal</button>
          <button onClick={handleClear} className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-lg transition-colors">Hapus</button>
          <button onClick={handleSave} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors">Gunakan</button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;