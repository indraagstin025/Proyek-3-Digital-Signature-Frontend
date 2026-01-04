// file: src/pages/SignDocumentPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaRobot } from "react-icons/fa";

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
  const { currentUser, documentTitle, pdfFile, documentVersionId, documentData, canSign, isSignedSuccess, setIsSignedSuccess, isLoadingDoc, isGroupDoc } = useDocumentDetail(documentId, contextData, refreshKey);

  // Redirect Logic untuk Dokumen Group
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
    documentData, // ✅ Pass untuk optimize fetching
    onRefreshRequest: () => setRefreshKey((prev) => prev + 1),
  });

  // Effect: Buka modal jika analisis selesai atau sedang berjalan
  useEffect(() => {
    if (isAnalyzing || aiData) {
      setIsAiModalOpen(true);
    }
  }, [isAnalyzing, aiData]);

  // ============================================================
  // 🔥 PERBAIKAN DI SINI (onSaveFromModal)
  // ============================================================
  const onSaveFromModal = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl); // 1. Simpan URL Tanda Tangan
    setIsSignatureModalOpen(false); // 2. Tutup Modal Tanda Tangan

    // ✅ 3. Otomatis Buka Sidebar (Agar user di HP langsung bisa drag/tap)
    setIsSidebarOpen(true);
  }, []);

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
      const errorMessage = error.message || "";

      console.log("[Debug Save] Error:", { backendMessage, errorMessage });

      if (backendMessage.toLowerCase().includes("selesai") || backendMessage.toLowerCase().includes("completed") || backendMessage.toLowerCase().includes("already signed") || backendMessage.toLowerCase().includes("sudah ditandatangani")) {
        toast.success("Status diperbarui: Dokumen sudah tersimpan.");
        setIsSignedSuccess(true);
        setRefreshKey((prev) => prev + 1);
        return;
      }

      if (errorMessage === "Offline-Detected" || errorMessage === "Network Error") {
        toast.error("Gagal menyimpan. Koneksi internet terputus.", {
          id: "save-offline-error",
        });
        return;
      }

      toast.error(backendMessage || errorMessage || "Gagal menyimpan.");
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
    </>
  );
};

export default SignDocumentPage;
