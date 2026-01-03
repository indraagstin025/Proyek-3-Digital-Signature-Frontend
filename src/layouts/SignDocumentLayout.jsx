/* eslint-disable no-unused-vars */
import React from "react";
import { FaSpinner } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

// Components
import SigningHeader from "../components/SigningHeader/SigningHeader";
import SignatureSidebar from "../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../components/SignatureModal/SignatureModal";
import PDFViewer from "../components/PDFViewer/PDFViewer";
import AiAnalysisModal from "../components/AiAnalysisModal/AiAnalysisModal";
import MobileFloatingActions from "../components/Signature/MobileFloatingActions";
import ProcessingModal from "../components/ProcessingModal/ProcessingModal";

const SignDocumentLayout = ({
  // Data
  currentUser,
  documentTitle,
  pdfFile,
  documentId,
  signatures,
  savedSignatureUrl,
  
  // Status
  isLoadingDoc,
  isSaving,
  isAnalyzing,
  canSign,
  isSignedSuccess,
  
  // UI Controls (Props dari Parent)
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

  // Handlers (Fungsi dari Parent)
  onAddDraft,
  onUpdateSignature,
  onDeleteSignature,
  onSaveFromModal,
  onCommitSave,
  handleAutoTag,
  handleAnalyzeDocument,
  handleNavigateToView
}) => {

  if ((isLoadingDoc && !pdfFile) || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-slate-600 dark:text-slate-300">Memuat Dokumen...</p>
      </div>
    );
  }

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

  // [PERBAIKAN] Hitung apakah ada tanda tangan milik user di canvas (yang belum di-lock)
  // Di Personal Sign, tanda tangan baru memiliki isLocked: false
  const hasPlacedSignature = signatures.some((s) => !s.isLocked);

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SigningHeader 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onToggleSidebar={() => (canSign || isSignedSuccess) && setIsSidebarOpen(!isSidebarOpen)} 
        />
      </header>

      {/* Main Content */}
      <div className="absolute top-16 bottom-0 left-0 w-full flex overflow-hidden">
        
        {/* PDF Viewer */}
        <main className="flex-1 overflow-hidden">
          {pdfFile && (
            <PDFViewer
              documentId={documentId}
              documentTitle={documentTitle}
              fileUrl={pdfFile}
              signatures={signatures}
              onAddSignature={onAddDraft}
              onUpdateSignature={onUpdateSignature}
              onDeleteSignature={onDeleteSignature}
              savedSignatureUrl={savedSignatureUrl}
              readOnly={!canSign || isSignedSuccess}
            />
          )}
        </main>

        {/* Sidebar */}
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
            
            // [PERBAIKAN] Kirim prop ini agar tombol menyala
            hasPlacedSignature={hasPlacedSignature} 
            
            isOpen={sidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isSignedSuccess={isSignedSuccess}
            onViewResult={handleNavigateToView}
            readOnly={!canSign || isSignedSuccess}
          />
        )}

        <AiAnalysisModal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
          data={aiData} 
          isLoading={isAnalyzing} 
        />
      </div>

      {/* Mobile Controls */}
      <MobileFloatingActions 
        canSign={canSign}
        isSignedSuccess={isSignedSuccess}
        // [PERBAIKAN] Gunakan variabel yang sudah dihitung agar konsisten
        hasMySignatures={hasPlacedSignature}
        isSaving={isSaving}
        onSave={onCommitSave}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenModal={() => setIsSignatureModalOpen(true)}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && !isLandscape && canSign && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>
      )}

      {/* Signature Modal */}
      {isSignatureModalOpen && (
        <SignatureModal onSave={onSaveFromModal} onClose={() => setIsSignatureModalOpen(false)} />
      )}

      <ProcessingModal isOpen={isSaving} />
    </div>
  );
};

export default SignDocumentLayout;