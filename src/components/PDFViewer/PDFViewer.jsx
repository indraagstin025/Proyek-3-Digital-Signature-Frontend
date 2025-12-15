import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import interact from "interactjs";
import PlacedSignature from "../PlacedSignature/PlacedSignature";

// Konfigurasi Worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

// Helper Debounce untuk Resize
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const MAX_PDF_WIDTH = 768;

const PDFViewer = ({
  documentTitle,
  fileUrl,
  signatures,
  onAddSignature,
  onUpdateSignature,
  onDeleteSignature,
  savedSignatureUrl,
  readOnly = false, // Default false
  // documentId, currentUser // (Opsional: Bisa dihapus jika PlacedSignature benar-benar tidak butuh lagi)
  // Untuk saat ini saya biarkan props lain standard
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  const [isMobileOrPortrait, setIsMobileOrPortrait] = useState(false);
  const [pageHeight, setPageHeight] = useState(0);

  const containerRef = useRef(null);
  const pageRefs = useRef(new Map());
  const observerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  // --- RESPONSIVE LOGIC ---
  const checkResponsiveness = useCallback(() => {
    if (!containerRef.current) return;

    const innerWidth = window.innerWidth;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isMobile = innerWidth < 768;

    const shouldUseMobileLayout = isMobile || isPortrait;

    setIsMobileOrPortrait(shouldUseMobileLayout);

    let newContainerWidth;
    if (shouldUseMobileLayout) {
      newContainerWidth = innerWidth * 0.9;
      setContainerWidth(newContainerWidth);
      setPageHeight(newContainerWidth * 1.414);
    } else {
      const AVAILABLE_PADDING_BUFFER = 52;
      const availableWidth = Math.max(0, containerRef.current.offsetWidth - AVAILABLE_PADDING_BUFFER);
      newContainerWidth = Math.min(availableWidth, MAX_PDF_WIDTH);
      setContainerWidth(newContainerWidth);
      setPageHeight(0);
    }
  }, []);

  useEffect(() => {
    const debouncedUpdateWidth = debounce(checkResponsiveness, 150);
    debouncedUpdateWidth();
    window.addEventListener("resize", debouncedUpdateWidth);
    return () => window.removeEventListener("resize", debouncedUpdateWidth);
  }, [checkResponsiveness]);

  // --- INTERSECTION OBSERVER (Detect Page Scroll) ---
  useEffect(() => {
    if (isMobileOrPortrait) {
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.dataset.pageNumber, 10);
            setPageNumber(pageNum);
          }
        });
      },
      { root: containerRef.current, threshold: 0.4 }
    );

    observerRef.current = observer;
    const refs = pageRefs.current;
    refs.forEach((pageElement) => {
      if (pageElement) observer.observe(pageElement);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [numPages, isMobileOrPortrait]);

  // --- INTERACTION LOGIC (Tap to Sign) ---
  const handleCanvasClick = (event, pageNumber) => {
    if (readOnly) return; // Proteksi ReadOnly
    if (!savedSignatureUrl) return;
    if (!event.target.classList.contains("dropzone-overlay")) return;

    const overlayElement = event.target;
    const rect = overlayElement.getBoundingClientRect();

    const x_display = event.clientX - rect.left;
    const y_display = event.clientY - rect.top;

    const MIN_PIXEL_SIZE = 140;
    const IDEAL_RATIO = 0.25;

    let calculatedWidth = Math.max(rect.width * IDEAL_RATIO, MIN_PIXEL_SIZE);
    calculatedWidth = Math.min(calculatedWidth, rect.width * 0.6);

    const DEFAULT_WIDTH = calculatedWidth;
    const DEFAULT_HEIGHT = DEFAULT_WIDTH * 0.5;
    const PADDING = 12;

    const centeredX = x_display - DEFAULT_WIDTH / 2;
    const centeredY = y_display - DEFAULT_HEIGHT / 2;

    const realImageX = centeredX + PADDING;
    const realImageY = centeredY + PADDING;
    const realWidth = DEFAULT_WIDTH - PADDING * 2;
    const realHeight = DEFAULT_HEIGHT - PADDING * 2;

    const newSignature = {
      id: `sig-tap-${Date.now()}`,
      signatureImageUrl: savedSignatureUrl,
      pageNumber,
      x_display: centeredX,
      y_display: centeredY,
      width_display: DEFAULT_WIDTH,
      height_display: DEFAULT_HEIGHT,
      positionX: realImageX / rect.width,
      positionY: realImageY / rect.height,
      width: realWidth / rect.width,
      height: realHeight / rect.height,
    };

    onAddSignature(newSignature);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // --- INTERACTION LOGIC (Drag & Drop from Outside/Modal) ---
  useEffect(() => {
    if (readOnly) return; // Proteksi ReadOnly

    interact(".dropzone-overlay").dropzone({
      ondropactivate(event) {
        event.target.classList.remove("pointer-events-none");
        event.target.classList.add("pointer-events-auto");
      },
      ondropdeactivate(event) {
        event.target.classList.remove("pointer-events-auto");
        event.target.classList.add("pointer-events-none");
      },
      ondrop: (event) => {
        const overlayElement = event.target;
        const pageNumber = parseInt(overlayElement.dataset.pageNumber, 10);
        const pageRect = overlayElement.getBoundingClientRect();

        const x_display = event.dragEvent.clientX - pageRect.left;
        const y_display = event.dragEvent.clientY - pageRect.top;

        const MIN_PIXEL_SIZE = 140;
        const IDEAL_RATIO = 0.25;

        let calculatedWidth = Math.max(pageRect.width * IDEAL_RATIO, MIN_PIXEL_SIZE);
        calculatedWidth = Math.min(calculatedWidth, pageRect.width * 0.6);

        const DEFAULT_WIDTH_DISPLAY = calculatedWidth;
        const DEFAULT_HEIGHT_DISPLAY = DEFAULT_WIDTH_DISPLAY * 0.5;
        const PADDING = 12;
        const TOTAL_PADDING = 24;

        const existingId = event.relatedTarget?.getAttribute("data-id");

        if (existingId) {
          const realImageX = x_display + PADDING;
          const realImageY = y_display + PADDING;
          onUpdateSignature({
            id: existingId,
            pageNumber,
            x_display,
            y_display,
            positionX: realImageX / pageRect.width,
            positionY: realImageY / pageRect.height,
          });
        } else {
          const realWidth = DEFAULT_WIDTH_DISPLAY - TOTAL_PADDING;
          const realHeight = DEFAULT_HEIGHT_DISPLAY - TOTAL_PADDING;
          const realImageX = x_display + PADDING;
          const realImageY = y_display + PADDING;

          const newSignature = {
            id: `sig-${Date.now()}`,
            signatureImageUrl: savedSignatureUrl,
            pageNumber,
            x_display,
            y_display,
            width_display: DEFAULT_WIDTH_DISPLAY,
            height_display: DEFAULT_HEIGHT_DISPLAY,
            positionX: realImageX / pageRect.width,
            positionY: realImageY / pageRect.height,
            width: realWidth / pageRect.width,
            height: realHeight / pageRect.height,
          };
          onAddSignature(newSignature);
        }
      },
    });
    return () => interact(".dropzone-overlay").unset();
  }, [savedSignatureUrl, onAddSignature, onUpdateSignature, readOnly]);

  const scrollToPage = (pageNum) => {
    const pageElement = pageRefs.current.get(pageNum);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setPageNumber(pageNum);
    }
  };

  return (
    <div className="w-full h-full relative bg-white dark:bg-slate-800/50 shadow-lg rounded-xl flex flex-col">
      {/* Header */}
      <div className={`flex-shrink-0 h-16 flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-700/50 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${!isMobileOrPortrait ? "rounded-t-xl" : "rounded-none"}`}>
        <div className="flex items-baseline gap-3 min-w-0">
          {!isMobileOrPortrait && (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
              Nama Dokumen:
            </span>
          )}
          <h2 className="font-bold text-base md:text-lg text-slate-800 dark:text-white truncate">
            {documentTitle}
          </h2>
        </div>

        <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
          Hal {pageNumber} / {numPages || "--"}
        </p>
      </div>

      {/* Konten Utama */}
      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar Thumbnail (Desktop Only) */}
        {!isMobileOrPortrait && (
          <div className="w-48 overflow-y-auto bg-slate-100/50 dark:bg-slate-900/50 border-r border-slate-200/80 dark:border-slate-700 p-2 flex-shrink-0">
            <Document file={fileUrl} loading="">
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div
                  key={`thumb_${index + 1}`}
                  className={`mb-2 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                    pageNumber === index + 1
                      ? "border-blue-500 shadow-md"
                      : "border-transparent hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                  onClick={() => scrollToPage(index + 1)}
                >
                  <Page
                    pageNumber={index + 1}
                    width={150}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </div>
              ))}
            </Document>
          </div>
        )}

        {/* Area PDF Utama */}
        <div
          ref={containerRef}
          className={`flex-grow overflow-auto ${
            isMobileOrPortrait ? "p-2 pb-24" : "p-4"
          } flex justify-center`}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p className="text-center mt-8">Memuat dokumen...</p>}
            error={<p className="text-center mt-8 text-red-500">Gagal memuat dokumen.</p>}
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={(node) => {
                  if (node) pageRefs.current.set(index + 1, node);
                  else pageRefs.current.delete(index + 1);
                }}
                data-page-number={index + 1}
                className={`mb-6 ${
                  isMobileOrPortrait ? "mx-auto" : "mb-8 flex justify-center"
                } relative`}
                style={isMobileOrPortrait ? { width: `${containerWidth}px` } : {}}
              >
                <div className="bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
                  <Page
                    pageNumber={index + 1}
                    width={containerWidth > 0 ? containerWidth : 600}
                    height={
                      isMobileOrPortrait && pageHeight > 0 ? pageHeight : undefined
                    }
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="pointer-events-none"
                  />
                </div>
                
                {/* Layer Interaksi (Klik & Drop) */}
                <div
                  className="dropzone-overlay absolute top-0 left-0 w-full h-full z-10 cursor-crosshair"
                  data-page-number={index + 1}
                  onClick={(e) => handleCanvasClick(e, index + 1)}
                />

                {/* Render Tanda Tangan */}
                {signatures
                  .filter((sig) => sig.pageNumber === index + 1)
                  .map((sig) => (
                    <PlacedSignature
                      key={sig.id}
                      signature={sig}
                      onUpdate={onUpdateSignature}
                      onDelete={onDeleteSignature}
                      readOnly={readOnly}
                    />
                  ))}
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;