/* eslint-disable no-unused-vars */
import React from "react";
import { Toaster } from "react-hot-toast";
import { FaSpinner, FaChevronRight, FaChevronLeft, FaPenNib, FaSave, FaTools, FaRobot } from "react-icons/fa";

// Components
import SignatureHeaderCommon from "../components/SigningHeader/SignatureHeaderCommon";
import PDFViewer from "../components/PDFViewer/PDFViewer";
import SignatureSidebar from "../components/SignatureSidebar/SignatureSidebar";
import SignatureModal from "../components/SignatureModal/SignatureModal";
import ProcessStatus from "../components/ProcessStatus/ProcessStatus";
import AiAnalysisModal from "../components/AiAnalysisModal/AiAnalysisModal";

const SignPackageLayout = ({
  theme,
  toggleTheme,
  packageDetails,
  currentDocumentTitle,
  currentPdfBlobUrl,
  currentSignatures,
  savedSignatureUrl,
  includeQrCode,
  totalDocs,
  currentIndex,
  isLastDocument,
  processingTitle,
  error,
  isLoading,
  isSubmitting,
  isSidebarOpen,
  isLandscape,
  isSignatureModalOpen,
  isSaving,
  progressIndex, // Ini dikirim ke modal sebagai currentDocIndex
  isAiModalOpen,
  isAiLoading,
  aiAnalysisData,
  setIsSidebarOpen,
  setIsSignatureModalOpen,
  setIsAiModalOpen,
  setIncludeQrCode,
  handleAddSignature,
  handleUpdateSignature,
  handleDeleteSignature,
  handleSignatureSave,
  handleNextOrSubmit,
  handleAutoTag,
  handleAnalyzeCurrentDocument,
  handleManualCancel,
  navigateDocument,
}) => {

  const sidebarOpen = isLandscape ? true : isSidebarOpen;

  // Pastikan logika tombol Sidebar aktif
  const hasPlacedSignature = currentSignatures && currentSignatures.length > 0;

  if (isLoading && !currentPdfBlobUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Memuat Paket Dokumen...</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />

      {/* --- MODALS --- */}
      {isSignatureModalOpen && (
        <SignatureModal onClose={() => setIsSignatureModalOpen(false)} onSave={handleSignatureSave} />
      )}

      <ProcessStatus
        isOpen={isSaving}
        customMessage={
          processingTitle
            ? `Memproses: ${processingTitle}`
            : "Menyimpan paket dokumen..."
        }
      />

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        data={aiAnalysisData}
        isLoading={isAiLoading}
        dbDocumentType={packageDetails?.documents[currentIndex]?.docVersion?.document?.type}
      />

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 w-full h-16 z-50">
        <SignatureHeaderCommon theme={theme} toggleTheme={toggleTheme} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </header>

      {/* --- NAV BAR --- */}
      <div className={`fixed top-16 left-0 w-full h-12 z-40 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200/80 dark:border-white/10`}>
        <div className="flex items-center justify-center h-full px-4">
          <button onClick={() => navigateDocument("prev")} disabled={currentIndex === 0} className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"><FaChevronLeft className="w-5 h-5" /></button>
          <div className="text-center mx-4 flex-1 min-w-0 max-w-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Paket: {packageDetails?.title}</p>
            <h3 className="font-semibold text-base text-slate-800 dark:text-white truncate">{currentDocumentTitle} ({currentIndex + 1} dari {totalDocs})</h3>
          </div>
          <button onClick={() => navigateDocument("next")} disabled={isLastDocument} className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"><FaChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="absolute top-[112px] bottom-0 left-0 w-full flex overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {currentPdfBlobUrl && (
            <PDFViewer
              key={currentPdfBlobUrl}
              fileUrl={currentPdfBlobUrl}
              documentTitle={currentDocumentTitle}
              signatures={currentSignatures}
              onAddSignature={handleAddSignature}
              onUpdateSignature={handleUpdateSignature}
              onDeleteSignature={handleDeleteSignature}
              savedSignatureUrl={savedSignatureUrl}
            />
          )}
        </main>
        <SignatureSidebar
          savedSignatureUrl={savedSignatureUrl}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onSave={handleNextOrSubmit}
          onAutoTag={handleAutoTag}
          isLoading={isSubmitting}
          includeQrCode={includeQrCode}
          setIncludeQrCode={setIncludeQrCode}
          hasPlacedSignature={hasPlacedSignature}
          isOpen={sidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAnalyze={handleAnalyzeCurrentDocument}
        />
      </div>

      {/* --- MOBILE FABs --- */}
      <div className="fixed top-32 right-4 z-50 md:hidden flex flex-col items-end gap-3 pointer-events-none">
        <button onClick={handleAnalyzeCurrentDocument} className="pointer-events-auto w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center"><FaRobot size={14} /></button>
        {hasPlacedSignature && (
          <button onClick={handleNextOrSubmit} disabled={isSubmitting} className="pointer-events-auto w-10 h-10 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center">
            {isSubmitting ? <FaSpinner className="animate-spin text-xs" /> : isLastDocument ? <FaSave size={16} /> : <FaChevronRight size={16} />}
          </button>
        )}
        <button onClick={() => setIsSidebarOpen(true)} className="pointer-events-auto w-10 h-10 rounded-full bg-slate-700 text-white shadow-lg flex items-center justify-center"><FaTools size={14} /></button>
        <button onClick={() => setIsSignatureModalOpen(true)} className="pointer-events-auto w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center"><FaPenNib size={16} /></button>
      </div>

      {isSidebarOpen && !isLandscape && (<div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden"></div>)}
    </div>
  );
};

export default SignPackageLayout;