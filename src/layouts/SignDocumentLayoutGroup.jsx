import React from "react";
import { FaSpinner } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

import SigningHeader from "../components/SigningHeader/SigningHeader";
import SignatureSidebar from "../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../components/SignatureModal/SignatureModal";
import AiAnalysisModal from "../components/AiAnalysisModal/AiAnalysisModal";
import MobileFloatingActions from "../components/Signature/MobileFloatingActions";
import ProcessingModal from "../components/ProcessingModal/ProcessingModal";

import PDFViewerGroup from "../components/PDFViewer/PDFViewerGroup";

const SignDocumentLayoutGroup = ({
  currentUser,
  documentTitle,
  pdfFile,
  documentId,
  signatures,
  savedSignatureUrl,

  isLoadingDoc,
  isSaving,
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
  onCommitSave,
  handleAutoTag,
  handleAnalyzeDocument,
  handleNavigateToView,
  hasPlacedSignature,
  activeUsers,
}) => {
  if ((isLoadingDoc && !pdfFile) || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-slate-600 dark:text-slate-300">Memuat Dokumen Grup...</p>
      </div>
    );
  }

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      {/* Toast Notification Container */}
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader theme={theme} toggleTheme={toggleTheme} activeUsers={activeUsers} currentUser={currentUser} onToggleSidebar={() => (canSign || isSignedSuccess) && setIsSidebarOpen(!isSidebarOpen)} />
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="absolute top-16 bottom-0 left-0 w-full flex overflow-hidden">
        {/* 櫨 PDF VIEWER KHUSUS GROUP 櫨 */}
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

        {/* SIDEBAR (Tools & Save) */}
        {(canSign || isSignedSuccess) && (
          <SignatureSidebar
            savedSignatureUrl={savedSignatureUrl}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onSave={onCommitSave}
            onAutoTag={handleAutoTag}
            onAnalyze={handleAnalyzeDocument}
            isLoading={isAnalyzing || isSaving}
            includeQrCode={includeQrCode}
            setIncludeQrCode={setIncludeQrCode}
            isOpen={sidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isSignedSuccess={isSignedSuccess}
            onViewResult={handleNavigateToView}
            readOnly={!canSign || isSignedSuccess}
            hasPlacedSignature={hasPlacedSignature}
          />
        )}

        {/* AI ANALYSIS MODAL */}
        <AiAnalysisModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} data={aiData} isLoading={isAnalyzing} />
      </div>

      {/* MOBILE FLOATING ACTIONS */}
      <MobileFloatingActions
        canSign={canSign}
        isSignedSuccess={isSignedSuccess}
        hasMySignatures={signatures.some((s) => !s.isLocked)}
        isSaving={isSaving}
        onSave={onCommitSave}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenModal={() => setIsSignatureModalOpen(true)}
        onAnalyze={handleAnalyzeDocument}
        isAnalyzing={isAnalyzing}
      />

      {/* MOBILE OVERLAY (Black background saat sidebar buka di HP) */}
      {isSidebarOpen && !isLandscape && canSign && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>}

      {/* MODALS LAINNYA */}
      {isSignatureModalOpen && <SignatureModal onSave={onSaveFromModal} onClose={() => setIsSignatureModalOpen(false)} />}

      <ProcessingModal isOpen={isSaving} />
    </div>
  );
};

export default SignDocumentLayoutGroup;
