import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {FaSpinner, FaPenNib, FaSave, FaTools } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { documentService } from "../../services/documentService";
import { signatureService } from "../../services/signatureService";
import SigningHeader from "../../components/SigningHeader/SigningHeader";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../../components/SignatureModal/SignatureModal";
import PDFViewer from "../../components/PDFViewer/PDFViewer";
import AiAnalysisModal from "../../components/AiAnalysisModal/AiAnalysisModal";

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

// [UX FIX] Onboarding Hint (Mobile Only)
  // Perbaikan: Menambahkan ID unik dan Cleanup agar tidak nyangkut/duplikat
  useEffect(() => {
    let timeoutId;
    const TOAST_ID = "mobile-onboarding-hint"; // ID ini mencegah toast muncul double

    const showHint = () => {
      if (window.innerWidth < 768) {
        // Cek session storage agar tidak muncul terus setiap refresh (Opsional)
        // Jika ingin muncul setiap saat, hapus baris 'if' di bawah ini
        const hasSeen = sessionStorage.getItem("seen_mobile_hint");
        if (hasSeen) return;

        timeoutId = setTimeout(() => {
          toast("💡 Tips: Ketuk ikon Pensil untuk tanda tangan, atau ketuk layar dokumen secara langsung.", {
            id: TOAST_ID, // PENTING: Mencegah duplikat
            duration: 5000,
            icon: "👇",
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
              fontSize: '13px',
              maxWidth: '300px'
            },
          });
          
          // Set flag bahwa user sudah melihat hint di sesi ini
          sessionStorage.setItem("seen_mobile_hint", "true"); 
        }, 1000);
      }
    };

    showHint();

    // CLEANUP FUNCTION (PENTING)
    // Dijalankan saat komponen hilang (unmount) atau refresh
    return () => {
      clearTimeout(timeoutId); // Batalkan timer jika user keburu pindah
      toast.dismiss(TOAST_ID); // Paksa hilangkan toast ini saat halaman diganti/refresh
    };
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

// ... (Bagian atas kode tetap sama)

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
          onAutoTag={handleAutoTag}
          onAnalyze={handleAnalyzeDocument}
          isLoading={isAnalyzing || isSaving}
          isPortrait={isPortrait}
          includeQrCode={includeQrCode}
          setIncludeQrCode={setIncludeQrCode}
          isOpen={sidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <AiAnalysisModal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
          data={aiData} 
          isLoading={isAnalyzing}
        />
      </div>

{/* ======================================================= */}
      {/* [UX FIX] FLOATING ACTION BUTTONS (KHUSUS MOBILE)        */}
      {/* POSISI: Kanan Atas (Sesuai Request)                     */}
      {/* ======================================================= */}
      
      {/* PERUBAHAN: */}
      {/* 1. Ganti 'bottom-40' menjadi 'top-32' (jarak dari atas) */}
      {/* 2. 'right-4' agar ada jarak sedikit dari pinggir kanan */}
      <div className="fixed top-32 right-4 z-50 md:hidden flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Tombol-tombol di dalamnya TETAP SAMA */}
        {signatures.length > 0 && (
            <button
              onClick={handleFinalSave}
              disabled={isSaving}
              className="pointer-events-auto w-10 h-10 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all transform hover:scale-110 active:scale-90"
            >
               {isSaving ? <FaSpinner className="animate-spin text-xs"/> : <FaSave size={16} />}
            </button>
        )}

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="pointer-events-auto w-10 h-10 rounded-full bg-slate-700 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 transition-all transform hover:scale-110 active:scale-90"
        >
          <FaTools size={14} />
        </button>

  <button
          onClick={() => setIsSignatureModalOpen(true)}
          className="pointer-events-auto w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 active:scale-95"
          title="Buat Tanda Tangan Baru"
        >
          <FaPenNib size={16} />
        </button>
      </div>
      {/* ======================================================= */}

      {isSidebarOpen && !isLandscape && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}
      {isSignatureModalOpen && <SignatureModal onSave={handleSaveSignature} onClose={() => setIsSignatureModalOpen(false)} />}
    </div>
  );
};

export default SignDocumentPage;