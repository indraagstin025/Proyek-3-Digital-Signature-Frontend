// ViewDocumentPage.jsx
// Responsive PDF viewer page that uses DashboardHeader (no redundant dark-mode handling)
// Fallback test file (from conversation uploads): sandbox:/mnt/data/9113ba0c-16c0-4af6-9272-bc64e4716368.png

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import { Document, Page, pdfjs } from "react-pdf";
import { FaSpinner, FaChevronLeft, FaChevronRight, FaFolderOpen, FaArrowLeft } from "react-icons/fa";

import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

// Use the uploaded file path as the fallback local test file (tooling will convert it to URL)
const LOCAL_TEST_FILE = "sandbox:/mnt/data/9113ba0c-16c0-4af6-9272-bc64e4716368.png";

const ViewDocumentPage = ({ theme, toggleTheme }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  // Document URL & loading/error
  const [documentUrl, setDocumentUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // PDF viewer state
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  // Sidebar state (thumbnails) - toggled from header / mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const containerRef = useRef(null);
  const pagesRef = useRef([]);

  // Fetch signed URL (from backend) with abort handling
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchUrl() {
      if (!documentId) {
        setError("ID dokumen tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const signedUrl = await documentService.getDocumentFileUrl(documentId, { signal });
        if (signal.aborted) return;
        if (signedUrl) {
          setDocumentUrl(signedUrl);
        } else {
          // fallback for local testing; tooling will convert this path if necessary
          setDocumentUrl(LOCAL_TEST_FILE);
          setError("Menggunakan file lokal sebagai fallback untuk pengujian.");
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.message === "canceled") {
          // fetch was aborted - ignore
        } else {
          console.error("Error fetching document URL:", err);
          setError(err.message || "Terjadi kesalahan saat memuat dokumen.");
        }
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }

    fetchUrl();
    return () => controller.abort();
  }, [documentId]);

  // Measure container width for responsive page rendering
  useEffect(() => {
    function updateWidth() {
      if (!containerRef.current) return;
      // subtract some padding so the page fits nicely on small screens
      const safePadding = 48;
      // Logic Lama
      // const w = Math.max(320, containerRef.current.offsetWidth - safePadding);

      // Logic BARU (dengan batas max 900px):
      const w = Math.min(900, Math.max(320, containerRef.current.offsetWidth - safePadding));
      setContainerWidth(w);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Document loaded
  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
    // reset pagesRef
    pagesRef.current = new Array(nextNumPages);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    console.error("react-pdf load error:", err);
    setError("Gagal memuat file PDF. Periksa koneksi atau file.");
  }, []);

  // Scroll to page by index
  const scrollToPage = useCallback((pageIndex) => {
    if (!pagesRef.current[pageIndex]) return;
    pagesRef.current[pageIndex].scrollIntoView({ behavior: "smooth", block: "start" });
    setPageNumber(pageIndex + 1);
  }, []);

  // Track scroll to compute current page
  const handleScroll = (e) => {
    const { scrollTop, clientHeight } = e.target;
    let current = 1;
    for (let i = 0; i < pagesRef.current.length; i++) {
      const el = pagesRef.current[i];
      if (!el) continue;
      if (scrollTop >= el.offsetTop - clientHeight / 2) {
        current = i + 1;
      }
    }
    if (current !== pageNumber) setPageNumber(current);
  };

  // Toggle sidebar (passed to header)
  const onToggleSidebar = () => setIsSidebarOpen((s) => !s);

  // Loading / error screens
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
          <p className="mt-3 text-slate-700 dark:text-slate-300">Memuat dokumen...</p>
        </div>
      </div>
    );
  }

  if (error && !documentUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <h2 className="text-2xl font-semibold">Gagal Memuat Dokumen</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => navigate("/dashboard/documents")} className="px-4 py-2 bg-blue-600 text-white rounded">Kembali</button>
        </div>
      </div>
    );
  }

  // Main layout: Header (fixed) + content (sidebar + viewer)
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* DashboardHeader receives theme & toggleTheme (no redundant theme handling here) */}
      <DashboardHeader
        activePage="documents"
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        theme={theme}
        toggleTheme={toggleTheme || (() => {})}
      />

      {/* content area: reserve header height */}
      <div className="pt-20 flex flex-1 overflow-hidden">
        {/* Sidebar thumbnails
            - Desktop: visible (sm:block)
            - Mobile: controlled by isSidebarOpen (overlay)
        */}
        <aside
          id="thumbnail-aside"
          className={`z-30 transition-all duration-200 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto
            ${isSidebarOpen ? "fixed inset-y-20 left-0 w-48 shadow-lg sm:static sm:shadow-none" : "hidden sm:block sm:w-48"}
          `}
          aria-hidden={!isSidebarOpen && window.innerWidth < 640}
        >
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Halaman</h4>
              {/* Close button only visible on mobile when sidebar is open */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="sm:hidden px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Tutup daftar halaman"
              >
                Tutup
              </button>
            </div>

            {documentUrl ? (
              <Document file={documentUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(e) => console.error("Thumbnail load error:", e)}>
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <button
                    key={`thumb_btn_${i}`}
                    onClick={() => {
                      scrollToPage(i);
                      // on mobile close the sidebar after selecting
                      if (window.innerWidth < 640) setIsSidebarOpen(false);
                    }}
                    className={`w-full mb-3 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${pageNumber === i + 1 ? "ring-2 ring-blue-400" : "ring-0"}`}
                    aria-label={`Thumbnail halaman ${i + 1}`}
                  >
                    <div className="p-1 bg-white dark:bg-slate-800 rounded">
                      <Page pageNumber={i + 1} width={160} renderAnnotationLayer={false} renderTextLayer={false} />
                    </div>
                  </button>
                ))}
              </Document>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada pratinjau.</p>
            )}
          </div>
        </aside>

        {/* Main viewer */}
        <main className="flex-1 overflow-auto" ref={containerRef} onScroll={handleScroll} role="main">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
            {/* small top controls */}
            <div className="mb-4 flex flex-wrap items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-slate-600 dark:text-slate-300">Halaman {pageNumber} dari {numPages || "--"}</p>

                <div className="flex gap-2">
                  {/* Previous */}
                  <button
                    onClick={() => scrollToPage(pageNumber - 2)}
                    disabled={pageNumber <= 1}
                    aria-label="Sebelumnya"
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-200 dark:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Sebelumnya</span>
                  </button>

                  {/* Next */}
                  <button
                    onClick={() => scrollToPage(pageNumber)}
                    disabled={pageNumber >= numPages}
                    aria-label="Berikutnya"
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-200 dark:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline text-sm">Berikutnya</span>
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Back to documents */}
                <button
                  onClick={() => navigate("/dashboard/documents")}
                  aria-label="Kembali ke Dashboard Dokumen"
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Kembali</span>
                </button>

                {/* mobile toggle for sidebar */}
                <button
                  onClick={() => setIsSidebarOpen((v) => !v)}
                  aria-controls="thumbnail-aside"
                  aria-expanded={isSidebarOpen}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-md sm:hidden"
                >
                  <FaFolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSidebarOpen ? "Tutup Halaman" : "Buka Halaman"}</span>
                </button>
              </div>
            </div>

            {/* pages */}
            <div className="space-y-6">
              {documentUrl ? (
                <Document
                  file={documentUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<div className="text-center py-12"><FaSpinner className="animate-spin mx-auto text-4xl text-blue-500" /><p className="mt-3 text-slate-600 dark:text-slate-300">Menyiapkan pratinjau...</p></div>}
                >
                  {Array.from({ length: numPages || 0 }, (_, idx) => (
                    <div
                      key={`page_${idx}`}
                      ref={(el) => (pagesRef.current[idx] = el)}
                      className="flex justify-center"
                      aria-label={`Halaman ${idx + 1}`}
                    >
                      <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                        <Page pageNumber={idx + 1} width={containerWidth} />
                      </div>
                    </div>
                  ))}
                </Document>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">Tidak ada dokumen untuk ditampilkan.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewDocumentPage;
