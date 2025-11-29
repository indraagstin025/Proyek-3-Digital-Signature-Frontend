import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { documentService } from "../../services/documentService.js";
import { signatureService } from "../../services/signatureService.js";
import SigningHeader from "../../components/SigningHeader/SigningHeader.jsx";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar.jsx";
import SignatureModal from "../../components/SignatureModal/SignatureModal.jsx";
import PDFViewer from "../../components/shared/PDFViewer.jsx";
import AiAnalysisModal from "../../components/AiAnalysisModal/AiAnalysisModal.jsx";

const SignDocumentPage = ({ theme, toggleTheme }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState("Memuat...");
  const [pdfFile, setPdfFile] = useState(null);
  const [documentVersionId, setDocumentVersionId] = useState(null);
  
  // Loading state terpisah
  const [isLoadingDoc, setIsLoadingDoc] = useState(true); // Load Dokumen
  const [isSaving, setIsSaving] = useState(false);        // Simpan Tanda Tangan
  const [isAnalyzing, setIsAnalyzing] = useState(false);  // AI Auto Tag / Analyze

  const [signatures, setSignatures] = useState([]);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);
  
  // State AI Analysis Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiData, setAiData] = useState(null);

  // ... useEffect Orientasi (sama) ...
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
        setIsLoadingDoc(true);
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
        if (!signal.aborted) setIsLoadingDoc(false);
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

  // --- HANDLER AI AUTO TAG ---
  const handleAutoTag = useCallback(async () => {
    if (!documentId) return;

    const confirm = window.confirm("AI akan memindai dokumen dan menempatkan area tanda tangan secara otomatis. Lanjutkan?");
    if (!confirm) return;

    setIsAnalyzing(true);
    const toastId = toast.loading("🤖 AI sedang membaca dokumen...");

    try {
      const result = await signatureService.autoTagDocument(documentId);
      
      if (result.data && result.data.length > 0) {
        const aiSignatures = result.data.map(sig => ({
          id: sig.id, 
          pageNumber: sig.pageNumber,
          positionX: sig.positionX,
          positionY: sig.positionY,
          width: sig.width,
          height: sig.height,
          signatureImageUrl: savedSignatureUrl || null, 
          type: 'placeholder',
          x_display: 0, 
          y_display: 0 
        }));

        setSignatures(prev => [...prev, ...aiSignatures]);
        toast.success(`Berhasil! ${result.data.length} lokasi ditemukan.`, { id: toastId });
      } else {
        toast.success("Selesai. AI tidak menemukan kata kunci tanda tangan.", { id: toastId });
      }
    } catch (error) {
      console.error("Auto Tag Error:", error);
      toast.error("Gagal menjalankan AI.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId, savedSignatureUrl]);

  // --- HANDLER AI ANALYZE (LEGAL CHECK) ---
  const handleAnalyzeDocument = useCallback(async () => {
    if (!documentId) return;

    setIsAnalyzing(true);
    setIsAiModalOpen(true); 
    setAiData(null);

    try {
      const result = await signatureService.analyzeDocument(documentId);
      if (result && result.data) {
        setAiData(result.data);
      } else {
        toast.error("Gagal mendapatkan hasil analisis.");
        setIsAiModalOpen(false);
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast.error("Gagal menjalankan AI.");
      setIsAiModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  // --- HANDLER SAVE FINAL ---
  const handleFinalSave = useCallback(async () => {
    if (signatures.length === 0) return toast.error("Harap tempatkan setidaknya satu tanda tangan.");
    if (!documentVersionId) return toast.error("ID Versi Dokumen tidak ditemukan.");

    setIsSaving(true); // Gunakan loading state khusus simpan

    const signaturesToSubmit = signatures
      .filter(sig => sig.signatureImageUrl)
      .map(sig => ({
        documentVersionId,
        method: "canvas",
        signatureImageUrl: sig.signatureImageUrl,
        positionX: sig.positionX,
        positionY: sig.positionY,
        pageNumber: sig.pageNumber,
        width: sig.width,
        height: sig.height,
        displayQrCode: includeQrCode,
      }));

    if (signaturesToSubmit.length === 0) {
        setIsSaving(false);
        return toast.error("Semua tanda tangan masih kosong. Silakan isi tanda tangan pada kotak yang tersedia.");
    }

    try {
      await signatureService.addPersonalSignature({ 
          signatures: signaturesToSubmit 
      });

      toast.success(<b>Dokumen berhasil ditandatangani!</b>);

      setTimeout(() => {
        setIsSaving(false);
        navigate(`/documents/${documentId}/view`);
      }, 2000);
    } catch (error) {
      console.error("Kesalahan fatal saat menyimpan:", error);
      setIsSaving(false);
      toast.error(error.message || "Gagal menyimpan tanda tangan.");
    }
  }, [signatures, documentVersionId, documentId, navigate, includeQrCode]);

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

  if (isLoadingDoc && !pdfFile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Dokumen...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
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
          
          // Pass Handler & Loading States yang Benar
          onAutoTag={handleAutoTag}
          onAnalyze={handleAnalyzeDocument}
          isLoading={isAnalyzing || isSaving} // Disable tombol jika salah satu sedang jalan
          
          isPortrait={isPortrait}
          includeQrCode={includeQrCode}
          setIncludeQrCode={setIncludeQrCode}
          isOpen={sidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Modal AI */}
        <AiAnalysisModal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
          data={aiData} 
          isLoading={isAnalyzing}
        />
      </div>

      {isSidebarOpen && !isLandscape && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}
      {isSignatureModalOpen && <SignatureModal onSave={handleSaveSignature} onClose={() => setIsSignatureModalOpen(false)} />}
    </div>
  );
};

export default SignDocumentPage;