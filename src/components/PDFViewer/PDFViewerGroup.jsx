import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import interact from "interactjs";

import PlacedSignatureGroup from "../PlacedSignature/PlacedSignatureGroup";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const MAX_PDF_WIDTH = 768;

const PDFViewerGroup = ({
  documentTitle,
  fileUrl,
  signatures,
  onAddSignature,
  onUpdateSignature,
  onDeleteSignature,
  savedSignatureUrl,
  readOnly = false,

  documentId,
  currentUser,
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  const [isMobileOrPortrait, setIsMobileOrPortrait] = useState(false);
  const [pageHeight, setPageHeight] = useState(0);

  const containerRef = useRef(null);
  const pageRefs = useRef(new Map());
  const observerRef = useRef(null);
  const isDroppingRef = useRef(false);

  // ✅ [MARQUEE SELECTION] Untuk multi-select signatures (optimized)
  const [selectedIds, setSelectedIds] = useState([]);
  const [marqueeBox, setMarqueeBox] = useState(null);
  const [selectionPage, setSelectionPage] = useState(null);

  // Marquee Refs (sama seperti PDFViewer)
  const dropzoneRefs = useRef(new Map());
  const isSelectingRef = useRef(false);
  const selectionStartRef = useRef({ x: 0, y: 0 });
  const activePageRef = useRef(null);
  const marqueeBoxRef = useRef(null);

  // ✅ [OPTIMASI] RAF untuk batching state updates
  const rafRef = useRef(null);
  const pointerMoveListenerRef = useRef(null);
  const pointerUpListenerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

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

  const handleCanvasClick = (event, pageNumber) => {
    if (readOnly) return;
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
    const DEFAULT_HEIGHT = DEFAULT_WIDTH * 0.75;
    const PADDING = 12;

    const centeredX = x_display - DEFAULT_WIDTH / 2;
    const centeredY = y_display - DEFAULT_HEIGHT / 2;

    const realImageX = centeredX + PADDING;
    const realImageY = centeredY + PADDING;
    const realWidth = DEFAULT_WIDTH - PADDING * 2;
    const realHeight = DEFAULT_HEIGHT - PADDING * 2;

    const newSignature = {
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

  useEffect(() => {
    if (readOnly) return;

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
        const target = event.relatedTarget;

        const isExistingItem = target.classList.contains("placed-signature-item") || target.closest(".placed-signature-item");

        if (isExistingItem) {
          return;
        }

        if (!savedSignatureUrl) return;

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
        const DEFAULT_HEIGHT_DISPLAY = DEFAULT_WIDTH_DISPLAY * 0.75;
        const TOTAL_PADDING = 24;
        const PADDING = 12;

        const realWidth = DEFAULT_WIDTH_DISPLAY - TOTAL_PADDING;
        const realHeight = DEFAULT_HEIGHT_DISPLAY - TOTAL_PADDING;
        const realImageX = x_display + PADDING;
        const realImageY = y_display + PADDING;

        const newSignature = {
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
      },
    });
    return () => interact(".dropzone-overlay").unset();
  }, [savedSignatureUrl, onAddSignature, readOnly]);

  const scrollToPage = (pageNum) => {
    const pageElement = pageRefs.current.get(pageNum);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setPageNumber(pageNum);
    }
  };

  // =====================================================================
  // ✅ LOGIKA MARQUEE: OPTIMIZED UNTUK SMOOTH DRAG (DESKTOP & TOUCH)
  // =====================================================================

  // 2. Move Selection - OPTIMIZED dengan RAF
  const handlePointerMove = useCallback((e) => {
    if (!isSelectingRef.current) return;

    const pageNum = parseInt(activePageRef.current.dataset.pageNumber, 10);
    const overlay = dropzoneRefs.current.get(pageNum);
    if (!overlay) return;

    const rect = overlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const start = selectionStartRef.current;
    const x = Math.min(start.x, currentX);
    const y = Math.min(start.y, currentY);
    const w = Math.abs(currentX - start.x);
    const h = Math.abs(currentY - start.y);

    marqueeBoxRef.current = { x, y, w, h };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setMarqueeBox({ x, y, w, h });
    });
  }, []);

  // 3. End Selection - OPTIMIZED
  const handlePointerUp = useCallback(
    (e) => {
      isSelectingRef.current = false;

      const pageElement = activePageRef.current;
      if (!pageElement) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (pointerMoveListenerRef.current) {
        pageElement.removeEventListener("pointermove", pointerMoveListenerRef.current);
        pointerMoveListenerRef.current = null;
      }
      if (pointerUpListenerRef.current) {
        pageElement.removeEventListener("pointerup", pointerUpListenerRef.current);
        pageElement.removeEventListener("pointercancel", pointerUpListenerRef.current);
        pointerUpListenerRef.current = null;
      }

      pageElement.releasePointerCapture(e.pointerId);

      const finalBox = marqueeBoxRef.current;

      if (!finalBox || (finalBox.w < 5 && finalBox.h < 5)) {
        setMarqueeBox(null);
        setSelectionPage(null);
        marqueeBoxRef.current = null;
        return;
      }

      const pageNum = parseInt(pageElement.dataset.pageNumber, 10);
      const newSelected = [];
      const pageSignatures = signatures.filter((s) => s.pageNumber === pageNum);

      pageSignatures.forEach((sig) => {
        if (sig.x_display == null || sig.y_display == null) return;

        const sigX = sig.x_display;
        const sigY = sig.y_display;
        const sigW = sig.width_display;
        const sigH = sig.height_display;

        const isIntersecting = finalBox.x < sigX + sigW && finalBox.x + finalBox.w > sigX && finalBox.y < sigY + sigH && finalBox.y + finalBox.h > sigY;

        if (isIntersecting) {
          newSelected.push(sig.id);
        }
      });

      setSelectedIds((prev) => {
        if (e.shiftKey) return [...new Set([...prev, ...newSelected])];
        return newSelected;
      });

      setMarqueeBox(null);
      setSelectionPage(null);
      marqueeBoxRef.current = null;
      activePageRef.current = null;
    },
    [signatures]
  );

  // 1. Start Selection - OPTIMIZED
  const handlePointerDown = useCallback(
    (e, pageNum) => {
      if (readOnly) return;

      // Jika tap pada signature, jangan clear selection
      if (e.target.closest(".placed-signature-item")) return;

      // ✅ [FIX] Clear selection saat tap area dokumen (berlaku untuk desktop dan mobile)
      if (!e.shiftKey) setSelectedIds([]);

      // ✅ [FIX] Disable Marquee on Mobile
      if (isMobileOrPortrait) return;

      pointerMoveListenerRef.current = handlePointerMove;
      pointerUpListenerRef.current = handlePointerUp;

      e.currentTarget.setPointerCapture(e.pointerId);

      if (!e.shiftKey) {
        setSelectedIds([]);
      }

      isSelectingRef.current = true;
      setSelectionPage(pageNum);

      const pageElement = e.currentTarget;
      activePageRef.current = pageElement;

      const overlay = dropzoneRefs.current.get(pageNum);
      if (!overlay) return;

      const rect = overlay.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      selectionStartRef.current = { x: startX, y: startY };
      marqueeBoxRef.current = { x: startX, y: startY, w: 0, h: 0 };
      setMarqueeBox({ x: startX, y: startY, w: 0, h: 0 });

      pageElement.addEventListener("pointermove", handlePointerMove, { passive: false });
      pageElement.addEventListener("pointerup", handlePointerUp);
      pageElement.addEventListener("pointercancel", handlePointerUp);
    },
    [readOnly, handlePointerMove, handlePointerUp, isMobileOrPortrait]
  );

  // ✅ SELECT HANDLER untuk PlacedSignatureGroup
  const handleSelectSignature = useCallback((id, multi = false) => {
    setSelectedIds((prev) => {
      if (multi) return prev.includes(id) ? prev : [...prev, id];
      return [id];
    });
  }, []);

  // ✅ Cleanup RAF dan listeners saat component unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      const pageElement = activePageRef.current;
      if (pageElement && pointerMoveListenerRef.current) {
        pageElement.removeEventListener("pointermove", pointerMoveListenerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-white dark:bg-slate-800/50 shadow-lg rounded-xl flex flex-col">
      {/* HEADER */}
      <div
        className={`flex-shrink-0 h-16 flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-700/50 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${!isMobileOrPortrait ? "rounded-t-xl" : "rounded-none"
          }`}
      >
        <div className="flex items-baseline gap-3 min-w-0">
          {!isMobileOrPortrait && <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">[GROUP] Nama Dokumen:</span>}
          <h2 className="font-bold text-base md:text-lg text-slate-800 dark:text-white truncate">{documentTitle}</h2>
        </div>

        <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
          Hal {pageNumber} / {numPages || "--"}
        </p>
      </div>

      {/* BODY */}
      <div className="flex-grow flex overflow-hidden">
        {/* SIDEBAR THUMBNAIL (Desktop Only) */}
        {!isMobileOrPortrait && (
          <div className="w-48 overflow-y-auto hide-scrollbar bg-slate-100/50 dark:bg-slate-900/50 border-r border-slate-200/80 dark:border-slate-700 p-2 flex-shrink-0">
            <Document file={fileUrl} loading="">
              {Array.from(new Array(numPages || 0), (el, index) => (
                <div
                  key={`thumb_${index + 1}`}
                  className={`mb-2 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${pageNumber === index + 1 ? "border-blue-500 shadow-md" : "border-transparent hover:border-blue-300 dark:hover:border-blue-700"}`}
                  onClick={() => scrollToPage(index + 1)}
                >
                  <Page pageNumber={index + 1} width={150} renderAnnotationLayer={false} renderTextLayer={false} />
                </div>
              ))}
            </Document>
          </div>
        )}

        {/* MAIN PDF AREA */}
        <div ref={containerRef} className={`flex-grow overflow-auto hide-scrollbar ${isMobileOrPortrait ? "p-2 pb-24" : "p-4"} flex justify-center`}>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<p className="text-center mt-8">Memuat dokumen grup...</p>} error={<p className="text-center mt-8 text-red-500">Gagal memuat dokumen.</p>}>
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={(node) => {
                  if (node) pageRefs.current.set(index + 1, node);
                  else pageRefs.current.delete(index + 1);
                }}
                data-page-number={index + 1}
                className={`mb-6 ${isMobileOrPortrait ? "mx-auto" : "mb-8 flex justify-center"} relative group/page select-none ${isMobileOrPortrait ? "" : "touch-none"}`}
                style={{
                  ...(isMobileOrPortrait ? { width: `${containerWidth}px` } : {}),
                  touchAction: isMobileOrPortrait ? "pan-y" : "none",
                }}
                onPointerDown={(e) => handlePointerDown(e, index + 1)}
              >
                {/* PDF PAGE RENDER */}
                <div className="bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
                  <Page
                    pageNumber={index + 1}
                    width={containerWidth > 0 ? containerWidth : 600}
                    height={isMobileOrPortrait && pageHeight > 0 ? pageHeight : undefined}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="pointer-events-none"
                  />
                </div>

                {/* INTERACTION LAYER */}
                <div
                  ref={(node) => {
                    if (node) dropzoneRefs.current.set(index + 1, node);
                    else dropzoneRefs.current.delete(index + 1);
                  }}
                  className={`dropzone-overlay absolute top-0 left-0 w-full h-full z-10 cursor-crosshair ${isMobileOrPortrait ? "touch-pan-y" : "cursor-crosshair"}`}
                  data-page-number={index + 1}
                  onClick={(e) => handleCanvasClick(e, index + 1)}
                />

                {/* Kotak Biru Visual Marquee */}
                {marqueeBox && selectionPage === index + 1 && (
                  <div
                    className="absolute z-[9999] pointer-events-none"
                    style={{
                      left: marqueeBox.x,
                      top: marqueeBox.y,
                      width: marqueeBox.w,
                      height: marqueeBox.h,
                      border: "1px solid #3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                    }}
                  />
                )}

                {/* 🔥 SIGNATURES RENDER (KHUSUS GROUP) 🔥 */}
                {signatures
                  .filter((sig) => sig.pageNumber === index + 1)
                  .map((sig) => (
                    <PlacedSignatureGroup
                      key={sig.id}
                      signature={sig}
                      onUpdate={onUpdateSignature}
                      onDelete={onDeleteSignature}
                      readOnly={readOnly}
                      documentId={documentId}
                      currentUser={currentUser}
                      isSelected={selectedIds.includes(sig.id)}
                      onSelect={handleSelectSignature}
                      totalPages={numPages || 1}
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

export default PDFViewerGroup;
