import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import toast from "react-hot-toast";
import * as htmlToImage from 'html-to-image';
import { FaPen, FaKeyboard, FaUpload, FaEraser } from 'react-icons/fa'; // Menambahkan icon Eraser

const SignatureModal = ({ onSave, onClose }) => {
    const signaturePadRef = useRef(null);
    const typedSignatureRef = useRef(null);

    // 1. STATE MANAGEMENT
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
                    // Karena canvas sekarang kotak, hasil toDataURL akan otomatis kotak
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
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-slate-100 dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="p-6 pb-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">Buat Tanda Tangan</h3>
                    
                    {/* TAB BUTTONS */}
                    <div className="flex border-b border-slate-300 dark:border-slate-600 mb-4 justify-center">
                        <TabButton icon={<FaPen />} label="Gambar" isActive={activeTab === 'draw'} onClick={() => setActiveTab('draw')} />
                        <TabButton icon={<FaKeyboard />} label="Ketik" isActive={activeTab === 'type'} onClick={() => setActiveTab('type')} />
                        <TabButton icon={<FaUpload />} label="Unggah" isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
                    </div>
                </div>

                {/* CONTENT BODY (Scrollable if needed) */}
                <div className="p-6 pt-0 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-inner min-h-[300px] flex flex-col items-center justify-center">
                        
                        {/* --- BAGIAN DRAW (Diubah menjadi Persegi) --- */}
                        {activeTab === 'draw' && (
                            <div className="w-full flex flex-col items-center gap-2">
                                {/* Container dibuat Persegi (aspect-square).
                                    max-w-sm agar tidak terlalu lebar di layar besar (sekitar 384px).
                                */}
                                <div className="relative w-full max-w-sm aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white hover:border-blue-400 transition-colors">
                                    <SignaturePad
                                        ref={signaturePadRef}
                                        options={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0)', // Transparan agar menyatu
                                            penColor: '#000000',
                                            minWidth: 1.5,
                                            maxWidth: 3.5, 
                                        }}
                                        canvasProps={{ 
                                            // Canvas dipaksa memenuhi container persegi
                                            className: 'w-full h-full cursor-crosshair block' 
                                        }}
                                    />
                                    <div className="absolute bottom-2 right-2 text-xs text-slate-400 pointer-events-none select-none">
                                        Area Tanda Tangan
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">Tanda tangan di dalam kotak di atas</p>
                            </div>
                        )}

                        {/* --- BAGIAN TYPE --- */}
                        {activeTab === 'type' && (
                            <div className="w-full flex flex-col items-center justify-center gap-6">
                                <input
                                    type="text"
                                    placeholder="Ketik nama Anda..."
                                    value={typedName}
                                    onChange={(e) => setTypedName(e.target.value)}
                                    className="w-full max-w-sm px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                
                                {/* Preview Area Persegi Panjang (sesuai teks) tapi dibungkus rapi */}
                                <div className="w-full max-w-sm h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <div ref={typedSignatureRef} className="p-4 bg-transparent">
                                        <p className={`text-5xl text-black dark:text-white leading-tight ${selectedFont}`}>
                                            {typedName || 'Pratinjau'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- BAGIAN UPLOAD --- */}
                        {activeTab === 'upload' && (
                            <div className="w-full h-64 flex items-center justify-center">
                                {uploadedImage ? (
                                    <div className="relative group w-full h-full flex items-center justify-center">
                                        <img src={uploadedImage} alt="Pratinjau" className="max-h-full max-w-full object-contain p-2" />
                                        <button 
                                            onClick={() => setUploadedImage(null)}
                                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-medium"
                                        >
                                            Ganti Gambar
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <FaUpload size={32} className="text-slate-400 mb-3" />
                                        <span className="text-slate-500 font-medium">Klik untuk unggah gambar</span>
                                        <span className="text-slate-400 text-xs mt-1">(PNG, JPG)</span>
                                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FONT SELECTION (Hanya untuk Type) */}
                    {activeTab === 'type' && (
                        <div className="mt-4 flex justify-center gap-2 flex-wrap">
                            {fonts.map(font => (
                                <button key={font.className} onClick={() => setSelectedFont(font.className)} className={`px-3 py-1.5 text-sm rounded-full border transition-all ${font.className} ${selectedFont === font.className ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                        Batal
                    </button>
                    <div className="flex gap-3">
                        {activeTab === 'draw' && (
                            <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                <FaEraser /> Hapus
                            </button>
                        )}
                        <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200
            ${isActive
                ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:text-slate-300 dark:hover:bg-slate-700/50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default SignatureModal;