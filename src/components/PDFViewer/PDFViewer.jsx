import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import interact from "interactjs";
import PlacedSignature from "../PlacedSignature/PlacedSignature";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const MAX_PDF_WIDTH = 768;

const PDFViewer = ({ documentTitle, fileUrl, signatures, onAddSignature, onUpdateSignature, onDeleteSignature, savedSignatureUrl }) => {
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

  const checkResponsiveness = useCallback(() => {
    if (!containerRef.current) return;

    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;

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

    console.log("Width:", innerWidth, "Height:", innerHeight, "isPortrait:", isPortrait);
  }, []);

  useEffect(() => {
    const debouncedUpdateWidth = debounce(checkResponsiveness, 150);

    debouncedUpdateWidth();
    window.addEventListener("resize", debouncedUpdateWidth);
    return () => window.removeEventListener("resize", debouncedUpdateWidth);
  }, [checkResponsiveness]);

  useEffect(() => {
    if (isMobileOrPortrait) {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (e) {
          console.error("Failed to disconnect observer:", e);
        }
        observerRef.current = null;
      }
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
      if (observerRef.current) {
        try {
          refs.forEach((pageElement) => {
            if (pageElement) observerRef.current.unobserve(pageElement);
          });
          observerRef.current.disconnect();
        } catch (e) {
          console.error("Failed to disconnect observer:", e);
        }
        observerRef.current = null;
      }
    };
  }, [numPages, isMobileOrPortrait]);

useEffect(() => {
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

        // --- PERBAIKAN DI SINI ---
        // Kita batasi lebarnya agar tidak terlalu besar (max 150px atau 15% lebar halaman)
        const DEFAULT_WIDTH = Math.min(pageRect.width * 0.15, 150);
        
        // Set HEIGHT sama dengan WIDTH agar menjadi KOTAK (Square)
        const DEFAULT_HEIGHT = DEFAULT_WIDTH; 

        const existingId = event.relatedTarget?.getAttribute("data-id");

        if (existingId) {
          // Logika update posisi (drag yang sudah ada)
          onUpdateSignature({
            id: existingId,
            pageNumber,
            x_display,
            y_display,
            positionX: x_display / pageRect.width,
            positionY: y_display / pageRect.height,
          });
        } else {
          // Logika tambah baru (drop dari sidebar)
          const newSignature = {
            id: `sig-${Date.now()}`,
            signatureImageUrl: savedSignatureUrl,
            pageNumber,
            positionX: x_display / pageRect.width,
            positionY: y_display / pageRect.height,
            width: DEFAULT_WIDTH / pageRect.width,
            height: DEFAULT_HEIGHT / pageRect.height,
            x_display,
            y_display,
            width_display: DEFAULT_WIDTH,
            height_display: DEFAULT_HEIGHT, // Ini sekarang sama dengan width
          };

          onAddSignature(newSignature);
        }
      },
    });

    return () => interact(".dropzone-overlay").unset();
  }, [savedSignatureUrl, onAddSignature, onUpdateSignature]);

  const scrollToPage = (pageNum) => {
    const pageElement = pageRefs.current.get(pageNum);
    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPageNumber(pageNum);
    }
  };

  return (
    <div className="w-full h-full relative bg-white dark:bg-slate-800/50 shadow-lg rounded-xl flex flex-col">
      {/* Header */}
      <div
        className={`flex-shrink-0 h-16 flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-700/50 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${
          !isMobileOrPortrait ? "rounded-t-xl" : "rounded-none"
        }`}
      >
        <div className="flex items-baseline gap-3 min-w-0">
          {!isMobileOrPortrait && <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">Nama Dokumen:</span>}
          <h2 className="font-bold text-base md:text-lg text-slate-800 dark:text-white truncate">{documentTitle}</h2>
        </div>
        <p className="font-semibold text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
          Halaman {pageNumber} dari {numPages || "--"}
        </p>
      </div>

      {/* Konten Utama */}
      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar Thumbnail (Hanya tampil di Desktop/Non-Portrait) */}
        {!isMobileOrPortrait && (
          <div className="w-48 overflow-y-auto bg-slate-100/50 dark:bg-slate-900/50 border-r border-slate-200/80 dark:border-slate-700 p-2 flex-shrink-0">
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

        {/* Area PDF Utama */}
        <div ref={containerRef} className={`flex-grow overflow-auto ${isMobileOrPortrait ? "p-2" : "p-4"} flex justify-center`}>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<p className="text-center mt-8">Memuat dokumen...</p>} error={<p className="text-center mt-8 text-red-500">Gagal memuat dokumen.</p>}>
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={(node) => {
                  if (node) pageRefs.current.set(index + 1, node);
                  else pageRefs.current.delete(index + 1);
                }}
                data-page-number={index + 1}
                className={`mb-6 ${isMobileOrPortrait ? "mx-auto" : "mb-8 flex justify-center"} relative`}
                style={isMobileOrPortrait ? { width: `${containerWidth}px` } : {}}
              >
                <div className="bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
                  <Page pageNumber={index + 1} width={containerWidth > 0 ? containerWidth : 600} height={isMobileOrPortrait && pageHeight > 0 ? pageHeight : undefined} renderTextLayer={false} renderAnnotationLayer={false} />
                </div>
                <div className="dropzone-overlay absolute top-0 left-0 w-full h-full z-10" data-page-number={index + 1} />
                {signatures
                  .filter((sig) => sig.pageNumber === index + 1)
                  .map((sig) => (
                    <PlacedSignature key={sig.id} signature={sig} onUpdate={onUpdateSignature} onDelete={onDeleteSignature} />
                  ))}
              </div>
            ))}
          </Document>
        </div>
      </div>

      {/* Footer Navigasi Halaman (Hanya di mode mobile/portrait) */}
      {isMobileOrPortrait && (
        <div className="flex-shrink-0 p-3 flex justify-center items-center gap-4 border-t border-slate-200/80 dark:border-slate-700/50 bg-white dark:bg-slate-800/80">
          <button onClick={() => scrollToPage(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition">
            &larr; Sebelumnya
          </button>
          <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
            Halaman {pageNumber} dari {numPages || "--"}
          </span>
          <button
            onClick={() => scrollToPage(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition"
          >
            Berikutnya &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
