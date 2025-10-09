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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

// Di dalam file SignDocumentPage.jsx

useEffect(() => {
    // ✅ 1. Siapkan AbortController
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDocument = async () => {
      if (!documentId) {
        toast.error("ID dokumen tidak valid.");
        navigate("/dashboard/documents");
        return;
      }

      try {
        setIsLoading(true);

        const doc = await documentService.getDocumentById(documentId);
        if (!doc || !doc.currentVersion?.id) {
          throw new Error("Dokumen tidak ditemukan.");
        }

        setDocumentTitle(doc.title);
        setDocumentVersionId(doc.currentVersion.id);

        // ✅ 2. Teruskan 'signal' ke service
        const signedUrl = await documentService.getDocumentFileUrl(documentId, { signal });
        
        if (!signedUrl || typeof signedUrl !== 'string' || !signedUrl.startsWith('http')) {
          throw new Error("Format URL dokumen tidak valid.");
        }

        setPdfFile(signedUrl);
      } catch (error) {
        // ✅ 3. Abaikan error jika itu adalah pembatalan yang disengaja
        if (error.name !== 'CanceledError' && error.message !== 'canceled') {
          console.error("Gagal memuat dokumen:", error);
          toast.error(error.message || "Gagal memuat dokumen.");
          setTimeout(() => navigate("/dashboard/documents"), 2000);
        }
      } finally {
        // ✅ 4. Cek apakah permintaan sudah dibatalkan sebelum update state
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDocument();

    // ✅ 5. Tambahkan cleanup function untuk membatalkan request
    return () => {
      console.log("🧹 Cleanup SignDocumentPage: Membatalkan fetch dokumen awal...");
      controller.abort();
    };
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

  // Di dalam file SignDocumentPage.jsx

const handleFinalSave = useCallback(async () => {
    if (signatures.length === 0) {
        return toast.error("Harap tempatkan setidaknya satu tanda tangan di dokumen.");
    }
    if (!documentVersionId) {
        return toast.error("ID Versi Dokumen tidak ditemukan. Gagal menyimpan.");
    }

    const toastId = toast.loading("Menyimpan dan memproses tanda tangan...");
    setIsLoading(true);
    try {
        const sig = signatures[0];
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

        toast.success("Dokumen berhasil ditandatangani! Melihat hasil...", { id: toastId, duration: 2000 });

 
        setTimeout(() => navigate(`/documents/${documentId}/view`), 2000);

    } catch (error) {
        let errorMessage = "Gagal menyimpan tanda tangan.";
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        toast.error(errorMessage);
        setIsLoading(false);
    }
}, [signatures, documentVersionId, documentId, navigate, includeQrCode]); 

  if (isLoading && !pdfFile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Dokumen...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      {/* Header tetap di atas */}
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader
          theme={theme}
          toggleTheme={toggleTheme}
          // Tambahkan tombol hamburger untuk mobile
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </header>

      <div className="absolute top-16 bottom-0 left-0 w-full flex overflow-hidden">
        {/* PDF Viewer akan mengambil sisa ruang */}
        <main className="flex-1 overflow-hidden">
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

        {/* Sidebar akan menjadi overlay di mobile atau di samping di desktop */}
        <SignatureSidebar
          savedSignatureUrl={savedSignatureUrl}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onSave={handleFinalSave}
          isLoading={isLoading}
          isPortrait={isPortrait} 
          includeQrCode={includeQrCode}
          setIncludeQrCode={setIncludeQrCode}
          isOpen={sidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Overlay hanya untuk mobile/portrait */}
      {isSidebarOpen && !isLandscape && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}

      {isSignatureModalOpen && <SignatureModal onSave={handleSaveSignature} onClose={() => setIsSignatureModalOpen(false)} />}
    </div>
  );
};

export default SignDocumentPage;
