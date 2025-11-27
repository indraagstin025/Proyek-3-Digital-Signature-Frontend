import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { packageService } from "../../services/packageService";
import { toast, Toaster } from "react-hot-toast";
import { documentService } from "../../services/documentService.js";
import { signatureService } from "../../services/signatureService"; // [BARU] Import Signature Service
import SigningHeader from "../../components/SigningHeader/SigningHeader"; 
import PDFViewer from "../../components/PDFViewer/PDFViewer";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../../components/SignatureModal/SignatureModal";

import { FaSpinner, FaChevronRight, FaChevronLeft } from "react-icons/fa";

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

  const totalDocs = packageDetails?.documents?.length || 0;
  const isLastDocument = totalDocs > 0 && currentIndex === totalDocs - 1;

  // Logika Orientasi
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

  const navigateDocument = useCallback((direction) => {
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= totalDocs) return;

    // Simpan signature halaman saat ini ke Map global sebelum pindah
    if (currentPackageDocument) {
        const newAllSignatures = new Map(allSignatures).set(currentPackageDocument.id, currentSignatures);
        setAllSignatures(newAllSignatures);
    }
    
    setCurrentIndex(nextIndex);
    
    // Load signature halaman berikutnya (jika ada di Map)
    const nextDocId = packageDetails.documents[nextIndex].id;
    setCurrentSignatures(allSignatures.get(nextDocId) || []);

    toast.success(`Memuat dokumen: ${packageDetails.documents[nextIndex].docVersion?.document?.title || `Dokumen ${nextIndex + 1}`}`);
  }, [currentIndex, allSignatures, currentSignatures, currentPackageDocument, packageDetails, totalDocs]);

  // --- [FITUR BARU] Handler Auto Tag Paket ---
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
      // Panggil AI untuk dokumen yang sedang aktif
      const result = await signatureService.autoTagDocument(docId);
      
      if (result.data && result.data.length > 0) {
        const aiSignatures = result.data.map(sig => ({
          id: sig.id,
          pageNumber: sig.pageNumber,
          positionX: sig.positionX,
          positionY: sig.positionY,
          width: sig.width,
          height: sig.height,
          // Gunakan gambar user jika sudah ada, atau null (jadi placeholder)
          signatureImageUrl: savedSignatureUrl || null, 
          type: 'placeholder',
          // Data display dummy (nanti dihitung ulang oleh PlacedSignature)
          x_display: 0, 
          y_display: 0 
        }));

        // Tambahkan ke currentSignatures (Halaman aktif)
        setCurrentSignatures(prev => [...prev, ...aiSignatures]);
        
        // Update juga ke Map global allSignatures agar tersimpan di memori paket
        setAllSignatures(prevMap => {
            const newMap = new Map(prevMap);
            const existing = newMap.get(currentPackageDocument.id) || [];
            // Gabungkan existing dengan hasil AI baru
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

    // Simpan state halaman ini ke Map global
    const newAllSignatures = new Map(allSignatures).set(currentPackageDocument.id, currentSignatures);
    setAllSignatures(newAllSignatures);

    if (isLastDocument) {
      setIsSubmitting(true);
      const toastId = toast.loading("Menyelesaikan dan menyimpan semua tanda tangan...");

      const finalSignaturesPayload = [];
      newAllSignatures.forEach((signatures, packageDocId) => {
        signatures.forEach((sig) => {
          // HANYA KIRIM YANG SUDAH ADA GAMBARNYA
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
          setIsSubmitting(false);
          toast.error("Tidak ada tanda tangan yang valid untuk disimpan.", { id: toastId });
          return;
      }

      try {
        const result = await packageService.signPackage(packageId, finalSignaturesPayload);

        if (result.status === "completed") {
          toast.success("Semua dokumen berhasil ditandatangani!", { id: toastId });
        } else {
          toast.error(`Proses selesai, namun ${result.failed.length} dokumen gagal.`, { id: toastId });
        }

        navigate("/dashboard/documents");
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message);
        toast.error(err.message || "Gagal menyimpan paket.", { id: toastId });
      }
    } else {
      navigateDocument('next');
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

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />
      {isSignatureModalOpen && <SignatureModal onClose={() => setIsSignatureModalOpen(false)} onSave={handleSignatureSave} />}

      {/* 1. SIGNING HEADER (Tinggi 64px) */}
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader theme={theme} toggleTheme={toggleTheme} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </header>
      
      {/* 2. WRAPPER NAVIGASI DOKUMEN (Tinggi 48px, Posisi di bawah h-16) */}
      <div className={`fixed top-16 left-0 w-full h-12 z-40 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200/80 dark:border-white/10`}>
        <div className="flex items-center justify-center h-full px-4">
            
            <button
                onClick={() => navigateDocument('prev')}
                disabled={currentIndex === 0}
                className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                title="Dokumen Sebelumnya"
            >
                <FaChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center mx-4 flex-1 min-w-0 max-w-lg"> 
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Paket: {packageDetails?.title}
                </p>
                <h3 className="font-semibold text-base text-slate-800 dark:text-white truncate" title={currentDocumentTitle}>
                    {currentDocumentTitle} ({currentIndex + 1} dari {totalDocs})
                </h3>
            </div>
            
            <button
                onClick={() => navigateDocument('next')}
                disabled={isLastDocument}
                className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                title="Dokumen Berikutnya"
            >
                <FaChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>


      {/* 3. WRAPPER KONTEN UTAMA (Dimulai dari top-[112px]) */}
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
          
          // [FIX] Passing Handler AI Auto-Tag
          onAutoTag={handleAutoTag}
          
          isLoading={isSubmitting}
          includeQrCode={includeQrCode}
          setIncludeQrCode={setIncludeQrCode}
          isOpen={sidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Overlay untuk Mobile/Portrait */}
      {isSidebarOpen && !isLandscape && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}
      
    </div>
  );
};

export default SignPackagePage;