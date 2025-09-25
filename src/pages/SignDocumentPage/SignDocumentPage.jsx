import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { documentService } from "../../services/documentService";
import { signatureService } from "../../services/signatureService";

import SigningHeader from "../../components/SigningHeader/SigningHeader";
import SignatureSidebar from "../../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../../components/SignatureModal/SignatureModal";
import PDFViewer from "../../components/PDFViewer/PDFViewer";
import { FaSpinner } from "react-icons/fa";

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
      for (const sig of signatures) {
        const payload = {
          documentVersionId: documentVersionId,
          method: "canvas",
          signatureImageUrl: sig.signatureImageUrl,
          positionX: sig.positionX,
          positionY: sig.positionY,
          pageNumber: sig.pageNumber,
      width: sig.width,
      height: sig.height,
        };

         console.log("Payload yang dikirim ke backend:", payload);

        await signatureService.addPersonalSignature(payload);
      }
      toast.success("Dokumen berhasil ditandatangani! Anda akan dialihkan.");
      setTimeout(() => navigate("/dashboard/documents", { state: { refresh: true } }), 2000);
    } catch (error) {
      toast.error(error.message || "Gagal menyimpan tanda tangan.");
      setIsLoading(false);
    }
  }, [signatures, documentVersionId, navigate]);

  if (isLoading && !pdfFile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Dokumen...</p>
      </div>
    );
  }
return (
  <div className="flex flex-col h-screen m-0 p-0 bg-gray-100 dark:bg-gray-800">
    {/* Header selalu fixed/sticky */}
    <SigningHeader
      documentTitle={documentTitle}
      theme={theme}
      toggleTheme={toggleTheme}
    />

    {/* Konten utama */}
    <div className="flex flex-1 overflow-hidden pt-16">
      {/* PDF Viewer area, kasih margin-right agar tidak ketimpa sidebar */}
      <main className="flex-1 flex justify-center overflow-auto mr-80">
        {pdfFile && (
          <PDFViewer
            fileUrl={pdfFile}
            signatures={signatures}
            onAddSignature={handleAddSignature}
            onUpdateSignature={handleUpdateSignature}
            onDeleteSignature={handleDeleteSignature}
            savedSignatureUrl={savedSignatureUrl}
          />
        )}
      </main>

      {/* Sidebar fixed */}
      <SignatureSidebar
        savedSignatureUrl={savedSignatureUrl}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onSave={handleFinalSave}
        isLoading={isLoading}
      />
    </div>

    {/* Modal */}
    {isSignatureModalOpen && (
      <SignatureModal
        onSave={handleSaveSignature}
        onClose={() => setIsSignatureModalOpen(false)}
      />
    )}
  </div>
);


};

export default SignDocumentPage;
