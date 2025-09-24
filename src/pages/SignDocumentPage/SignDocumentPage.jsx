import React, { useState, useEffect } from 'react';
import SignatureSidebar from '../../components/SignatureSidebar/SignatureSidebar';
import SignatureModal from '../../components/SignatureModal/SignatureModal';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import SigningHeader from '../../components/SigningHeader/SigningHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { signatureService } from '../../services/signatureService'; // Impor signatureService
import toast from 'react-hot-toast';

const SignDocumentPage = ({ theme, toggleTheme }) => {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    
    const [pdfFile, setPdfFile] = useState(null);
    const [documentVersionId, setDocumentVersionId] = useState(null); // Akan kita gunakan
    const [documentTitle, setDocumentTitle] = useState("Memuat..."); // Akan kita gunakan
    const [signatures, setSignatures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setIsLoading(true);
                const doc = await documentService.getDocumentById(documentId);

                if (doc && doc.currentVersion) {
                    setPdfFile(doc.currentVersion.url);
                    setDocumentVersionId(doc.currentVersion.id);
                    setDocumentTitle(doc.title);
                } else {
                    throw new Error("Data dokumen atau versi tidak valid.");
                }
            } catch (error) {
                toast.error(error.message || "Gagal memuat dokumen.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocument();
    }, [documentId]);

    const handleSaveSignature = (dataUrl) => {
        setSavedSignatureUrl(dataUrl);
        setIsSignatureModalOpen(false);
    };

    const handleAddSignature = (newSignature) => {
        setSignatures(prev => [...prev, newSignature]);
    };
    const handleUpdateSignature = (updatedSignature) => {
        setSignatures(prev => prev.map(sig => sig.id === updatedSignature.id ? updatedSignature : sig));
    };
    const handleDeleteSignature = (signatureId) => {
        setSignatures(prev => prev.filter(sig => sig.id !== signatureId));
    };

    // ✅ FUNGSI INI SEKARANG DIIMPLEMENTASIKAN SEPENUHNYA
    const handleFinalSave = async () => {
        if (signatures.length === 0) {
            return toast.error("Harap tempatkan setidaknya satu tanda tangan di dokumen.");
        }
        if (!documentVersionId) {
            return toast.error("ID Versi Dokumen tidak ditemukan. Gagal menyimpan.");
        }

        setIsLoading(true);
        try {
            // Loop melalui setiap tanda tangan yang ditempatkan di state
            for (const sig of signatures) {
                const payload = {
                    documentVersionId: documentVersionId, // <-- Menggunakan state documentVersionId
                    method: 'canvas',
                    signatureImageUrl: sig.signatureImageUrl,
                    positionX: sig.positionX, // Koordinat asli dari PDFViewer
                    positionY: sig.positionY,
                    pageNumber: sig.pageNumber,
                };
                // Kirim setiap tanda tangan ke backend
                await signatureService.addPersonalSignature(payload);
            }

            toast.success("Dokumen berhasil ditandatangani! Anda akan dialihkan.");
            // Arahkan pengguna kembali ke dashboard setelah 2 detik
            setTimeout(() => navigate('/dashboard'), 2000);

        } catch (error) {
            toast.error(error.message || "Gagal menyimpan tanda tangan.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !pdfFile) {
        return <div className="flex h-screen items-center justify-center bg-gray-800 text-white">Memuat Dokumen...</div>
    }
  
 return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-800">
            <SigningHeader
                documentTitle={documentTitle}
                onSave={handleFinalSave}
                isLoading={isLoading}
                theme={theme}
                toggleTheme={toggleTheme}
            />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 flex justify-center overflow-auto">
                    {pdfFile && (
                        <PDFViewer
                            fileUrl={pdfFile}
                            signatures={signatures}
                            onAddSignature={handleAddSignature}
                            onUpdateSignature={handleUpdateSignature}
                            onDeleteSignature={handleDeleteSignature}
                            savedSignatureUrl={savedSignatureUrl}
                        />
                    )}
                </main>

                {/* ✅ PERBAIKAN: Teruskan fungsi handleFinalSave ke Sidebar */}
                <SignatureSidebar 
                    savedSignatureUrl={savedSignatureUrl}
                    onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                    onSave={handleFinalSave}
                    isLoading={isLoading}
                />
            </div>
            
            {isSignatureModalOpen && (
                <SignatureModal 
                    onSave={handleSaveSignature}
                    onClose={() => setIsSignatureModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SignDocumentPage;


