/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { Toaster } from "react-hot-toast";
import SigningHeader from "../components/SigningHeader/SigningHeader";
import SignatureSidebar from "../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../components/SignatureModal/SignatureModal";
import AiAnalysisModal from "../components/AiAnalysisModal/AiAnalysisModal";
import MobileFloatingActions from "../components/Signature/MobileFloatingActions";
import PDFViewerGroup from "../components/PDFViewer/PDFViewerGroup";

// Import Modal Baru Khusus Grup
import ProcessingGroupModal from "../components/ProcessingModal/ProcessingGroupModal";

const SignDocumentLayoutGroup = ({
  currentUser,
  documentTitle,
  pdfFile,
  documentId,
  signatures,
  savedSignatureUrl,
  isLoadingDoc,
  isSaving,     // Ini TRUE saat drag-drop MAUPUN saat final save
  isAnalyzing,
  canSign,
  isSignedSuccess,
  theme,
  toggleTheme,
  isSidebarOpen,
  setIsSidebarOpen,
  isSignatureModalOpen,
  setIsSignatureModalOpen,
  isAiModalOpen,
  setIsAiModalOpen,
  includeQrCode,
  setIncludeQrCode,
  aiData,
  isLandscape,
  isPortrait,
  onAddDraft,
  onUpdateSignature,
  onDeleteSignature,
  onSaveFromModal,
  onCommitSave, // Ini fungsi final save dari hook
  handleAutoTag,
  handleAnalyzeDocument,
  handleNavigateToView
}) => {

  // [TRICK] State lokal untuk membedakan "Save Otomatis" vs "Save Manual (Tombol)"
  const [isManualSave, setIsManualSave] = useState(false);

  // Reset state manual saat proses saving selesai
  useEffect(() => {
    if (!isSaving) {
      setIsManualSave(false);
    }
  }, [isSaving]);

  // Wrapper function untuk tombol Simpan
  const handleFinalSaveClick = async () => {
    setIsManualSave(true); // Tandai ini sebagai save manual
    await onCommitSave();
  };

  if ((isLoadingDoc && !pdfFile) || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-slate-600 dark:text-slate-300">Memuat Dokumen Grup...</p>
      </div>
    );
  }

  const sidebarOpen = isLandscape ? true : isSidebarOpen;
  const hasMySignatures = signatures.some((s) => !s.isLocked);

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader theme={theme} toggleTheme={toggleTheme} onToggleSidebar={() => (canSign || isSignedSuccess) && setIsSidebarOpen(!isSidebarOpen)} />
      </header>
      <div className="absolute top-16 bottom-0 left-0 w-full flex overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {pdfFile && (
            <PDFViewerGroup
              documentTitle={documentTitle}
              fileUrl={pdfFile}
              signatures={signatures}
              savedSignatureUrl={savedSignatureUrl}
              onAddSignature={onAddDraft}
              onUpdateSignature={onUpdateSignature}
              onDeleteSignature={onDeleteSignature}
              readOnly={!canSign || isSignedSuccess}
              documentId={documentId}
              currentUser={currentUser}
            />
          )}
        </main>

        {(canSign || isSignedSuccess) && (
          <SignatureSidebar
            savedSignatureUrl={savedSignatureUrl}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            
            // [UPDATE] Gunakan Wrapper function di sini
            onSave={handleFinalSaveClick}
            
            onAutoTag={handleAutoTag}
            onAnalyze={handleAnalyzeDocument}
            isLoading={isAnalyzing || isSaving}
            includeQrCode={includeQrCode}
            setIncludeQrCode={setIncludeQrCode}
            hasPlacedSignature={hasMySignatures}
            isOpen={sidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isSignedSuccess={isSignedSuccess}
            onViewResult={handleNavigateToView}
            readOnly={!canSign || isSignedSuccess}
          />
        )}
        <AiAnalysisModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} data={aiData} isLoading={isAnalyzing} />
      </div>

      <MobileFloatingActions 
        canSign={canSign}
        isSignedSuccess={isSignedSuccess}
        hasMySignatures={hasMySignatures}
        isSaving={isSaving}
        // [UPDATE] Gunakan Wrapper function di sini juga
        onSave={handleFinalSaveClick}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenModal={() => setIsSignatureModalOpen(true)}
      />

      {isSidebarOpen && !isLandscape && canSign && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>
      )}
      {isSignatureModalOpen && <SignatureModal onSave={onSaveFromModal} onClose={() => setIsSignatureModalOpen(false)} />}
      
      {/* [LOGIKA MODAL] 
          Hanya muncul jika SEDANG SAVING (dari hook) DAN DIPICU SECARA MANUAL (tombol)
      */}
      <ProcessingGroupModal isOpen={isSaving && isManualSave} />
    </div>
  );
};

export default SignDocumentLayoutGroup;