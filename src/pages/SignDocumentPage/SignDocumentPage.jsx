// file: src/pages/SignDocumentPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaRobot } from "react-icons/fa"; // [BARU] Import Icon Robot

// Layout & Hooks
import SignDocumentLayout from "../../layouts/SignDocumentLayout";
import { useDocumentDetail } from "../../hooks/useDocumentDetail";
import { useSignatureManager } from "../../hooks/useSignatureManager";

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
    isGroupDoc,
  } = useDocumentDetail(documentId, contextData, refreshKey);

  // Redirect Logic untuk Dokumen Group
  useEffect(() => {
    if (!isLoadingDoc && isGroupDoc) {
        toast("Mengalihkan ke mode Grup...", { icon: "👥" });
        navigate(`/documents/${documentId}/group-sign`);
    }
  }, [isGroupDoc, isLoadingDoc, navigate, documentId]);

  // 2. Hook Signature Manager
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
    isGroupDoc: false, 
    refreshKey,
    onRefreshRequest: () => setRefreshKey(prev => prev + 1)
  });

  // Effect: Buka modal jika analisis selesai atau sedang berjalan
  useEffect(() => {
    if (isAnalyzing || aiData) {
      setIsAiModalOpen(true);
    }
  }, [isAnalyzing, aiData]);

  // Handlers
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
      toast.success("Dokumen selesai ditandatangani!");
      setIsSignedSuccess(true);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error(error.message || "Gagal menyimpan.");
    }
  };

  const handleNavigateToView = () => navigate(`/documents/${documentId}/view`);

  // Render
  return (
    <>
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
      />

      {/* [BARU] Tombol AI Melayang (FAB) Khusus Mobile */}
      {/* Hanya tampil di Mobile (md:hidden) agar tidak duplikat dengan sidebar desktop */}
      <div className="fixed top-20 right-4 z-50 md:hidden flex flex-col items-end gap-3 pointer-events-none">
        
        <button
          onClick={handleAnalyzeDocument}
          className="pointer-events-auto w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all transform hover:scale-110 active:scale-90"
          title="Analisis AI"
        >
          <FaRobot size={18} className={isAnalyzing ? "animate-bounce" : ""} />
        </button>

      </div>
    </>
  );
};

export default SignDocumentPage;