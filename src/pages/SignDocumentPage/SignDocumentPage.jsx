import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

import { documentService } from "../../services/documentService";
import { signatureService } from "../../services/signatureService";

import SigningHeader from "../../components/SigningHeader/SigningHeader";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../../components/SignatureModal/SignatureModal";
import PDFViewer from "../../components/PDFViewer/PDFViewer";


const SignDocumentPage = ({ theme, toggleTheme }) => {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [documentTitle, setDocumentTitle] = useState("Memuat...");
    const [pdfFile, setPdfFile] = useState(null);
    const [documentVersionId, setDocumentVersionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [signatures, setSignatures] = useState([]);
    const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    // 1. State baru untuk mengontrol opsi QR code
    const [includeQrCode, setIncludeQrCode] = useState(true);

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
                setTimeout(() => navigate("/dashboard/documents"), 2000);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocument();
    }, [documentId, navigate]);

    const handleSaveSignature = useCallback((dataUrl) => {
        setSavedSignatureUrl(dataUrl);
        setIsSignatureModalOpen(false);
    }, []);

    const handleAddSignature = useCallback((newSignature) => {
        setSignatures((prev) => [...prev, newSignature]);
    }, []);

    const handleUpdateSignature = useCallback((updatedSignature) => {
        setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));
    }, []);

    const handleDeleteSignature = useCallback((signatureId) => {
        setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
    }, []);

    const handleFinalSave = useCallback(async () => {
        if (signatures.length === 0) {
            return toast.error("Harap tempatkan setidaknya satu tanda tangan di dokumen.");
        }
        if (!documentVersionId) {
            return toast.error("ID Versi Dokumen tidak ditemukan. Gagal menyimpan.");
        }
        setIsLoading(true);
        try {
            // Asumsi saat ini hanya satu TTD per request
            const sig = signatures[0]; 

            // 2. Tambahkan 'displayQrCode' ke dalam payload yang dikirim ke backend
            const payload = {
                documentVersionId,
                method: "canvas",
                signatureImageUrl: sig.signatureImageUrl,
                positionX: sig.positionX,
                positionY: sig.positionY,
                pageNumber: sig.pageNumber,
                width: sig.width,
                height: sig.height,
                displayQrCode: includeQrCode,
            };

            await signatureService.addPersonalSignature(payload);
            
            toast.success("Dokumen berhasil ditandatangani! Anda akan dialihkan.");
            setTimeout(() => navigate("/dashboard/documents", { state: { refresh: true } }), 2000);
        } catch (error) {

              console.log("🔥 FULL ERROR OBJECT:", error);
  console.log("🔥 RESPONSE DATA:", error.response?.data);

    let errorMessage = "Gagal menyimpan tanda tangan."; // Pesan default

    if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
    } else if (error.message) {
        errorMessage = error.message;
    }

    toast.error(errorMessage);
            setIsLoading(false);
        }
    }, [signatures, documentVersionId, navigate, includeQrCode]); // 3. Tambahkan 'includeQrCode' ke dependency array

    if (isLoading && !pdfFile) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
                <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Dokumen...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-200 dark:bg-slate-900">
            <header className="fixed top-0 left-0 right-0 h-16 z-50">
                <SigningHeader theme={theme} toggleTheme={toggleTheme} />
            </header>

            <aside className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-96 z-40">
                <SignatureSidebar
                    savedSignatureUrl={savedSignatureUrl}
                    onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                    onSave={handleFinalSave}
                    isLoading={isLoading}
                    // 4. Teruskan state dan setter-nya sebagai props ke Sidebar
                    includeQrCode={includeQrCode}
                    setIncludeQrCode={setIncludeQrCode}
                />
            </aside>

            <main className="h-full pt-16 pr-96">
                {pdfFile && (
                    <PDFViewer
                        documentTitle={documentTitle}
                        fileUrl={pdfFile}
                        signatures={signatures}
                        onAddSignature={handleAddSignature}
                        onUpdateSignature={handleUpdateSignature}
                        onDeleteSignature={handleDeleteSignature}
                        savedSignatureUrl={savedSignatureUrl}
                    />
                )}
            </main>

            {isSignatureModalOpen && <SignatureModal onSave={handleSaveSignature} onClose={() => setIsSignatureModalOpen(false)} />}
        </div>
    );
};

export default SignDocumentPage;