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
  const pagesRef = useRef([]); // simpan ref setiap halaman

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setPageNumber(1);
  }

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        // kurangi agar tidak terlalu lebar karena ada sidebar
        setContainerWidth(containerRef.current.offsetWidth - 220);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const scrollToPage = (pageIndex) => {
    if (pagesRef.current[pageIndex]) {
      pagesRef.current[pageIndex].scrollIntoView({ behavior: "smooth" });
      setPageNumber(pageIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 w-full max-w-6xl h-[90%] p-4 rounded-xl shadow-lg border border-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2 text-white">
          <p className="font-semibold">
            Halaman {pageNumber} dari {numPages || "--"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToPage(pageNumber - 2)}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => scrollToPage(pageNumber)}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Berikutnya
            </button>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Viewer with Sidebar */}
        <div className="flex flex-grow overflow-hidden bg-gray-800 rounded-lg">
          {/* Sidebar Thumbnails */}
          <div className="w-48 overflow-y-auto bg-gray-900 border-r border-gray-700 p-2">
            <Document file={url}>
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`thumb_${index + 1}`}
                  className={`mb-2 cursor-pointer rounded-md overflow-hidden border-2 ${
                    pageNumber === index + 1
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-500"
                  }`}
                  onClick={() => scrollToPage(index)}
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

          {/* PDF Content */}
          <div
            ref={containerRef}
            className="flex-grow overflow-auto p-4"
            onScroll={(e) => {
              const scrollPos = e.target.scrollTop;
              let currentPage = 1;
              for (let i = 0; i < pagesRef.current.length; i++) {
                const pageTop = pagesRef.current[i].offsetTop;
                if (scrollPos >= pageTop - 50) {
                  currentPage = i + 1;
                }
              }
              setPageNumber(currentPage);
            }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <p className="text-center text-white p-4">Memuat dokumen...</p>
              }
              error={
                <p className="text-center text-red-400 p-4">
                  Gagal memuat dokumen.
                </p>
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index + 1}`}
                  ref={(el) => (pagesRef.current[index] = el)}
                  className="mb-4 flex justify-center"
                >
                  <Page
                    pageNumber={index + 1}
                    width={containerWidth}
                    renderAnnotationLayer
                    renderTextLayer
                  />
                </div>
              ))}
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentModal;
