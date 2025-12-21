import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { packageService } from "../../services/packageService";
import { toast, Toaster } from "react-hot-toast";
import { documentService } from "../../services/documentService.js";
import { signatureService } from "../../services/signatureService";
import SigningHeader from "../../components/SigningHeader/SigningHeader";
import PDFViewer from "../../components/PDFViewer/PDFViewer";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../../components/SignatureModal/SignatureModal";
import ProcessingPackageModal from "../../components/ProcessingModal/ProcessingPackageModal"; 
import AiAnalysisModal from "../../components/AiAnalysisModal/AiAnalysisModal"; 

import { FaSpinner, FaChevronRight, FaChevronLeft, FaPenNib, FaSave, FaTools, FaRobot } from "react-icons/fa"; // Tambahkan FaRobot jika ingin icon tombol manual (opsional)

const SignPackagePage = ({ theme, toggleTheme }) => {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packageDetails, setPackageDetails] = useState(null);
  const [error, setError] = useState(null);

  const [currentPdfBlobUrl, setCurrentPdfBlobUrl] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSignatures, setAllSignatures] = useState(new Map());

  const [currentSignatures, setCurrentSignatures] = useState([]);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  // State Modal Progress
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  // ✅ [2] STATE BARU UNTUK AI
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const totalDocs = packageDetails?.documents?.length || 0;
  const isLastDocument = totalDocs > 0 && currentIndex === totalDocs - 1;

  useEffect(() => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        toast("💡 Tips: Ketuk ikon Pensil untuk tanda tangan, atau ketuk layar dokumen secara langsung.", {
          duration: 5000,
          icon: "👇",
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) {
        toast.error("ID Paket tidak ditemukan.");
        navigate("/dashboard/documents");
        return;
      }
      try {
        setIsLoading(true);
        const details = await packageService.getPackageDetails(packageId);
        if (!details || !details.documents || details.documents.length === 0) {
          throw new Error("Paket ini tidak valid atau tidak berisi dokumen.");
        }
        setPackageDetails(details);
        setSavedSignatureUrl(null);
        setIsSignatureModalOpen(true);
      } catch (err) {
        setError(err.message);
        toast.error(err.message || "Gagal memuat paket.");
        navigate("/dashboard/documents");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackage();
  }, [packageId, navigate]);

  const currentPackageDocument = useMemo(() => {
    if (!packageDetails) return null;
    return packageDetails.documents[currentIndex];
  }, [packageDetails, currentIndex]);

  const currentDocumentTitle = useMemo(() => {
    return currentPackageDocument?.docVersion?.document?.title || "Memuat...";
  }, [currentPackageDocument]);

  useEffect(() => {
    let blobUrlToRevoke = null;
    let isMounted = true;

    const fetchPdfBlob = async () => {
      if (!currentPackageDocument) return;

      setIsLoadingPdf(true);
      setCurrentPdfBlobUrl(null);
      setError(null);

      try {
        const docId = currentPackageDocument.docVersion?.document?.id;
        const versionId = currentPackageDocument.docVersion?.id;

        if (!docId || !versionId) {
          throw new Error("Data dokumen tidak lengkap.");
        }

        const blobUrl = await documentService.getDocumentVersionFileUrl(docId, versionId);

        if (isMounted) {
          blobUrlToRevoke = blobUrl;
          setCurrentPdfBlobUrl(blobUrl);
        } else {
          URL.revokeObjectURL(blobUrl);
        }
      } catch (err) {
        if (isMounted) {
          console.error("PDF Load Error:", err);
          toast.error(`Gagal memuat file PDF: ${err.message}`);
          setError(`Gagal memuat ${currentDocumentTitle}`);
        }
      } finally {
        if (isMounted) setIsLoadingPdf(false);
      }
    };

    fetchPdfBlob();

    return () => {
      isMounted = false;
      if (blobUrlToRevoke) {
        setTimeout(() => {
          URL.revokeObjectURL(blobUrlToRevoke);
        }, 1000);
      }
    };
  }, [currentPackageDocument, currentDocumentTitle]);

  const handleSignatureSave = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl);
    setIsSignatureModalOpen(false);
  }, []);

  const handleAddSignature = useCallback((newSignature) => {
    setCurrentSignatures((prev) => [...prev, newSignature]);
  }, []);

  const handleUpdateSignature = useCallback((updatedSignature) => {
    setCurrentSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));
  }, []);

  const handleDeleteSignature = useCallback((signatureId) => {
    setCurrentSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
  }, []);

  // ✅ [3] FUNGSI TRIGGER AI PER DOKUMEN
  const handleAnalyzeCurrentDocument = useCallback(async () => {
    if (!currentPackageDocument) {
      toast.error("Dokumen tidak ditemukan.");
      return;
    }

    // Ambil ID dokumen asli (bukan ID packageDocument)
    const realDocId = currentPackageDocument.docVersion?.document?.id;
    
    if (!realDocId) {
      toast.error("ID Dokumen tidak valid.");
      return;
    }

    setIsAiModalOpen(true);
    setAiAnalysisData(null); // Reset data lama agar loading terlihat
    setIsAiLoading(true);

    try {
        // Panggil service (pastikan documentService punya fungsi analyzeDocument)
        const result = await signatureService.analyzeDocument(realDocId);
        setAiAnalysisData(result);
    } catch (error) {
        console.error("AI Error:", error);
        toast.error("Gagal menganalisis dokumen.");
        setIsAiModalOpen(false); // Tutup jika error fatal
    } finally {
        setIsAiLoading(false);
    }
  }, [currentPackageDocument]);


  const navigateDocument = useCallback(
    (direction) => {
      const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0 || nextIndex >= totalDocs) return;

      if (currentPackageDocument) {
        const newAllSignatures = new Map(allSignatures).set(currentPackageDocument.id, currentSignatures);
        setAllSignatures(newAllSignatures);
      }

      // ✅ [4] RESET AI SAAT PINDAH DOKUMEN
      // Agar hasil analisis dokumen A tidak muncul saat melihat dokumen B
      setAiAnalysisData(null);
      setIsAiModalOpen(false);

      setCurrentIndex(nextIndex);

      const nextDocId = packageDetails.documents[nextIndex].id;
      setCurrentSignatures(allSignatures.get(nextDocId) || []);

      toast.success(`Memuat dokumen: ${packageDetails.documents[nextIndex].docVersion?.document?.title || `Dokumen ${nextIndex + 1}`}`);
    },
    [currentIndex, allSignatures, currentSignatures, currentPackageDocument, packageDetails, totalDocs]
  );

  const handleAutoTag = useCallback(async () => {
    if (!currentPackageDocument) {
      toast.error("Tidak ada dokumen yang aktif.");
      return;
    }

    const docId = currentPackageDocument.docVersion?.document?.id;
    if (!docId) return;

    const confirm = window.confirm(`AI akan memindai "${currentDocumentTitle}". Lanjutkan?`);
    if (!confirm) return;

    const toastId = toast.loading("🤖 AI sedang membaca dokumen ini...");

    try {
      const result = await signatureService.autoTagDocument(docId);

      if (result.data && result.data.length > 0) {
        const aiSignatures = result.data.map((sig) => ({
          id: sig.id,
          pageNumber: sig.pageNumber,
          positionX: sig.positionX,
          positionY: sig.positionY,
          width: sig.width,
          height: sig.height,

          signatureImageUrl: savedSignatureUrl || null,
          type: "placeholder",

          x_display: 0,
          y_display: 0,
        }));

        setCurrentSignatures((prev) => [...prev, ...aiSignatures]);

        setAllSignatures((prevMap) => {
          const newMap = new Map(prevMap);
          const existing = newMap.get(currentPackageDocument.id) || [];

          newMap.set(currentPackageDocument.id, [...existing, ...aiSignatures]);
          return newMap;
        });

        toast.success(`Berhasil! ${result.data.length} lokasi ditemukan.`, { id: toastId });
      } else {
        toast.success("AI tidak menemukan kata kunci di dokumen ini.", { id: toastId });
      }
    } catch (error) {
      console.error("Auto Tag Error:", error);
      toast.error("Gagal menjalankan AI.", { id: toastId });
    }
  }, [currentPackageDocument, currentDocumentTitle, savedSignatureUrl, allSignatures]);

  const handleNextOrSubmit = async () => {
    if (currentSignatures.length === 0) {
      toast.error(`Harap tempatkan setidaknya satu tanda tangan di ${currentDocumentTitle}.`);
      return;
    }
    if (!currentPackageDocument) {
      toast.error("Dokumen saat ini tidak valid. Coba lagi.");
      return;
    }

    const newAllSignatures = new Map(allSignatures).set(currentPackageDocument.id, currentSignatures);
    setAllSignatures(newAllSignatures);

    if (isLastDocument) {
      const finalSignaturesPayload = [];
      newAllSignatures.forEach((signatures, packageDocId) => {
        signatures.forEach((sig) => {
          if (sig.signatureImageUrl) {
            finalSignaturesPayload.push({
              packageDocId: packageDocId,
              signatureImageUrl: sig.signatureImageUrl,
              pageNumber: sig.pageNumber,
              positionX: sig.positionX,
              positionY: sig.positionY,
              width: sig.width,
              height: sig.height,
              displayQrCode: includeQrCode,
            });
          }
        });
      });

      if (finalSignaturesPayload.length === 0) {
        toast.error("Tidak ada tanda tangan yang valid untuk disimpan.");
        return;
      }

      setIsSubmitting(true);
      setIsProcessingModalOpen(true);
      setProgressIndex(0);

      const intervalId = setInterval(() => {
        setProgressIndex((prev) => {
            if (prev < totalDocs - 1) return prev + 1;
            return prev;
        });
      }, 4000); 

      try {
        const result = await packageService.signPackage(packageId, finalSignaturesPayload);

        clearInterval(intervalId);
        setProgressIndex(totalDocs); 

        setTimeout(() => {
            setIsProcessingModalOpen(false); 
            setIsSubmitting(false);

            if (result.status === "completed") {
                toast.success("Semua dokumen berhasil ditandatangani!");
            } else {
                toast.error(`Selesai, namun ${result.failed.length} dokumen gagal.`);
            }
            
            navigate("/dashboard/documents");
        }, 2000);

      } catch (err) {
        clearInterval(intervalId);
        setIsProcessingModalOpen(false);
        setIsSubmitting(false);
        setError(err.message);
        toast.error(err.message || "Gagal menyimpan paket.");
      }
    } else {
      navigateDocument("next");
    }
  };

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

  if (isLoading && !currentPdfBlobUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Paket Dokumen...</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  const processingTitle = packageDetails?.documents[Math.min(progressIndex, totalDocs - 1)]?.docVersion?.document?.title;

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />
      {isSignatureModalOpen && <SignatureModal onClose={() => setIsSignatureModalOpen(false)} onSave={handleSignatureSave} />}

      {/* MODAL PROGRESS SIGNING */}
      <ProcessingPackageModal 
        isOpen={isProcessingModalOpen}
        totalDocs={totalDocs}
        currentDocIndex={progressIndex}
        currentDocTitle={processingTitle}
      />

      {/* ✅ [5] MODAL AI ANALYSIS */}
      <AiAnalysisModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        data={aiAnalysisData}
        isLoading={isAiLoading}
        dbDocumentType={currentPackageDocument?.docVersion?.document?.type} 
      />

      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader theme={theme} toggleTheme={toggleTheme} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </header>

      <div className={`fixed top-16 left-0 w-full h-12 z-40 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200/80 dark:border-white/10`}>
        <div className="flex items-center justify-center h-full px-4">
          <button
            onClick={() => navigateDocument("prev")}
            disabled={currentIndex === 0}
            className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
            title="Dokumen Sebelumnya"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center mx-4 flex-1 min-w-0 max-w-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Paket: {packageDetails?.title}</p>
            <h3 className="font-semibold text-base text-slate-800 dark:text-white truncate" title={currentDocumentTitle}>
              {currentDocumentTitle} ({currentIndex + 1} dari {totalDocs})
            </h3>
          </div>

          <button
            onClick={() => navigateDocument("next")}
            disabled={isLastDocument}
            className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
            title="Dokumen Berikutnya"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="absolute top-[112px] bottom-0 left-0 w-full flex overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {currentPdfBlobUrl && (
            <PDFViewer
              key={currentPdfBlobUrl}
              fileUrl={currentPdfBlobUrl}
              documentTitle={currentDocumentTitle}
              signatures={currentSignatures}
              onAddSignature={handleAddSignature}
              onUpdateSignature={handleUpdateSignature}
              onDeleteSignature={handleDeleteSignature}
              savedSignatureUrl={savedSignatureUrl}
            />
          )}
        </main>

        {/* Sidebar Alat TTD */}
        <SignatureSidebar
          savedSignatureUrl={savedSignatureUrl}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onSave={handleNextOrSubmit}
          onAutoTag={handleAutoTag}
          isLoading={isSubmitting}
          includeQrCode={includeQrCode}
          setIncludeQrCode={setIncludeQrCode}
          isOpen={sidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          
          // ✅ [6] PASSING FUNGSI AI KE SIDEBAR
          onAnalyze={handleAnalyzeCurrentDocument}
        />
      </div>

      {/* FAB Mobile (Opsional: Tambah tombol robot di sini jika mau) */}
      <div className="fixed top-32 right-4 z-50 md:hidden flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Tombol AI Mobile */}
        <button
          onClick={handleAnalyzeCurrentDocument}
          className="pointer-events-auto w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all transform hover:scale-110 active:scale-90"
        >
          <FaRobot size={14} />
        </button>

        {currentSignatures.length > 0 && (
            <button
              onClick={handleNextOrSubmit}
              disabled={isSubmitting}
              className="pointer-events-auto w-10 h-10 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all transform hover:scale-110 active:scale-90"
            >
               {isSubmitting ? (
                 <FaSpinner className="animate-spin text-xs"/> 
               ) : (
                 isLastDocument ? <FaSave size={16} /> : <FaChevronRight size={16} />
               )}
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

      {isSidebarOpen && !isLandscape && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}
    </div>
  );
};

export default SignPackagePage;