/* eslint-disable no-unused-vars */
import React from "react";
import { FaSpinner, FaCheckCircle, FaDownload, FaArrowRight, FaFilePdf } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

// Components
import SignatureHeaderCommon from "../components/SigningHeader/SignatureHeaderCommon";
import SignatureSidebar from "../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../components/SignatureModal/SignatureModal";
import PDFViewer from "../components/PDFViewer/PDFViewer";
import AiAnalysisModal from "../components/AiAnalysisModal/AiAnalysisModal";
import MobileFloatingActions from "../components/Signature/MobileFloatingActions";
import ProcessingModal from "../components/ProcessingModal/ProcessingModal";
import ConnectionStatus from "../components/ConnectionStatus"; // ✅ [BARU] Status koneksi socket

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

  // UI Controls
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

  // Handlers
  onAddDraft,
  onUpdateSignature,
  onDeleteSignature,
  onSaveFromModal,
  onCommitSave,
  handleAutoTag,
  handleAnalyzeDocument,
  handleNavigateToView,

  // 🔥 PROP BARU DITERIMA
  showDragHint
}) => {

  // --- 1. HANDLING LOADING AWAL ---
  if ((isLoadingDoc && !pdfFile) || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-slate-600 dark:text-slate-300">Memuat Dokumen...</p>
      </div>
    );
  }

  // --- 2. LAYAR SUKSES ---
  if (isSignedSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in-up">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center border border-slate-100 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaCheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Selesai!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            Dokumen <strong>{documentTitle}</strong> berhasil ditandatangani dan diamankan.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleNavigateToView}
              className="w-full py-3 px-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>Lihat Detail</span>
              <FaArrowRight size={12} />
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <FaFilePdf />
              <span>WeSign Secure Processing</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. LAYAR UTAMA (SIGNING) ---
  const sidebarOpen = isLandscape ? true : isSidebarOpen;
  const hasPlacedSignature = signatures.some((s) => !s.isLocked);

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />

      {/* ✅ [BARU] Banner Status Koneksi Socket */}
      <ConnectionStatus />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SignatureHeaderCommon
          theme={theme}
          toggleTheme={toggleTheme}
          onToggleSidebar={() => canSign && setIsSidebarOpen(!isSidebarOpen)}
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
              readOnly={!canSign}
            />
          )}
        </main>

        {/* Sidebar */}
        {canSign && (
          <SignatureSidebar
            savedSignatureUrl={savedSignatureUrl}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onSave={onCommitSave}
            onAutoTag={handleAutoTag}
            onAnalyze={handleAnalyzeDocument}
            isLoading={isAnalyzing || isSaving}
            includeQrCode={includeQrCode}
            setIncludeQrCode={setIncludeQrCode}
            hasPlacedSignature={hasPlacedSignature}
            isOpen={sidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isSignedSuccess={isSignedSuccess}
            onViewResult={handleNavigateToView}
            readOnly={!canSign}
            // 🔥 OPER KE SIDEBAR UNTUK EFEK VISUAL
            showDragHint={showDragHint}
          />
        )}

        <AiAnalysisModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          data={aiData}
          isLoading={isAnalyzing}
        />
      </div>

      {/* Mobile Controls & Overlay */}
      <MobileFloatingActions
        canSign={canSign}
        isSignedSuccess={isSignedSuccess}
        hasMySignatures={hasPlacedSignature}
        isSaving={isSaving}
        onSave={onCommitSave}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenModal={() => setIsSignatureModalOpen(true)}
        onAnalyze={handleAnalyzeDocument}
        isAnalyzing={isAnalyzing}
      />

      {isSidebarOpen && !isLandscape && canSign && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-transparent z-30 md:hidden"></div>
      )}

      {isSignatureModalOpen && (
        <SignatureModal onSave={onSaveFromModal} onClose={() => setIsSignatureModalOpen(false)} />
      )}

      <ProcessingModal isOpen={isSaving} />
    </div>
  );
};

export default SignDocumentLayout;