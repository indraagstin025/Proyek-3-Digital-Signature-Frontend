import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import interact from "interactjs";
import PlacedSignature from "../PlacedSignature/PlacedSignature";

// Konfigurasi worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

// Fungsi helper debounce
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const PDFViewer = ({ fileUrl, signatures, onAddSignature, onUpdateSignature, onDeleteSignature, savedSignatureUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef(null);
  const pageRefs = useRef(new Map());

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setPageNumber(1);
  }

  // Resize listener
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32);
      }
    };
    const debouncedUpdateWidth = debounce(updateWidth, 150);

    debouncedUpdateWidth();
    window.addEventListener("resize", debouncedUpdateWidth);
    return () => window.removeEventListener("resize", debouncedUpdateWidth);
  }, []);

  // Page observer
  useEffect(() => {
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

    const refs = pageRefs.current;
    refs.forEach((pageElement) => {
      if (pageElement) observer.observe(pageElement);
    });

    return () => {
      refs.forEach((pageElement) => {
        if (pageElement) observer.unobserve(pageElement);
      });
    };
  }, [numPages]);

  // Dropzone logic
  useEffect(() => {
    interact(".dropzone-overlay").dropzone({
      accept: ".draggable-signature",
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
        const previewRect = event.relatedTarget.getBoundingClientRect();

        const x_display = event.dragEvent.clientX - pageRect.left;
        const y_display = event.dragEvent.clientY - pageRect.top;

        const newSignature = {
          id: `sig-${Date.now()}`,
          signatureImageUrl: savedSignatureUrl,
          pageNumber,
          positionX: x_display / pageRect.width,
          positionY: y_display / pageRect.height,
          width: previewRect.width / pageRect.width,
          height: previewRect.height / pageRect.height,
          x_display,
          y_display,
          width_display: previewRect.width,
          height_display: previewRect.height,
        };

        onAddSignature(newSignature);
      },
    });

    return () => interact(".dropzone-overlay").unset();
  }, [savedSignatureUrl, onAddSignature]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 dark:bg-gray-900/50 rounded-lg">
      {/* Header Info Halaman */}
      <div className="flex justify-between items-center p-3 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
        <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">
          Halaman {pageNumber} dari {numPages || "--"}
        </p>
      </div>

      {/* Konten Utama dengan Sidebar Thumbnail */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Thumbnail */}
        <div className="w-48 overflow-y-auto bg-gray-200/50 dark:bg-gray-900/50 border-r border-gray-300 dark:border-gray-700 p-2">
          <Document file={fileUrl} loading="">
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`thumb_${index + 1}`}
                className={`mb-2 cursor-pointer rounded-md overflow-hidden border-2 ${
                  pageNumber === index + 1 ? "border-blue-500" : "border-transparent hover:border-gray-500"
                }`}
                onClick={() => {
                  const pageElement = pageRefs.current.get(index + 1);
                  if (pageElement) {
                    pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                <Page pageNumber={index + 1} width={150} renderAnnotationLayer={false} renderTextLayer={false} />
              </div>
            ))}
          </Document>
        </div>

        {/* Area PDF Utama */}
        <div ref={containerRef} className="flex-grow overflow-auto p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p className="text-center">Memuat dokumen...</p>}
            error={<p className="text-center text-red-500">Gagal memuat dokumen.</p>}
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={(node) => {
                  if (node) pageRefs.current.set(index + 1, node);
                  else pageRefs.current.delete(index + 1);
                }}
                data-page-number={index + 1}
                className="mb-4 flex justify-center relative"
              >
                <Page
                  pageNumber={index + 1}
                  width={containerWidth > 0 ? containerWidth : undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
                <div
                  className="dropzone-overlay absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
                  data-page-number={index + 1}
                />

                {signatures
                  .filter((sig) => sig.pageNumber === index + 1)
                  .map((sig) => (
                    <PlacedSignature
                      key={sig.id}
                      signature={sig}
                      onUpdate={onUpdateSignature}
                      onDelete={onDeleteSignature}
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
