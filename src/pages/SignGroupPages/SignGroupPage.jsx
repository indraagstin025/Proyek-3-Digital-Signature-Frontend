import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

import SignDocumentLayoutGroup from "../../layouts/SignDocumentLayoutGroup";
import { useDocumentDetail } from "../../hooks/useDocumentDetail";
import { useSignatureManagerGroup } from "../../hooks/useSignatureManagerGroup"; 

const SignGroupPage = ({ theme, toggleTheme }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const contextData = useOutletContext();
  
  // UI State
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  // [REMOVED] AI Modal State
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  // Responsive Check
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRefreshRequest = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // 1. Hook Document Detail
  const {
    currentUser,
    documentTitle,
    pdfFile,
    documentVersionId,
    canSign,
    isSignedSuccess,
    setIsSignedSuccess,
    isLoadingDoc,
    isGroupDoc 
  } = useDocumentDetail(documentId, contextData, refreshKey);

  // 1.1 LOGIKA REDIRECT AUTOMATIS:
  // Jika akses via URL group-sign tapi ternyata dokumen personal, pindahkan ke sign page biasa.
  useEffect(() => {
    if (!isLoadingDoc && isGroupDoc === false) {
       // KODE LAMA (Nonaktif):
       // toast("Ini dokumen personal.", { icon: "👤" });
       // navigate(`/documents/${documentId}/sign`);

       // KODE BARU: Dengan pesan yang lebih jelas
       toast("Halaman ini khusus Grup. Mengalihkan ke Penandatanganan Personal...", { icon: "👤" });
       navigate(`/documents/${documentId}/sign`);
    }
  }, [isLoadingDoc, isGroupDoc, navigate, documentId]);

  // 2. Hook Signature Manager GROUP (NO AI)
  const {
    signatures,
    isSaving,
    // [REMOVED] isAnalyzing, aiData
    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleFinalSave,
  } = useSignatureManagerGroup({
    documentId,
    documentVersionId,
    currentUser,
    refreshKey,
    onRefreshRequest: handleRefreshRequest
  });

  const onSaveFromModal = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl);
    setIsSignatureModalOpen(false);
  }, []);

  const onAddDraft = useCallback((data) => {
    if(!canSign) return;
    handleAddSignature(data, savedSignatureUrl, includeQrCode);
  }, [canSign, handleAddSignature, savedSignatureUrl, includeQrCode]);

  const onCommitSave = async () => {
    try {
      await handleFinalSave(includeQrCode);
      toast.success("Tanda tangan berhasil dikirim!");
      setIsSignedSuccess(true);
      handleRefreshRequest();
    } catch (error) {
      toast.error(error.message || "Gagal menyimpan.");
    }
  };

  const handleNavigateToView = () => navigate(`/documents/${documentId}/view`);

  return (
    <SignDocumentLayoutGroup
      currentUser={currentUser}
      isLoadingDoc={isLoadingDoc}
      pdfFile={pdfFile}
      documentTitle={`[GROUP] ${documentTitle}`}
      documentId={documentId}
      signatures={signatures}
      savedSignatureUrl={savedSignatureUrl}
      canSign={canSign}
      isSignedSuccess={isSignedSuccess}
      isSaving={isSaving}
      
      // [REMOVED] isAnalyzing
      isAnalyzing={false} // Force false
      
      theme={theme}
      toggleTheme={toggleTheme}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      isSignatureModalOpen={isSignatureModalOpen}
      setIsSignatureModalOpen={setIsSignatureModalOpen}
      
      // [REMOVED] AI Modal Props
      isAiModalOpen={false}
      setIsAiModalOpen={() => {}} 
      aiData={null}
      handleAutoTag={null}      // Disable AI
      handleAnalyzeDocument={null} // Disable AI

      isLandscape={isLandscape}
      isPortrait={isPortrait}
      includeQrCode={includeQrCode}
      setIncludeQrCode={setIncludeQrCode}

      onAddDraft={onAddDraft}
      onUpdateSignature={handleUpdateSignature}
      onDeleteSignature={handleDeleteSignature}
      onSaveFromModal={onSaveFromModal}
      onCommitSave={onCommitSave}
      handleNavigateToView={handleNavigateToView}
    />
  );
};

export default SignGroupPage;