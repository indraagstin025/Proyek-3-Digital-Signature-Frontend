// file: src/pages/SignGroupPages/SignGroupPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

import SignDocumentLayout from "../../layouts/SignDocumentLayout";
import { useDocumentDetail } from "../../hooks/useDocumentDetail";
import { useSignatureManager } from "../../hooks/useSignatureManager";

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

  // Responsive
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

  // --- HANDLER REFRESH STABIL ---
  // ✅ PENTING: Gunakan useCallback agar referensi fungsi ini STABIL
  // Ini mencegah useEffect di dalam hook useSignatureManager me-reset koneksi socket terus-menerus.
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
    isGroupDoc // API info
  } = useDocumentDetail(documentId, contextData, refreshKey);

  // Jika dokumen ternyata Personal, redirect ke halaman personal
  useEffect(() => {
    if (!isLoadingDoc && isGroupDoc === false) {
       toast("Ini dokumen personal.", { icon: "👤" });
       navigate(`/documents/${documentId}/sign`);
    }
  }, [isLoadingDoc, isGroupDoc, navigate, documentId]);

  // 2. Hook Signature Manager (HIDUPKAN SOCKET dengan isGroupDoc={true})
  const {
    signatures,
    isSaving,
    isAnalyzing,
    aiData,
    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleFinalSave,
    handleAutoTag,
    handleAnalyzeDocument
  } = useSignatureManager({
    documentId,
    documentVersionId,
    currentUser,
    isGroupDoc: true, // <--- PENTING: Aktifkan WebSocket & logic grup
    refreshKey,
    onRefreshRequest: handleRefreshRequest // ✅ Gunakan handler stabil di sini
  });

  // Handlers (Sama persis dengan SignDocumentPage, hanya beda pesan sukses)
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
      toast.success("Tanda tangan disimpan! Menunggu anggota lain.");
      setIsSignedSuccess(true);
      // Trigger refresh via handler yang sudah ada
      handleRefreshRequest();
    } catch (error) {
      toast.error(error.message || "Gagal menyimpan.");
    }
  };

  const handleNavigateToView = () => navigate(`/documents/${documentId}/view`);
  useEffect(() => { if(aiData) setIsAiModalOpen(true); }, [aiData]);

  return (
    <SignDocumentLayout
      currentUser={currentUser}
      isLoadingDoc={isLoadingDoc}
      pdfFile={pdfFile}
      documentTitle={`[GROUP] ${documentTitle}`} // Pembeda visual di judul
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
      isLandscape={isLandscape}
      isPortrait={isPortrait}
      includeQrCode={includeQrCode}
      setIncludeQrCode={setIncludeQrCode}
      aiData={aiData}

      onAddDraft={onAddDraft}
      onUpdateSignature={handleUpdateSignature}
      onDeleteSignature={handleDeleteSignature}
      onSaveFromModal={onSaveFromModal}
      onCommitSave={onCommitSave}
      handleAutoTag={handleAutoTag}
      handleAnalyzeDocument={handleAnalyzeDocument}
      handleNavigateToView={handleNavigateToView}
    />
  );
};

export default SignGroupPage;