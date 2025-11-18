import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
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
    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
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
        const doc = await documentService.getDocumentById(documentId, { signal });
        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan.");

        setDocumentTitle(doc.title);
        setDocumentVersionId(doc.currentVersion.id);

        const signedUrl = await documentService.getDocumentFileUrl(documentId, { signal });
        if (!signedUrl || !signedUrl.startsWith("http")) throw new Error("Format URL dokumen tidak valid.");

        setPdfFile(signedUrl);
      } catch (error) {
        if (error.name !== "CanceledError" && error.message !== "canceled") {
          console.error("Gagal memuat dokumen:", error);
          toast.error(error.message || "Gagal memuat dokumen.");
          setTimeout(() => navigate("/dashboard/documents"), 2000);
        }
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    };

    fetchDocument();
    return () => controller.abort();
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
    if (signatures.length === 0) return toast.error("Harap tempatkan setidaknya satu tanda tangan.");
    if (!documentVersionId) return toast.error("ID Versi Dokumen tidak ditemukan.");

    setIsLoading(true);

    const signatureToUse = signatures[0];

    const payload = {
      documentVersionId,
      method: "canvas",
      signatureImageUrl: signatureToUse.signatureImageUrl,
      positionX: signatureToUse.positionX,
      positionY: signatureToUse.positionY,
      pageNumber: signatureToUse.pageNumber,
      width: signatureToUse.width,
      height: signatureToUse.height,
      displayQrCode: includeQrCode,
    };

    try {
      await toast.promise(signatureService.addPersonalSignature(payload), {
        loading: "Menyimpan dan memproses tanda tangan digital...",
        success: <b>Dokumen berhasil ditandatangani dan diverifikasi! Anda akan dialihkan...</b>,
        error: (err) => {
          setIsLoading(false);
          return err.message || "Gagal menyimpan tanda tangan.";
        },
      });

      setTimeout(() => {
        setIsLoading(false);
        navigate(`/documents/${documentId}/view`);
      }, 3000);
    } catch (error) {
      console.error("Kesalahan fatal saat menyimpan:", error);
      setIsLoading(false);
    }
  }, [signatures, documentVersionId, documentId, navigate, includeQrCode]);

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

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
      {/* ✅ TOASTER LOKAL DITEMPATKAN DI SINI */}
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />

      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader theme={theme} toggleTheme={toggleTheme} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </header>

      <div className="absolute top-16 bottom-0 left-0 w-full flex overflow-hidden">
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

      {isSidebarOpen && !isLandscape && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}
      {isSignatureModalOpen && <SignatureModal onSave={handleSaveSignature} onClose={() => setIsSignatureModalOpen(false)} />}
    </div>
  );
};

export default SignDocumentPage;
