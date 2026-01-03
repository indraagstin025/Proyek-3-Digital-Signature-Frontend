import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { FaChevronLeft, FaChevronRight, FaTimes, FaSearchMinus, FaSearchPlus, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

// CSS Standar React-PDF
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// [FIX PENTING] Gunakan Worker dari UNPKG agar versinya otomatis SAMA dengan package react-pdf yang terinstall.
// Ini menyamakan konfigurasi dengan ViewDocumentPage.jsx yang sudah berhasil.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ViewDocumentModal = ({ isOpen, onClose, url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(800);
  const [loadError, setLoadError] = useState(null);

  const containerRef = useRef(null);
  const pagesRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setScale(1.0);
      setLoadError(null);
      // Validasi URL saat modal dibuka
      if (!url) {
        setLoadError("URL dokumen tidak valid. Silakan coba lagi.");
      }
    }
  }, [isOpen, url]);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    console.log(`✅ [Modal] PDF Loaded. Pages: ${nextNumPages}`);
    setNumPages(nextNumPages);
    setPageNumber(1);
    setLoadError(null);
  }

  function onDocumentLoadError(error) {
    console.error("❌ [Modal] Error loading PDF:", error);
    let msg = "Gagal memuat dokumen.";
    if (error.message) msg += ` (${error.message})`;
    if (error.name === "InvalidPDFException") msg = "Struktur PDF rusak atau versi worker tidak cocok.";
    setLoadError(msg);
  }

  // Tambahan: Handler untuk error source (Network/404)
  function onDocumentSourceError(error) {
    console.error("❌ [Modal] Source Error:", error);
    setLoadError("Gagal mengunduh file (Network Error / CORS).");
  }

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      setContainerWidth(width - 32);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => updateWidth(), 100);
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      clearTimeout(timer);
    };
  }, [isOpen, updateWidth]);

  const scrollToPage = (pageIndex) => {
    if (pagesRef.current[pageIndex]) {
      pagesRef.current[pageIndex].scrollIntoView({ behavior: "smooth" });
      setPageNumber(pageIndex + 1);
    }
  };

  const handleScroll = (e) => {
    const scrollPos = e.target.scrollTop;
    const scrollMid = scrollPos + e.target.clientHeight / 3;

    let currentPage = 1;
    for (let i = 0; i < pagesRef.current.length; i++) {
      const pageEl = pagesRef.current[i];
      if (pageEl && pageEl.offsetTop <= scrollMid) {
        currentPage = i + 1;
      }
    }
    setPageNumber(currentPage);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-gray-900 w-full max-w-7xl h-full sm:h-[90vh] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:px-6 bg-gray-800 border-b border-gray-700 gap-3">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <p className="font-semibold text-white text-sm sm:text-base">
              Page {pageNumber} <span className="text-gray-400">/ {numPages || "--"}</span>
            </p>
            <button onClick={onClose} className="sm:hidden text-gray-400 hover:text-white p-2">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="flex items-center gap-1 mr-4">
              <button onClick={() => setScale((s) => Math.max(0.5, s - 0.1))} className="p-2 text-gray-400 hover:text-white">
                <FaSearchMinus />
              </button>
              <span className="text-xs text-gray-400 w-8 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale((s) => Math.min(2.0, s + 0.1))} className="p-2 text-gray-400 hover:text-white">
                <FaSearchPlus />
              </button>
            </div>
            <button onClick={onClose} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex flex-grow overflow-hidden relative">
          {/* SIDEBAR (Thumbnails) */}
          <div className="hidden md:block w-52 overflow-y-auto bg-gray-900/50 border-r border-gray-700 p-4 custom-scrollbar">
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} onSourceError={onDocumentSourceError} loading="" error="">
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`thumb_${index + 1}`}
                  className={`mb-3 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    pageNumber === index + 1 ? "border-blue-500 ring-2 ring-blue-500/20 opacity-100" : "border-transparent hover:border-gray-600 opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => scrollToPage(index)}
                >
                  <Page pageNumber={index + 1} width={150} renderAnnotationLayer={false} renderTextLayer={false} loading={<div className="h-20 bg-gray-800 animate-pulse" />} error="" />
                  <p className="text-center text-xs text-gray-400 py-1 bg-gray-800">{index + 1}</p>
                </div>
              ))}
            </Document>
          </div>

          {/* VIEWER (Main) */}
          <div ref={containerRef} className="flex-grow overflow-y-auto overflow-x-hidden p-2 sm:p-8 bg-gray-800/50 scroll-smooth custom-scrollbar" onScroll={handleScroll}>
            <div className="flex flex-col items-center min-h-full">
              {loadError ? (
                <div className="text-center py-20 text-red-400 bg-red-900/20 rounded-xl p-8 max-w-lg">
                  <FaExclamationTriangle className="text-4xl mx-auto mb-2" />
                  <h3 className="text-lg font-bold mb-2">Gagal Memuat PDF</h3>
                  <p className="text-sm opacity-80">{loadError}</p>
                </div>
              ) : (
                <Document
                  file={url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  onSourceError={onDocumentSourceError}
                  loading={
                    <div className="flex flex-col items-center justify-center py-20">
                      <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                      <p className="text-gray-400">Memuat Dokumen...</p>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} ref={(el) => (pagesRef.current[index] = el)} className="mb-4 sm:mb-8 shadow-2xl transition-transform duration-200 origin-top" style={{ transform: `scale(${scale})` }}>
                      <Page
                        pageNumber={index + 1}
                        width={containerWidth}
                        className="rounded-sm bg-white"
                        renderAnnotationLayer={true}
                        renderTextLayer={true}
                        loading={<div className="bg-white h-[800px] w-full animate-pulse" />}
                        error={
                          <div className="flex flex-col items-center justify-center h-96 bg-gray-100 text-red-500">
                            <FaExclamationTriangle className="mb-2" />
                            <span>Gagal Render Halaman</span>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </Document>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ViewDocumentModal;
