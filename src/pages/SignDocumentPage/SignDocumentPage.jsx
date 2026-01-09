// file: src/pages/SignDocumentPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import OnboardingTour from "../../components/common/OnboardingTour";
// 🔥 IMPORT STEPS YANG SUDAH DIPISAH
import { SIGNING_STEPS_DESKTOP, SIGNING_STEPS_MOBILE } from "../../constants/tourSteps";

// Layout & Hooks
import SignDocumentLayout from "../../layouts/SignDocumentLayout";
import { useDocumentDetail } from "../../hooks/Documents/useDocumentDetail";
import { useSignatureManager } from "../../hooks/Signature/useSignatureManager";

const SignDocumentPage = ({ theme, toggleTheme }) => {
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
  
  // 🔥 State untuk Visual Hint (Tekan & Tarik)
  const [showDragHint, setShowDragHint] = useState(false);

  // Responsive & Tour Logic
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [isMobileTour, setIsMobileTour] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsLandscape(width > window.innerHeight);
      setIsPortrait(window.innerHeight > width);
      setIsMobileTour(width < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Hook Document Detail
  const { currentUser, documentTitle, pdfFile, documentVersionId, documentData, canSign, isSignedSuccess, setIsSignedSuccess, isLoadingDoc, isGroupDoc } = useDocumentDetail(documentId, contextData, refreshKey);

  // Redirect Logic
  useEffect(() => {
    if (!isLoadingDoc && isGroupDoc) {
      toast("Mengalihkan ke mode Grup...", { icon: "👥" });
      navigate(`/documents/${documentId}/group-sign`);
    }
  }, [isGroupDoc, isLoadingDoc, navigate, documentId]);

  // 2. Hook Signature Manager
  const { signatures, isSaving, isAnalyzing, aiData, handleAddSignature, handleUpdateSignature, handleDeleteSignature, handleFinalSave, handleAutoTag, handleAnalyzeDocument } = useSignatureManager({
    documentId,
    documentVersionId,
    currentUser,
    isGroupDoc: false,
    refreshKey,
    documentData, 
    onRefreshRequest: () => setRefreshKey((prev) => prev + 1),
  });

  useEffect(() => {
    if (isAnalyzing || aiData) setIsAiModalOpen(true);
  }, [isAnalyzing, aiData]);

  // ============================================================
  // 🔥 LOGIC: SAVE MODAL & VISUAL HINT
  // ============================================================
  const onSaveFromModal = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl);
    setIsSignatureModalOpen(false);
    
    // 1. Buka Sidebar agar user melihat tanda tangannya (Desktop Only)
    // Di Mobile, sidebar mungkin menutupi layar, jadi biarkan tertutup atau sesuai preferensi
    if (!isMobileTour) {
        setIsSidebarOpen(true);
    } else {
        // Opsional: Buka sidebar di mobile juga jika ingin user langsung melihat hasil
        setIsSidebarOpen(true); 
    }

    // 2. Nyalakan Hint Visual (Hanya jika dokumen sudah siap)
    setShowDragHint(true);

    // 3. Matikan Hint otomatis setelah 5 detik
    setTimeout(() => {
      setShowDragHint(false);
    }, 5000);
  }, [isMobileTour]);

  const onAddDraft = useCallback(
    (data) => {
      if (!canSign) return;
      handleAddSignature(data, savedSignatureUrl, includeQrCode);
    },
    [canSign, handleAddSignature, savedSignatureUrl, includeQrCode]
  );

  const onCommitSave = async () => {
    if (isSaving) return;
    try {
      await handleFinalSave(includeQrCode);
      toast.success("Dokumen selesai ditandatangani!");
      setIsSignedSuccess(true);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      const backendMessage = error.response?.data?.message || "";
      toast.error(backendMessage || "Gagal menyimpan.");
    }
  };

  const handleNavigateToView = () => navigate(`/documents/${documentId}/view`);

  return (
    <>
      {/* 🔥 TOUR GUIDE: HANYA MUNCUL SETELAH LOADING SELESAI */}
      {!isLoadingDoc && pdfFile && (
        <OnboardingTour 
          tourKey="signing_intro" 
          // Pilih steps berdasarkan ukuran layar
          steps={isMobileTour ? SIGNING_STEPS_MOBILE : SIGNING_STEPS_DESKTOP} 
          // Hanya buka sidebar otomatis jika di Desktop (karena targetnya ada di dalam sidebar)
          onOpenSidebar={isMobileTour ? undefined : () => setIsSidebarOpen(true)}
        />
      )}

      <SignDocumentLayout
        currentUser={currentUser}
        isLoadingDoc={isLoadingDoc}
        pdfFile={pdfFile}
        documentTitle={documentTitle}
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
        
        // 🔥 PROP HINT DIKIRIM KE LAYOUT
        showDragHint={showDragHint}
      />
    </>
  );
};

export default SignDocumentPage;