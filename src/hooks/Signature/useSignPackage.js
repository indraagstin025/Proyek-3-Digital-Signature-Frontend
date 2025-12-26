/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { packageService } from "../../services/packageService";
import { documentService } from "../../services/documentService";
import { signatureService } from "../../services/signatureService";

export const useSignPackage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packageDetails, setPackageDetails] = useState(null);
  const [error, setError] = useState(null);

  const [currentPdfBlobUrl, setCurrentPdfBlobUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSignatures, setAllSignatures] = useState(new Map());
  const [currentSignatures, setCurrentSignatures] = useState([]);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const totalDocs = packageDetails?.documents?.length || 0;
  const isLastDocument = totalDocs > 0 && currentIndex === totalDocs - 1;
  const isForceCancelledRef = useRef(false);

  const currentPackageDocument = useMemo(() => {
    if (!packageDetails) return null;
    return packageDetails.documents[currentIndex];
  }, [packageDetails, currentIndex]);

  const currentDocumentTitle = useMemo(() => {
    return currentPackageDocument?.docVersion?.document?.title || "Memuat...";
  }, [currentPackageDocument]);

  const processingTitle = packageDetails?.documents[Math.min(progressIndex, totalDocs - 1)]?.docVersion?.document?.title;

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        toast("💡 Tips: Ketuk ikon Pensil untuk tanda tangan, atau ketuk layar dokumen secara langsung.", {
          duration: 5000,
          icon: "👇",
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
      }, 1000);
    }
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

        if (!docId || !versionId) throw new Error("Data dokumen tidak lengkap.");

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
        setTimeout(() => URL.revokeObjectURL(blobUrlToRevoke), 1000);
      }
    };
  }, [currentPackageDocument, currentDocumentTitle]);

  useEffect(() => {
    const handleOfflineNow = () => {
      if (isSubmitting) {
        console.error("🛑 Offline saat submit: Membatalkan proses UI.");
        isForceCancelledRef.current = true;
        setIsProcessingModalOpen(false);
        setIsSubmitting(false);
        toast.error("Koneksi terputus! Proses dihentikan.", {
          id: "offline-kill",
          style: { background: "#ef4444", color: "#fff" },
        });
      }
    };
    window.addEventListener("offline", handleOfflineNow);
    return () => window.removeEventListener("offline", handleOfflineNow);
  }, [isSubmitting]);

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

  const handleAnalyzeCurrentDocument = useCallback(async () => {
    if (!currentPackageDocument) {
      toast.error("Dokumen tidak ditemukan.");
      return;
    }
    const realDocId = currentPackageDocument.docVersion?.document?.id;
    if (!realDocId) return;

    setIsAiModalOpen(true);
    setAiAnalysisData(null);
    setIsAiLoading(true);

    try {
      const result = await signatureService.analyzeDocument(realDocId);
      setAiAnalysisData(result);
    } catch (error) {
      toast.error("Gagal menganalisis dokumen.");
      setIsAiModalOpen(false);
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

      setAiAnalysisData(null);
      setIsAiModalOpen(false);
      setCurrentIndex(nextIndex);

      const nextDocId = packageDetails.documents[nextIndex].id;
      setCurrentSignatures(allSignatures.get(nextDocId) || []);

      toast.success(`Memuat: ${packageDetails.documents[nextIndex].docVersion?.document?.title}`);
    },
    [currentIndex, allSignatures, currentSignatures, currentPackageDocument, packageDetails, totalDocs]
  );

  const handleAutoTag = useCallback(async () => {
    if (!currentPackageDocument) return;
    const docId = currentPackageDocument.docVersion?.document?.id;

    const confirm = window.confirm(`AI akan memindai "${currentDocumentTitle}". Lanjutkan?`);
    if (!confirm) return;

    const toastId = toast.loading("🤖 AI sedang membaca...");
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
        toast.success(`${result.data.length} lokasi ditemukan.`, { id: toastId });
      } else {
        toast.success("AI tidak menemukan kata kunci.", { id: toastId });
      }
    } catch (error) {
      toast.error("Gagal menjalankan AI.", { id: toastId });
    }
  }, [currentPackageDocument, currentDocumentTitle, savedSignatureUrl, allSignatures]);

  const handleManualCancel = useCallback(() => {
    isForceCancelledRef.current = true;
    setIsProcessingModalOpen(false);
    setIsSubmitting(false);
    toast("Proses dibatalkan.", { icon: "info" });
  }, []);

  const handleNextOrSubmit = async () => {
    if (currentSignatures.length === 0) {
      toast.error("Harap tempatkan setidaknya satu tanda tangan.");
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
              packageDocId,
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

      if (finalSignaturesPayload.length === 0) return;
      if (isSubmitting) return;

      isForceCancelledRef.current = false;
      setIsSubmitting(true);
      setIsProcessingModalOpen(true);
      setProgressIndex(0);

      const intervalId = setInterval(() => {
        if (isForceCancelledRef.current) {
          clearInterval(intervalId);
          return;
        }
        setProgressIndex((prev) => (prev >= totalDocs * 0.9 ? prev : prev + 0.05));
      }, 200);

      try {
        const result = await packageService.signPackage(packageId, finalSignaturesPayload);

        clearInterval(intervalId);
        setProgressIndex(totalDocs);

        setTimeout(() => {
          if (isForceCancelledRef.current) return;
          setIsProcessingModalOpen(false);
          setIsSubmitting(false);
          toast.success("Berhasil tersimpan!");
          navigate("/dashboard/documents");
        }, 1000);
      } catch (err) {
        clearInterval(intervalId);
        setIsProcessingModalOpen(false);
        setIsSubmitting(false);

        const backendMessage = err.response?.data?.message || "";
        const errorMessage = err.message || "";
        console.log("Error Submit:", { backendMessage, errorMessage });

        if (backendMessage.includes("selesai") || backendMessage.includes("completed") || backendMessage.includes("already signed")) {
          toast.success("Dokumen berhasil disimpan!");
          navigate("/dashboard/documents");
          return;
        }

        if (errorMessage === "Offline-Detected") {
          toast.error("Gagal menyimpan. Koneksi internet terputus.", { id: "save-offline-err" });
          return;
        }

        toast.error(backendMessage || errorMessage || "Gagal menyimpan.");
      }
    } else {
      navigateDocument("next");
    }
  };

  return {
    packageId,
    packageDetails,
    currentPackageDocument,
    currentDocumentTitle,
    currentPdfBlobUrl,
    allSignatures,
    currentSignatures,
    savedSignatureUrl,
    includeQrCode,
    totalDocs,
    currentIndex,
    isLastDocument,
    processingTitle,
    error,

    isLoading,
    isLoadingPdf,
    isSubmitting,
    isSidebarOpen,
    isLandscape,
    isSignatureModalOpen,
    isProcessingModalOpen,
    progressIndex,
    isAiModalOpen,
    isAiLoading,
    aiAnalysisData,

    setIsSidebarOpen,
    setIsSignatureModalOpen,
    setIsAiModalOpen,
    setSavedSignatureUrl,
    setIncludeQrCode,

    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleSignatureSave,
    handleNextOrSubmit,
    handleAutoTag,
    handleAnalyzeCurrentDocument,
    handleManualCancel,
    navigateDocument,
  };
};
