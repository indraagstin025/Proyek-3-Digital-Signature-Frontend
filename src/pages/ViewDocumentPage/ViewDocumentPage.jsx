import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import { Document, Page, pdfjs } from "react-pdf";
import { FaSpinner } from "react-icons/fa";

// Import CSS wajib untuk react-pdf
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Konfigurasi path untuk PDF.js worker agar library bisa berjalan.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const ViewDocumentPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  // State untuk data dan UI
  const [documentUrl, setDocumentUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk fungsionalitas PDF viewer
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  
  // Refs untuk interaksi DOM
  const containerRef = useRef(null);
  const pagesRef = useRef([]);

  // Efek untuk mengambil URL dokumen saat komponen dimuat.
  // Menggunakan AbortController untuk menangani cleanup di React.StrictMode.
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDocumentUrl = async () => {
      if (!documentId) {
        setError("ID Dokumen tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const signedUrl = await documentService.getDocumentFileUrl(documentId, { signal });
        if (signedUrl) {
          setDocumentUrl(signedUrl);
        } else {
          setError("Gagal mendapatkan URL untuk dokumen ini (respons kosong).");
        }
      } catch (err) {
        // Jangan set error jika permintaan dibatalkan dengan sengaja
        if (err.name !== 'CanceledError' && err.message !== 'canceled') {
            setError(err.message || "Terjadi kesalahan saat memuat dokumen.");
        }
      } finally {
        // Pastikan state tidak diubah jika komponen sudah di-unmount
        if (!signal.aborted) {
            setIsLoading(false);
        }
      }
    };

    fetchDocumentUrl();

    // Cleanup function: batalkan permintaan API saat komponen di-unmount.
    return () => {
      controller.abort();
    };
  }, [documentId]);

  // Efek untuk menyesuaikan lebar kontainer PDF saat ukuran window berubah
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 40);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handler saat dokumen PDF berhasil dimuat
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
  };

  // Fungsi untuk scroll ke halaman tertentu
  const scrollToPage = (pageIndex) => {
    if (pagesRef.current[pageIndex]) {
      pagesRef.current[pageIndex].scrollIntoView({ behavior: "smooth" });
      setPageNumber(pageIndex + 1);
    }
  };

  // Handler saat kontainer utama di-scroll untuk update nomor halaman
  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    let currentPage = 1;
    for (let i = 0; i < pagesRef.current.length; i++) {
      const pageElement = pagesRef.current[i];
      if (pageElement && scrollTop >= pageElement.offsetTop - clientHeight / 2) {
        currentPage = i + 1;
      }
    }
    setPageNumber(currentPage);
  };

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <FaSpinner className="animate-spin text-4xl text-blue-400" />
        <p className="text-slate-400">Memuat dokumen...</p>
      </div>
    );
  }

  // Tampilan saat terjadi error
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-red-400 gap-4 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Gagal Memuat Dokumen</h2>
        <p className="bg-red-900/50 p-4 rounded-md border border-red-500/50">{error}</p>
        <button
           onClick={() => navigate("/dashboard/documents")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white font-sans">
      <header className="flex-shrink-0 flex justify-between items-center p-3 border-b border-slate-700 bg-slate-800/50 shadow-lg z-10">
        <p className="font-semibold text-slate-300">
          Halaman {pageNumber} dari {numPages || "--"}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard/documents")} className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors text-sm">
            Kembali
          </button>
          <button onClick={() => scrollToPage(pageNumber - 2)} disabled={pageNumber <= 1} className="px-3 py-1.5 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
            Sebelumnya
          </button>
          <button onClick={() => scrollToPage(pageNumber)} disabled={pageNumber >= numPages} className="px-3 py-1.5 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
            Berikutnya
          </button>
        </div>
      </header>

      <main className="flex flex-grow overflow-hidden">
        <aside className="w-48 flex-shrink-0 overflow-y-auto bg-slate-800 border-r border-slate-700 p-2">
          {documentUrl && (
            <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error("React-PDF (Thumbnail) onLoadError:", error.message)}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <div key={`thumb_${index + 1}`} className={`mb-2 cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200 ${pageNumber === index + 1 ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-transparent hover:border-slate-500"}`} onClick={() => scrollToPage(index)}>
                  <Page pageNumber={index + 1} width={150} renderAnnotationLayer={false} renderTextLayer={false} />
                </div>
              ))}
            </Document>
          )}
        </aside>

        <div ref={containerRef} onScroll={handleScroll} className="flex-grow overflow-auto p-4 bg-slate-700/50">
          {documentUrl && (
            <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<p className="text-center text-white p-4">Menyiapkan pratinjau...</p>}
              error={<p className="text-center text-red-400 p-4">Gagal memuat pratinjau dokumen.</p>}
              onLoadError={(error) => console.error("React-PDF (Main) onLoadError:", error.message)}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <div key={`page_${index + 1}`} ref={(el) => (pagesRef.current[index] = el)} className="mb-4 flex justify-center">
                  <Page pageNumber={index + 1} width={containerWidth} />
                </div>
              ))}
            </Document>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewDocumentPage;