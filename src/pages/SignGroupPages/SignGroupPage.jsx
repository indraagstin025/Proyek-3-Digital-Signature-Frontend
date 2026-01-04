import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

import SignDocumentLayoutGroup from "../../layouts/SignDocumentLayoutGroup";
import { useDocumentDetail } from "../../hooks/Documents/useDocumentDetail";
import { useSignatureManagerGroup } from "../../hooks/Signature/useSignatureManagerGroup"; 

const SignGroupPage = ({ theme, toggleTheme }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const contextData = useOutletContext();
  
  // UI State
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
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

  useEffect(() => {
    if (!isLoadingDoc && isGroupDoc === false) {
       toast("Halaman ini khusus Grup. Mengalihkan ke Penandatanganan Personal...", { icon: "👤" });
       navigate(`/documents/${documentId}/sign`);
    }
  }, [isLoadingDoc, isGroupDoc, navigate, documentId]);

  // 2. Hook Signature Manager GROUP 
  // ⚠️ WAJIB DIPANGGIL DULUAN SEBELUM VARIABEL 'signatures' DIPAKAI
  const {
    signatures, // <--- Ini didefinisikan di sini
    isSaving,
    isAnalyzing,
    aiData,
    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleFinalSave,
    handleAutoTag,       
    handleAnalyzeDocument,
    activeUsers
  } = useSignatureManagerGroup({
    documentId,
    documentVersionId,
    currentUser,
    refreshKey,
    onRefreshRequest: handleRefreshRequest
  });

  // 🔥 [PERBAIKAN] Pindahkan logika ini ke SINI (Setelah signatures didefinisikan)
  const hasPlacedSignature = signatures?.some(
    (s) => String(s.userId) === String(currentUser?.id) && s.status === "draft"
  );

  const handleAnalyzeClick = useCallback(() => {
    setIsAiModalOpen(true); 
    handleAnalyzeDocument(); 
  }, [handleAnalyzeDocument]);

  useEffect(() => {
    if (aiData) {
      setIsAiModalOpen(true);
    }
  }, [aiData]);

  const onSaveFromModal = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl);
    setIsSignatureModalOpen(false);
    setIsSidebarOpen(true); 
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
    <>
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
        
        isAnalyzing={isAnalyzing} 
        
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSignatureModalOpen={isSignatureModalOpen}
        setIsSignatureModalOpen={setIsSignatureModalOpen}
        
        isAiModalOpen={isAiModalOpen}
        setIsAiModalOpen={setIsAiModalOpen} 
        aiData={aiData}
        handleAutoTag={handleAutoTag}      
        handleAnalyzeDocument={handleAnalyzeClick} 

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
        
        activeUsers={activeUsers}
        
        // ✅ Kirim prop ke layout
        hasPlacedSignature={hasPlacedSignature}
      />
    </>
  );
};

export default SignGroupPage;