import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import interact from 'interactjs';
import PlacedSignature from '../PlacedSignature/PlacedSignature';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const PDFViewer = ({ fileUrl, signatures, onAddSignature, onUpdateSignature, onDeleteSignature, savedSignatureUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageDimensions, setPageDimensions] = useState({});

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess(page) {
    setPageDimensions(prev => ({
      ...prev,
      [page.pageNumber]: { width: page.width, height: page.height }
    }));
  }

  // Dropzone untuk tanda tangan
  useEffect(() => {
    interact('.dropzone-overlay').dropzone({
      accept: '.draggable-signature',

      ondrop: (event) => {
        const overlayElement = event.target;
        const pageNumber = parseInt(overlayElement.dataset.pageNumber, 10);
        const pageRect = overlayElement.getBoundingClientRect();

        const x_display = event.dragEvent.clientX - pageRect.left;
        const y_display = event.dragEvent.clientY - pageRect.top;

        const originalPage = pageDimensions[pageNumber];
        if (!originalPage) return;

        const scaleFactor = pageRect.width / originalPage.width;

const newSignature = {
  id: `sig-${Date.now()}`,
  signatureImageUrl: savedSignatureUrl,
  pageNumber: pageNumber,
  x: x_display,
  y: y_display,
  width: 150,
  height: 75,
  // koordinat relatif ke ukuran asli halaman
  positionX: x_display / scaleFactor,
  positionY: y_display / scaleFactor,
  // simpan ukuran asli halaman supaya PlacedSignature bisa hitung ulang
  originalWidth: originalPage.width,
  originalHeight: originalPage.height,
};


        onAddSignature(newSignature);
      }
    });

    return () => interact('.dropzone-overlay').unset();
  }, [savedSignatureUrl, onAddSignature, pageDimensions]);

  // Auto scroll saat drag
  useEffect(() => {
    const container = document.querySelector(".pdf-viewer-container");
    if (!container) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      const { clientY } = e;

      // scroll ke bawah
      if (clientY > window.innerHeight - 100) {
        container.scrollBy(0, 20);
      }

      // scroll ke atas
      if (clientY < 100) {
        container.scrollBy(0, -20);
      }
    };

    container.addEventListener("dragover", handleDragOver);
    return () => container.removeEventListener("dragover", handleDragOver);
  }, []);

  return (
    <div className="p-4 md:p-8 pdf-viewer-container h-[80vh] overflow-auto">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<p className="text-center text-white">Memuat dokumen...</p>}
        error={<p className="text-center text-red-400">Gagal memuat dokumen.</p>}
      >
        {Array.from(new Array(numPages || 0), (el, index) => (
          <div
            key={`page_wrapper_${index + 1}`}
            className="pdf-page-wrapper relative mb-4"
          >
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              onLoadSuccess={onPageLoadSuccess}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
            {/* Overlay dropzone full page */}
            <div
              className="dropzone-overlay absolute inset-0"
              data-page-number={index + 1}
            ></div>

            {signatures
              .filter(sig => sig.pageNumber === index + 1)
              .map(sig => (
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
  );
};

export default PDFViewer;
