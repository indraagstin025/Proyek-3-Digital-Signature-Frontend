import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { packageService } from "../../services/packageService";
import { toast, Toaster } from "react-hot-toast";
import { documentService } from "../../services/documentService.js";

import PDFViewer from "../../components/PDFViewer/PDFViewer";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../../components/SignatureModal/SignatureModal";

import { FaSpinner, FaFileAlt, FaCheckCircle, FaChevronRight } from "react-icons/fa";

const SignPackagePage = () => {
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
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  const totalDocs = packageDetails?.documents?.length || 0;
  const isLastDocument = totalDocs > 0 && currentIndex === totalDocs - 1;

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
  }, [currentPackageDocument]);

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
      setIsSubmitting(true);
      const toastId = toast.loading("Menyelesaikan dan menyimpan semua tanda tangan...");

      const finalSignaturesPayload = [];

      newAllSignatures.forEach((signatures, packageDocId) => {
        signatures.forEach((sig) => {
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
        });
      });

      try {
        const result = await packageService.signPackage(packageId, finalSignaturesPayload);

        if (result.status === "completed") {
          toast.success("Semua dokumen berhasil ditandatangani!", { id: toastId });
        } else {
          toast.error(`Proses selesai, namun ${result.failed.length} dokumen gagal.`, { id: toastId });
        }

        navigate("/dashboard/documents", { state: { refresh: true } });
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message);
        toast.error(err.message || "Gagal menyimpan paket.", { id: toastId });
      }
    } else {
      toast.success(`Tanda tangan untuk ${currentDocumentTitle} disimpan. Memuat dokumen berikutnya...`);
      setCurrentIndex((prev) => prev + 1);
      setCurrentSignatures([]);
    }
  };

  if (isLoading || !packageDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Paket Dokumen...</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      {isSignatureModalOpen && <SignatureModal onClose={() => setIsSignatureModalOpen(false)} onSave={handleSignatureSave} />}

      <div className="flex h-screen w-full bg-slate-200 dark:bg-slate-800">
        {/* === Sidebar Kiri (Daftar Dokumen) === */}
        <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 shadow-lg flex-shrink-0">
          <div className="p-4 border-b dark:border-slate-700">
            {/* ❗️ Aman karena 'packageDetails' sudah di-guard */}
            <h2 className="font-bold text-lg dark:text-white truncate" title={packageDetails.title}>
              {packageDetails.title || "Paket Tanda Tangan"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {/* ❗️ 'totalDocs' sudah didefinisikan di atas */}
              Dokumen {currentIndex + 1} dari {totalDocs}
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* ❗️ Aman karena 'packageDetails' sudah di-guard */}
            {packageDetails.documents.map((doc, index) => {
              const isActive = index === currentIndex;
              const isDone = allSignatures.has(doc.id) || (isActive && currentSignatures.length > 0);

              return (
                <li
                  key={doc.id}
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    isActive ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {isDone ? <FaCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> : <FaFileAlt className="w-5 h-5 mr-3 flex-shrink-0" />}
                  {/* ❗️ [PERBAIKAN] Tambahkan '?' untuk keamanan data */}
                  <span className="truncate flex-1">{doc?.docVersion?.document?.title || `Dokumen ${index + 1}`}</span>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* === Area Viewer Tengah === */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* (Opsional) Header Navigasi Mobile */}
          <div className="md:hidden p-2 bg-white dark:bg-slate-900 shadow text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {/* ❗️ 'totalDocs' sudah didefinisikan di atas */}
              Dokumen {currentIndex + 1} dari {totalDocs}:<span className="font-semibold dark:text-white ml-1">{currentDocumentTitle}</span>
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            {/* ❗️ Menggunakan 'isLoadingPdf' dan 'currentPdfBlobUrl' */}
            {isLoadingPdf || !currentPdfBlobUrl ? (
              <div className="flex h-full items-center justify-center">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
                <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat {currentDocumentTitle}...</p>
              </div>
            ) : (
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
          </div>
        </main>

        {/* === Sidebar Kanan (Alat TTD) === */}
        <div className="hidden lg:block">
          <SignatureSidebar
            savedSignatureUrl={savedSignatureUrl}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onSave={handleNextOrSubmit}
            isLoading={isSubmitting}
            includeQrCode={includeQrCode}
            setIncludeQrCode={setIncludeQrCode}
            saveButtonText={isLastDocument ? "Selesaikan & Simpan Semua" : "Terapkan & Lanjut"}
            isSaveDisabled={!savedSignatureUrl}
          />
        </div>

        {/* Tombol Simpan "Sticky" untuk Mobile/Tablet */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 shadow-lg z-50">
          <button
            onClick={handleNextOrSubmit}
            disabled={isSubmitting || !savedSignatureUrl}
            className="w-full flex justify-center items-center text-white font-bold py-3 px-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 disabled:opacity-50"
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin" />
            ) : isLastDocument ? (
              "Selesaikan & Simpan Semua"
            ) : (
              <>
                <span>Terapkan & Lanjut</span>
                <FaChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default SignPackagePage;
