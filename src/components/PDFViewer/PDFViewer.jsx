// Ganti seluruh isi file PDFViewer.jsx Anda dengan kode ini

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import interact from "interactjs";
import PlacedSignature from "../PlacedSignature/PlacedSignature";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const PDFViewer = ({ fileUrl, signatures, onAddSignature, onUpdateSignature, onDeleteSignature, savedSignatureUrl }) => {
    const [numPages, setNumPages] = useState(null);
    // Kita tidak lagi memerlukan state untuk dimensi, karena rasio membuatnya tidak relevan.

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    useEffect(() => {
        interact(".dropzone-overlay").dropzone({
            accept: ".draggable-signature",
            ondrop: (event) => {
                const overlayElement = event.target;
                const pageNumber = parseInt(overlayElement.dataset.pageNumber, 10);
                const pageRect = overlayElement.getBoundingClientRect(); // Dimensi halaman yang terlihat di browser

                const previewRect = event.relatedTarget.getBoundingClientRect();
                const defaultWidthDisplay = previewRect.width;
                const defaultHeightDisplay = previewRect.height;

                const x_display = event.dragEvent.clientX - pageRect.left;
                const y_display = event.dragEvent.clientY - pageRect.top;

                // ✅ PERUBAHAN UTAMA: HITUNG POSISI DAN UKURAN SEBAGAI RASIO (NILAI 0 SAMPAI 1)
                const xRatio = x_display / pageRect.width;
                const yRatio = y_display / pageRect.height;
                const widthRatio = defaultWidthDisplay / pageRect.width;
                const heightRatio = defaultHeightDisplay / pageRect.height;

                const newSignature = {
                    id: `sig-${Date.now()}`,
                    signatureImageUrl: savedSignatureUrl,
                    pageNumber: pageNumber,
                    
                    // Simpan rasio ini untuk dikirim ke backend
                    positionX: xRatio,
                    positionY: yRatio,
                    width: widthRatio,
                    height: heightRatio,

                    // Simpan juga data display untuk rendering di frontend
                    x_display: x_display,
                    y_display: y_display,
                    width_display: defaultWidthDisplay,
                    height_display: defaultHeightDisplay,
                };

                onAddSignature(newSignature);
            },
        });

        return () => interact(".dropzone-overlay").unset();
    }, [savedSignatureUrl, onAddSignature]); // Hapus dependensi yang tidak perlu

    return (
        <div className="p-4 md:p-8">
            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<p>Memuat dokumen...</p>} error={<p>Gagal memuat dokumen.</p>}>
                {Array.from(new Array(numPages || 0), (el, index) => (
                    <div key={`page_wrapper_${index + 1}`} className="pdf-page-wrapper">
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} renderAnnotationLayer={false} renderTextLayer={false} />
                        <div className="dropzone-overlay" data-page-number={index + 1}></div>

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
    );
};

export default PDFViewer;