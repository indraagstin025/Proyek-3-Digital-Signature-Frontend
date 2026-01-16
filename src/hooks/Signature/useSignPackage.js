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

  // --- State: Loading & Process ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- State: Data Paket ---
  const [packageDetails, setPackageDetails] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- State: PDF Rendering ---
  const [currentPdfBlobUrl, setCurrentPdfBlobUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // --- State: Signatures ---
  // Map untuk menyimpan signature per dokumen: Map<DocId, Array<Signature>>
  const [allSignatures, setAllSignatures] = useState(new Map()); 
  const [currentSignatures, setCurrentSignatures] = useState([]);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  // --- State: UI/Modals ---
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  // --- State: AI ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- Refs & Computed ---
  const isForceCancelledRef = useRef(false);
  const totalDocs = packageDetails?.documents?.length || 0;
  const isLastDocument = totalDocs > 0 && currentIndex === totalDocs - 1;

  const currentPackageDocument = useMemo(() => {
    if (!packageDetails) return null;
    return packageDetails.documents[currentIndex];
  }, [packageDetails, currentIndex]);

  const currentDocumentTitle = useMemo(() => {
    return currentPackageDocument?.docVersion?.document?.title || "Memuat...";
  }, [currentPackageDocument]);

  const processingTitle = packageDetails?.documents[Math.min(progressIndex, totalDocs - 1)]?.docVersion?.document?.title;

  // --- Effect: Handle Resize ---
  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Effect: Mobile Tip ---
  useEffect(() => {
    if (window.innerWidth < 768) {
      const timer = setTimeout(() => {
        toast("💡 Tips: Ketuk ikon Pensil untuk tanda tangan, atau ketuk layar dokumen secara langsung.", {
          duration: 5000,
          icon: "👇",
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Effect: Fetch Package Details ---
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
        // Membuka modal tanda tangan di awal agar user setup ttd dulu
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

  // --- Effect: Fetch PDF Blob (Optimized) ---
  useEffect(() => {
    let blobUrlToRevoke = null;
    let isMounted = true;
    const controller = new AbortController(); // Untuk membatalkan fetch jika komponen unmount

    const fetchPdfBlob = async () => {
      if (!currentPackageDocument) return;

      setIsLoadingPdf(true);
      setError(null);

      try {
        const docId = currentPackageDocument.docVersion?.document?.id;
        const versionId = currentPackageDocument.docVersion?.id;

        if (!docId || !versionId) throw new Error("Data dokumen tidak lengkap.");

        // Pass signal ke service (jika service support axios signal)
        // Jika tidak support, tidak akan error, hanya signal tidak terpakai
        const blobUrl = await documentService.getDocumentVersionFileUrl(docId, versionId, { signal: controller.signal });

        if (isMounted) {
          // Jika sudah ada blob sebelumnya, revoke dulu (opsional, tapi bagus untuk memory)
          setCurrentPdfBlobUrl((prev) => {
             if (prev) URL.revokeObjectURL(prev);
             return blobUrl;
          });
          blobUrlToRevoke = blobUrl;
        } else {
          // Jika component keburu unmount, langsung revoke
          URL.revokeObjectURL(blobUrl);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
            console.log("Fetch PDF dibatalkan (Navigation change).");
            return;
        }
        
        if (isMounted) {
          console.error("PDF Load Error:", err);
          setError(`Gagal memuat ${currentDocumentTitle}`);
          toast.error("Gagal memuat tampilan PDF.");
        }
      } finally {
        if (isMounted) setIsLoadingPdf(false);
      }
    };

    fetchPdfBlob();

    return () => {
      isMounted = false;
      controller.abort();
      // Delay revoke object URL agar React-PDF punya waktu untuk 'cleanup' internalnya
      // Ini mencegah error "InvalidPDFException" atau "Worker terminated"
      if (blobUrlToRevoke) {
        setTimeout(() => URL.revokeObjectURL(blobUrlToRevoke), 5000);
      }
    };
  }, [currentPackageDocument, currentDocumentTitle]); 
  // Dependency cukup currentPackageDocument saja sebenarnya, tapi title ok untuk memastikan update

  // --- Effect: Handle Offline Event (Visual Only) ---
  useEffect(() => {
    const handleOfflineNow = () => {
      if (isSubmitting) {
        console.warn("⚠️ Terdeteksi Offline saat proses submit.");
        // Kita tidak langsung kill proses di sini, biarkan service layer yang menentukan errornya
        // Hanya beri notifikasi visual
        toast("Koneksi terputus. Mencoba menghubungi server...", { icon: "📡" });
      }
    };
    window.addEventListener("offline", handleOfflineNow);
    return () => window.removeEventListener("offline", handleOfflineNow);
  }, [isSubmitting]);


  // --- Handlers: Signatures ---

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


  // --- Handlers: AI & Auto Tag ---

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
      console.error("AI Analyze Error:", error);
      toast.error("Gagal menganalisis dokumen.");
      setIsAiModalOpen(false);
    } finally {
      setIsAiLoading(false);
    }
  }, [currentPackageDocument]);

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
      console.error("AutoTag Error:", error);
      toast.error("Gagal menjalankan AI.", { id: toastId });
    }
  }, [currentPackageDocument, currentDocumentTitle, savedSignatureUrl]);


  // --- Handlers: Navigation ---

  const navigateDocument = useCallback(
    (direction) => {
      const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0 || nextIndex >= totalDocs) return;

      // 1. Simpan tanda tangan halaman saat ini ke Map 'allSignatures'
      if (currentPackageDocument) {
        setAllSignatures((prev) => {
            const newMap = new Map(prev);
            newMap.set(currentPackageDocument.id, currentSignatures);
            return newMap;
        });
      }

      // 2. Reset State UI untuk halaman baru
      setAiAnalysisData(null);
      setIsAiModalOpen(false);
      
      // 3. Pindah Index
      setCurrentIndex(nextIndex);

      // 4. Muat tanda tangan untuk halaman baru dari Map
      const nextDocId = packageDetails.documents[nextIndex].id;
      
      // Menggunakan functional update untuk memastikan kita mengambil data terbaru dari Map
      setAllSignatures((prevMap) => {
          const existingSignatures = prevMap.get(nextDocId) || [];
          setCurrentSignatures(existingSignatures);
          return prevMap; // Kembalikan map yang sama (karena kita hanya ingin baca, bukan ubah map di sini)
      });

      toast.success(`Memuat: ${packageDetails.documents[nextIndex].docVersion?.document?.title}`);
    },
    [currentIndex, currentSignatures, currentPackageDocument, packageDetails, totalDocs]
  );

  const handleManualCancel = useCallback(() => {
    isForceCancelledRef.current = true;
    setIsProcessingModalOpen(false);
    setIsSubmitting(false);
    toast("Proses dibatalkan.", { icon: "info" });
  }, []);


  // --- Handlers: Submit / Next ---

  const handleNextOrSubmit = async () => {
    // Validasi lokal: Harus ada signature di halaman ini sebelum lanjut/save
    if (currentSignatures.length === 0) {
      toast.error("Harap tempatkan setidaknya satu tanda tangan pada dokumen ini.");
      return;
    }

    // Simpan state terakhir ke Map
    const newAllSignatures = new Map(allSignatures).set(currentPackageDocument.id, currentSignatures);
    setAllSignatures(newAllSignatures);

    // Jika bukan dokumen terakhir, pindah next
    if (!isLastDocument) {
      navigateDocument("next");
      return;
    }

    // --- PROSES SUBMIT (Dokumen Terakhir) ---
    
    // 1. Susun Payload
    const finalSignaturesPayload = [];
    newAllSignatures.forEach((signatures, packageDocId) => {
      signatures.forEach((sig) => {
        // Hanya kirim yang punya gambar (bukan placeholder kosong)
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

    if (finalSignaturesPayload.length === 0) {
        toast.error("Tidak ada tanda tangan valid yang ditemukan di seluruh dokumen.");
        return;
    }

    if (isSubmitting) return; // Prevent double click

    // 2. Mulai UI Loading
    isForceCancelledRef.current = false;
    setIsSubmitting(true);
    setIsProcessingModalOpen(true);
    setProgressIndex(0);

    // Simulasi progress bar
    const intervalId = setInterval(() => {
      if (isForceCancelledRef.current) {
        clearInterval(intervalId);
        return;
      }
      setProgressIndex((prev) => (prev >= totalDocs * 0.9 ? prev : prev + 0.05));
    }, 200);

    try {
      // 3. Panggil API Sign
      // Pastikan packageService.signPackage sudah diperbaiki sesuai saran sebelumnya
      const result = await packageService.signPackage(packageId, finalSignaturesPayload);

      // 4. Sukses
      clearInterval(intervalId);
      setProgressIndex(totalDocs);

      // Beri sedikit delay agar user melihat progress bar penuh
      setTimeout(() => {
        if (isForceCancelledRef.current) return;
        
        setIsProcessingModalOpen(false);
        setIsSubmitting(false);
        toast.success("Berhasil tersimpan!");
        navigate("/dashboard/packages");
      }, 1000);

    } catch (err) {
      // 5. Error Handling
      clearInterval(intervalId);
      setIsProcessingModalOpen(false);
      setIsSubmitting(false);

      const responseData = err.response?.data;
      const backendMessage = responseData?.message;
      const errorMessage = err.message || "Unknown error";

      // LOGGING DETAIL untuk debugging
      console.error("❌ Submit Failed Detailed:", {
          status: err.response?.status,
          backendMessage,
          errorMessage,
          payload: finalSignaturesPayload
      });

      // Handling khusus status 400 (Bad Request)
      if (err.response?.status === 400) {
          toast.error(`Gagal Validasi: ${backendMessage || "Periksa posisi tanda tangan Anda."}`);
          return;
      }

      // Handling logic sukses tapi message aneh
      if (backendMessage && (backendMessage.includes("selesai") || backendMessage.includes("completed") || backendMessage.includes("already signed"))) {
        toast.success("Dokumen sebenarnya sudah tersimpan!");
        navigate("/dashboard/packages");
        return;
      }

      // Handling Offline khusus
      if (errorMessage === "Offline-Detected") {
        toast.error("Koneksi terputus. Gagal menyimpan data.", { id: "save-offline-err" });
        return;
      }

      // Fallback Error
      toast.error(backendMessage || "Terjadi kesalahan saat menyimpan.");
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