import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import toast from "react-hot-toast";
import * as htmlToImage from 'html-to-image';
import { FaPen, FaKeyboard, FaUpload, FaEraser, FaTimes } from 'react-icons/fa';

const SignatureModal = ({ onSave, onClose }) => {
    const signaturePadRef = useRef(null);
    const typedSignatureRef = useRef(null);

    // STATE MANAGEMENT
    const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'type', 'upload'
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('font-dancing-script');
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleClear = () => {
        if (activeTab === 'draw' && signaturePadRef.current) {
            signaturePadRef.current.clear();
        }
    };

    const handleSave = async () => {
        switch (activeTab) {
            case 'draw':
                if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                    onSave(signaturePadRef.current.toDataURL('image/png'));
                } else {
                    toast.error('Silakan gambar tanda tangan Anda.');
                }
                break;
            case 'type':
                if (typedName.trim() === '') {
                    toast.error('Silakan ketik nama Anda.');
                    return;
                }
                if (typedSignatureRef.current) {
                    const dataUrl = await htmlToImage.toPng(typedSignatureRef.current);
                    onSave(dataUrl);
                }
                break;
            case 'upload':
                if (uploadedImage) {
                    onSave(uploadedImage);
                } else {
                    toast.error('Silakan unggah gambar tanda tangan.');
                }
                break;
            default:
                break;
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            toast.error('Harap unggah file PNG atau JPG.');
        }
    };

    const fonts = [
        { name: 'Dancing Script', className: 'font-dancing-script' },
        { name: 'Caveat', className: 'font-caveat' },
        { name: 'Sacramento', className: 'font-sacramento' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
                
                {/* HEADER */}
                <div className="relative p-5 text-center border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Buat Tanda Tangan</h3>
                    <button 
                        onClick={onClose} 
                        className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex justify-center gap-8 pt-4 pb-2">
                    <TabButton icon={<FaPen />} label="Gambar" isActive={activeTab === 'draw'} onClick={() => setActiveTab('draw')} />
                    <TabButton icon={<FaKeyboard />} label="Ketik" isActive={activeTab === 'type'} onClick={() => setActiveTab('type')} />
                    <TabButton icon={<FaUpload />} label="Unggah" isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
                </div>

                {/* CONTENT BODY */}
                <div className="p-6 min-h-[320px] flex flex-col justify-center bg-slate-50/50 dark:bg-slate-900/50">
                    
                    {/* --- TAB: DRAW --- */}
                    {activeTab === 'draw' && (
                        <div className="w-full flex flex-col gap-3">
                            {/* Canvas Area */}
                            <div className="relative w-full h-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm overflow-hidden hover:border-blue-400 transition-colors group">
                                <SignaturePad
                                    ref={signaturePadRef}
                                    options={{
                                        backgroundColor: 'rgba(255, 255, 255, 0)',
                                        penColor: 'black',
                                        minWidth: 1.5,
                                        maxWidth: 3.5,
                                    }}
                                    canvasProps={{
                                        className: 'w-full h-full cursor-crosshair block touch-none' // Tambahkan touch-none agar tidak scroll saat menggambar di HP
                                    }}
                                />
                                
                                <div className="absolute bottom-3 right-4 text-[10px] text-slate-300 select-none pointer-events-none">
                                    Sign Here
                                </div>
                                
                                {/* [FIX 1] Tombol Hapus Selalu Terlihat (Hapus opacity-0) */}
                                <button 
                                    onClick={handleClear}
                                    className="absolute top-3 right-3 p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 rounded-full shadow-sm border border-slate-200 dark:border-slate-600 transition-all hover:bg-red-50"
                                    title="Hapus / Ulangi"
                                >
                                    <FaEraser size={14} />
                                </button>
                            </div>
                            <p className="text-center text-xs text-slate-400">Gunakan mouse atau jari Anda untuk menggambar</p>
                        </div>
                    )}

                    {/* --- TAB: TYPE --- */}
                    {activeTab === 'type' && (
                        <div className="w-full flex flex-col items-center gap-6">
                            <input
                                type="text"
                                placeholder="Ketik nama Anda..."
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                className="w-full max-w-sm px-2 py-3 text-center text-xl bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none text-slate-800 dark:text-white transition-colors placeholder:text-slate-300"
                                autoFocus
                            />

                            {/* Preview Area */}
                            <div className="w-full max-w-sm h-40 flex items-center justify-center bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                                <div ref={typedSignatureRef} className="p-6 bg-transparent">
                                    {/* [FIX 2] Paksa warna hitam (text-slate-900) agar terlihat di kertas putih nanti */}
                                    <p className={`text-5xl text-slate-900 leading-tight ${selectedFont} whitespace-nowrap`}>
                                        {typedName || 'Pratinjau'}
                                    </p>
                                </div>
                            </div>

                            {/* Font Selection */}
                            <div className="flex gap-2 flex-wrap justify-center">
                                {fonts.map(font => (
                                    <button 
                                        key={font.className} 
                                        onClick={() => setSelectedFont(font.className)} 
                                        className={`px-4 py-1 text-sm rounded-full border transition-all ${selectedFont === font.className ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {font.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TAB: UPLOAD (Tetap Sama) --- */}
                    {activeTab === 'upload' && (
                        <div className="w-full h-64">
                            {uploadedImage ? (
                                <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 group overflow-hidden">
                                    <img src={uploadedImage} alt="Upload" className="max-h-full max-w-full object-contain p-4" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setUploadedImage(null)}
                                            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium shadow-lg hover:bg-slate-100"
                                        >
                                            Ganti Gambar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                                    <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-full mb-3 text-blue-500 group-hover:scale-110 transition-transform">
                                        <FaUpload size={24} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Klik untuk unggah</span>
                                    <span className="text-xs text-slate-400 mt-1">PNG atau JPG (Maks. 2MB)</span>
                                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all active:scale-95"
                    >
                        Simpan Tanda Tangan
                    </button>
                </div>
            </div>
        </div>
    );
};

// Minimalist Tab Button
const TabButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 pb-2 px-2 text-sm font-medium border-b-2 transition-all duration-200
            ${isActive
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
    >
        <span className="text-lg">{icon}</span>
        <span className="text-xs">{label}</span>
    </button>
);

export default SignatureModal;