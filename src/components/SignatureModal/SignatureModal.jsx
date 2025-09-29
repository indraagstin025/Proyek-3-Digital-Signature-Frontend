import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import toast from "react-hot-toast";
import * as htmlToImage from 'html-to-image'; // Import library baru

// Impor ikon untuk tab
import { FaPen, FaKeyboard, FaUpload } from 'react-icons/fa';

const SignatureModal = ({ onSave, onClose }) => {
    const signaturePadRef = useRef(null);
    const typedSignatureRef = useRef(null); // Ref untuk pratinjau teks

    // 1. STATE MANAGEMENT
    const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'type', 'upload'
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('font-dancing-script'); // Font default
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
                    // Konversi elemen HTML pratinjau menjadi gambar
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-100 dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Buat Tanda Tangan</h3>
                    
                    {/* 2. UI: TAB BUTTONS */}
                    <div className="flex border-b border-slate-300 dark:border-slate-600 mb-4">
                        <TabButton icon={<FaPen />} label="Gambar" isActive={activeTab === 'draw'} onClick={() => setActiveTab('draw')} />
                        <TabButton icon={<FaKeyboard />} label="Ketik" isActive={activeTab === 'type'} onClick={() => setActiveTab('type')} />
                        <TabButton icon={<FaUpload />} label="Unggah" isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
                    </div>

                    {/* 3. UI: CONDITIONAL CONTENT */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-2">
                        {activeTab === 'draw' && (
                            <SignaturePad
                                ref={signaturePadRef}
                                options={{ backgroundColor: '#FFFFFF', penColor: '#000000' }}
                                canvasProps={{ className: 'w-full h-48 rounded-md' }}
                            />
                        )}
                        {activeTab === 'type' && (
                            <div className="w-full h-48 flex flex-col items-center justify-center">
                                <input
                                    type="text"
                                    placeholder="Ketik nama Anda di sini..."
                                    value={typedName}
                                    onChange={(e) => setTypedName(e.target.value)}
                                    className="w-full px-3 py-2 border-b-2 border-slate-300 dark:border-slate-600 bg-transparent text-center text-2xl focus:outline-none focus:border-blue-500 mb-4"
                                />
                                <div ref={typedSignatureRef} className="p-2">
                                    <p className={`text-5xl text-black ${selectedFont}`}>
                                        {typedName || 'Pratinjau'}
                                    </p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'upload' && (
                            <div className="w-full h-48 flex items-center justify-center">
                                {uploadedImage ? (
                                    <img src={uploadedImage} alt="Pratinjau" className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <label className="cursor-pointer text-center text-slate-500">
                                        <FaUpload size={32} className="mx-auto mb-2" />
                                        Klik untuk memilih file...
                                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                     {activeTab === 'type' && (
                        <div className="mt-4 flex justify-center gap-2">
                            {fonts.map(font => (
                                <button key={font.className} onClick={() => setSelectedFont(font.className)} className={`px-4 py-2 text-sm rounded-md ${font.className} ${selectedFont === font.className ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 p-4 bg-slate-200/50 dark:bg-slate-900/50 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white transition-colors">Batal</button>
                    {activeTab === 'draw' && <button onClick={handleClear} className="px-5 py-2 text-sm font-semibold rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors">Hapus</button>}
                    <button onClick={handleSave} className="px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Gunakan Tanda Tangan</button>
                </div>
            </div>
        </div>
    );
};

// Komponen helper untuk tombol Tab
const TabButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors
            ${isActive
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
    >
        {icon}
        {label}
    </button>
);


export default SignatureModal;