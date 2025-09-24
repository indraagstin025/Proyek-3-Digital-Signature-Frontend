import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker config
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const ViewDocumentModal = ({ isOpen, onClose, url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setPageNumber(1);
  }

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 20);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // ⬇️ pindahkan pengecekan ke JSX, bukan sebelum hooks
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 w-full max-w-4xl h-[90%] p-4 rounded-xl shadow-lg border border-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2 text-white">
          <p className="font-semibold">
            Halaman {pageNumber} dari {numPages || "--"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Berikutnya
            </button>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="flex-grow bg-gray-700 overflow-auto rounded-lg flex justify-center"
        >
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p className="text-center text-white p-4">Memuat dokumen...</p>}
            error={<p className="text-center text-red-400 p-4">Gagal memuat dokumen.</p>}
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth}
              renderAnnotationLayer
              renderTextLayer
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentModal;
