import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import { Document, Page, pdfjs } from "react-pdf";
import { FaSpinner, FaChevronLeft, FaChevronRight, FaFolderOpen, FaArrowLeft, FaTimes, FaThLarge } from "react-icons/fa";

import DashboardHeader from "../../components/layout/DashboardHeader.jsx";
import Sidebar from "../../components/layout/Sidebar.jsx";
import { userService } from "../../services/userService.js";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Pastikan path worker ini benar sesuai setup public folder Anda
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

const LOCAL_TEST_FILE = "/mnt/data/6959bd64-4ea7-4a80-bd84-55d5d6c94467.png";

const MAIN_SIDEBAR_WIDTH = 256;
const PREVIEW_PANEL_WIDTH = 320;
const HEADER_HEIGHT = 80;
const TOOLBAR_HEIGHT_DESKTOP = 64;
const TOOLBAR_HEIGHT_MOBILE = 56;

const ViewDocumentPage = ({ theme = "light", toggleTheme }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [documentUrl, setDocumentUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [mainSidebarOpen, setMainSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [previewOpen, setPreviewOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 1280 : true);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);

  const viewerRef = useRef(null);
  const pagesRef = useRef([]);
  const previewRef = useRef(null);

  const [userData, setUserData] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    let mounted = true;
    async function syncUser() {
      try {
        const fresh = await userService.getMyProfile();
        if (!mounted) return;
        const prev = localStorage.getItem("authUser");
        if (JSON.stringify(fresh) !== prev) {
          setUserData(fresh);
          localStorage.setItem("authUser", JSON.stringify(fresh));
        } else {
          setUserData(fresh);
        }
      } catch (err) {}
    }
    syncUser();
    return () => {
      mounted = false;
    };
  }, []);

  const [pageAspect, setPageAspect] = useState(null);
  const [pageWidth, setPageWidth] = useState(800);
  const [pagesRendered, setPagesRendered] = useState([]);

  // Menggunakan default scale yang lebih baik untuk ketajaman
  const [zoom, setZoom] = useState(1);
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3.0;

  // Dapatkan Device Pixel Ratio untuk ketajaman
  const getDPR = () => {
    if (typeof window === "undefined") return 1;
    // Batasi maks 2.5 agar tidak terlalu berat render di layar 4K/5K
    return Math.min(window.devicePixelRatio || 1, 2.5);
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadURL() {
      if (!documentId) {
        setIsLoading(false);
        return;
      }
      try {
        const signedUrl = await documentService.getDocumentFileUrl(documentId, {
          signal: controller.signal,
        });
        setDocumentUrl(signedUrl || LOCAL_TEST_FILE);
      } catch (err) {
        if (err && err.name === "AbortError") return;
        setDocumentUrl(LOCAL_TEST_FILE);
      } finally {
        setIsLoading(false);
      }
    }
    loadURL();
    return () => controller.abort();
  }, [documentId]);

  // Fungsi kalkulasi ukuran halaman yang lebih robust
  const computePageSize = useCallback(() => {
    const screenW = window.innerWidth;
    const mobile = screenW < 640;
    setIsMobile(mobile);

    const left = !mobile && mainSidebarOpen ? MAIN_SIDEBAR_WIDTH : 0;
    const right = !mobile && previewOpen ? PREVIEW_PANEL_WIDTH : 0;

    // Padding horizontal viewer container
    const containerPadding = mobile ? 32 : 60;

    // Width yang tersedia di layar dikurangi sidebar dan panel
    const availableWidth = screenW - left - right - containerPadding;

    // Tentukan lebar ideal:
    // Di mobile hampir full width, di desktop dibatasi agar nyaman dibaca (max 1000px base)
    const idealWidth = Math.min(availableWidth, mobile ? availableWidth : 1000);

    // Pastikan tidak negatif dan tidak terlalu kecil
    const finalWidth = Math.max(280, idealWidth);

    setPageWidth(Math.floor(finalWidth)); // Gunakan floor agar angka bulat (tajam)
  }, [mainSidebarOpen, previewOpen]);

  useEffect(() => {
    computePageSize();
    window.addEventListener("resize", computePageSize);
    let ro;
    if (viewerRef.current && window.ResizeObserver) {
      ro = new ResizeObserver(() => computePageSize());
      ro.observe(viewerRef.current);
    }
    return () => {
      window.removeEventListener("resize", computePageSize);
      if (ro && viewerRef.current) ro.disconnect();
    };
  }, [computePageSize]);

  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;
    function onWheel(e) {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
        else setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
      }
    }
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const toolbarHeight = isMobile ? TOOLBAR_HEIGHT_MOBILE : TOOLBAR_HEIGHT_DESKTOP;
  const topOffset = HEADER_HEIGHT + toolbarHeight + 18;
  const leftOffset = !isMobile && mainSidebarOpen ? MAIN_SIDEBAR_WIDTH : 0;
  const rightOffset = !isMobile && previewOpen ? PREVIEW_PANEL_WIDTH : 0;

  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;
    container.style.scrollPaddingTop = `${topOffset}px`;
    pagesRef.current.forEach((el) => {
      if (el && el.style) {
        el.style.scrollMarginTop = `${topOffset + 12}px`;
      }
    });
  }, [topOffset, numPages, isMobile]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPagesRendered(new Array(numPages).fill(false));
    pagesRef.current = new Array(numPages);

    setTimeout(() => {
      scrollToPage(0, { center: false });
    }, 250);

    setTimeout(() => computePageSize(), 180);
  };

  const onPageRenderSuccess = (index) => {
    setPagesRendered((prev) => {
      if (!prev) return prev;
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const handlePageLoadSuccess = (pdfPage, index) => {
    try {
      if (!pdfPage || !pdfPage.getViewport) return;
      const vp = pdfPage.getViewport({ scale: 1 });
      const asp = vp.width / vp.height;
      setPageAspect((prev) => prev || asp);
    } catch (err) {}
  };

  const scrollToPage = useCallback(
    (i, opts = { center: true }) => {
      const el = pagesRef.current[i];
      const container = viewerRef.current;
      if (!el || !container) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offsetWithinContainer = elRect.top - containerRect.top + container.scrollTop;

      if (!opts.center) {
        const targetTop = Math.max(0, Math.round(offsetWithinContainer - topOffset + 12));
        container.scrollTo({ top: targetTop, behavior: "smooth" });
        setPageNumber(i + 1);
        return;
      }

      let targetTop = Math.round(offsetWithinContainer - (container.clientHeight / 2 - el.clientHeight / 2));
      const minTarget = Math.max(0, Math.round(offsetWithinContainer - topOffset + 12));
      if (targetTop < minTarget) targetTop = minTarget;

      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      if (targetTop > maxScroll) targetTop = maxScroll;

      container.scrollTo({ top: targetTop, behavior: "smooth" });
      setPageNumber(i + 1);
    },
    [topOffset]
  );

  const handleScroll = (e) => {
    const container = e.target;
    const scrollCenter = container.scrollTop + container.clientHeight / 2;
    let current = 1;
    for (let i = 0; i < pagesRef.current.length; i++) {
      const el = pagesRef.current[i];
      if (!el) continue;
      const elTop = el.offsetTop;
      const elBottom = elTop + el.clientHeight;
      if (scrollCenter >= elTop && scrollCenter <= elBottom) {
        current = i + 1;
        break;
      } else if (scrollCenter > elBottom) {
        current = i + 1;
      }
    }
    if (current !== pageNumber) setPageNumber(current);
  };

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") {
        setPageNumber((p) => {
          const next = Math.max(1, p - 1);
          if (next !== p) scrollToPage(next - 1);
          return next;
        });
      } else if (e.key === "ArrowRight") {
        setPageNumber((p) => {
          const next = Math.min(numPages || 1, p + 1);
          if (next !== p) scrollToPage(next - 1);
          return next;
        });
      } else if (e.key === "Escape") {
        if (isMobile && previewOpen) setPreviewOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages, previewOpen, isMobile, scrollToPage]);

  // Observer untuk update page number saat scroll (fallback)
  useEffect(() => {
    const root = viewerRef.current;
    if (!root || !window.IntersectionObserver) return;
    const obs = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.isIntersecting) {
          const idx = pagesRef.current.findIndex((el) => el === best.target);
          if (idx >= 0) setPageNumber(idx + 1);
        }
      },
      { root, threshold: [0.25, 0.5, 0.75] }
    );
    pagesRef.current.forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [numPages, zoom, isMobile]);

  const togglePreview = () => setPreviewOpen((v) => !v);
  const toggleMainSidebar = () => setMainSidebarOpen((v) => !v);
  const btnSizeClass = isMobile ? "w-12 h-12" : "w-9 h-9";
  // Shadow dibuat lebih subtle agar fokus ke dokumen
  const pageShadowStyle = theme === "dark" ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 15px rgba(0,0,0,0.08)";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <p className="text-lg text-slate-700 dark:text-slate-300">Memuat dokumen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardHeader activePage="documents" theme={theme} toggleTheme={toggleTheme} isSidebarOpen={mainSidebarOpen} onToggleSidebar={toggleMainSidebar} />
      </div>

      {/* Toolbar */}
      <div
        className="fixed z-40 flex items-center justify-between px-3 sm:px-6 overflow-x-auto"
        style={{
          top: HEADER_HEIGHT,
          left: leftOffset,
          width: `calc(100% - ${leftOffset + rightOffset}px)`,
          height: toolbarHeight,
          background: theme === "dark" ? "#0f172a" : "#ffffff",
          borderBottom: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
          transition: "left 300ms ease, width 300ms ease",
        }}
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => navigate("/dashboard/documents")} className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${btnSizeClass}`} title="Kembali">
            <FaArrowLeft className="text-slate-700 dark:text-slate-200" />
          </button>

          {!isMobile && (
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {pageNumber} / {numPages}
            </p>
          )}
          {isMobile && <p className="text-sm text-slate-500 font-medium ml-1">{`${pageNumber}/${numPages}`}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollToPage(Math.max(0, pageNumber - 2))}
            disabled={pageNumber <= 1}
            className={`flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors ${btnSizeClass}`}
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => scrollToPage(Math.min((numPages || 1) - 1, pageNumber))}
            disabled={pageNumber >= numPages}
            className={`flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors ${btnSizeClass}`}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePreview}
            className={`rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors ${btnSizeClass} ${previewOpen ? "bg-slate-100 dark:bg-slate-800" : ""}`}
            title="Pratinjau Halaman"
          >
            <FaFolderOpen className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>
      </div>

      {/* Sidebar Utama */}
      <Sidebar
        userName={userData?.name || userData?.fullName || null}
        userEmail={userData?.email || null}
        userAvatar={userData?.profilePictureUrl || null}
        isOpen={mainSidebarOpen}
        activePage="documents"
        onClose={() => setMainSidebarOpen(false)}
        theme={theme}
      />

      {/* Mobile Preview Modal */}
      {isMobile && previewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm" onClick={() => setPreviewOpen(false)}>
          <div className="mt-auto rounded-t-xl shadow-2xl bg-white dark:bg-slate-900 max-h-[85vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 sticky top-0 bg-inherit z-10">
              <h3 className="font-semibold text-slate-800 dark:text-white">Pratinjau {numPages} Halaman</h3>
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setPreviewOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900">
              <Document file={documentUrl}>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: numPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        scrollToPage(i);
                        setPreviewOpen(false);
                      }}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${pageNumber === i + 1 ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900" : "border-transparent hover:border-slate-300"}`}
                    >
                      <Page pageNumber={i + 1} width={100} renderAnnotationLayer={false} renderTextLayer={false} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-1">
                        <span className="text-xs text-white font-medium">{i + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Document>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Preview Sidebar */}
      <aside
        id="document-preview"
        ref={previewRef}
        className={`fixed right-0 z-30 overflow-y-auto transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isMobile ? "hidden" : ""}`}
        style={{
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          width: PREVIEW_PANEL_WIDTH,
          transform: previewOpen ? "translateX(0)" : "translateX(100%)",
          background: theme === "dark" ? "#0f172a" : "#f8fafc",
          borderLeft: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 sticky top-0 bg-inherit z-10">
          <div className="flex items-center gap-2">
            <FaThLarge className="text-slate-500" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Pratinjau</h4>
          </div>
          <button onClick={() => setPreviewOpen(false)} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="p-4">
          {documentUrl && numPages > 0 && (
            <Document file={documentUrl}>
              <div className="flex flex-col gap-4">
                {Array.from({ length: numPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToPage(i)}
                    className={`flex flex-col items-center rounded-lg p-2 transition-all ${pageNumber === i + 1 ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                  >
                    <div className="shadow-sm border border-slate-200 dark:border-slate-700 rounded bg-white overflow-hidden">
                      <Page pageNumber={i + 1} width={PREVIEW_PANEL_WIDTH - 64} renderAnnotationLayer={false} renderTextLayer={false} />
                    </div>
                    <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Halaman {i + 1}</span>
                  </button>
                ))}
              </div>
            </Document>
          )}
        </div>
      </aside>

      {/* MAIN Viewer */}
      <main
        ref={viewerRef}
        onScroll={handleScroll}
        className="overflow-auto h-screen transition-all duration-300 bg-slate-100 dark:bg-slate-900 custom-scrollbar"
        style={{
          paddingTop: topOffset,
          marginLeft: leftOffset,
          marginRight: rightOffset,
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <div className="flex flex-col items-center min-h-full pb-20">
          <Document
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="py-20 flex flex-col items-center gap-3">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
                <span className="text-slate-500">Merender dokumen...</span>
              </div>
            }
            error={<div className="py-20 text-red-500 font-medium">Gagal memuat dokumen PDF.</div>}
          >
            {Array.from({ length: numPages }, (_, i) => {
              const isRendered = pagesRendered[i];
              const isActive = pageNumber === i + 1;
              const displayWidth = Math.round(pageWidth * zoom);

              return (
                <div key={i} ref={(el) => (pagesRef.current[i] = el)} className={`w-full flex justify-center mb-6 sm:mb-10 px-4 sm:px-8 transition-opacity duration-300 ${isRendered ? "opacity-100" : "opacity-50"}`}>
                  {/* Container "Kertas" */}
                  <div
                    className="relative bg-white transition-all duration-200 ease-out"
                    style={{
                      width: displayWidth,
                      maxWidth: "100%", // Responsive constraint
                      boxShadow: isActive ? (theme === "dark" ? "0 0 0 2px #3b82f6, 0 10px 30px rgba(0,0,0,0.5)" : "0 0 0 2px #3b82f6, 0 10px 30px rgba(0,0,0,0.15)") : pageShadowStyle,
                      borderRadius: 2, // Ujung kertas biasanya tajam/sedikit round
                    }}
                  >
                    {/* Header Halaman (floating) */}
                    <div className="absolute -left-12 top-0 hidden xl:flex flex-col items-end opacity-50">
                      <span className="text-lg font-bold text-slate-400">{i + 1}</span>
                    </div>

                    {/* Loader overlay per halaman */}
                    {!isRendered && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                        <FaSpinner className="animate-spin text-2xl text-slate-300" />
                      </div>
                    )}

                    {/* PDF Page Render - Tanpa padding internal agar tajam */}
<Page
  pageNumber={i + 1}
  // 1. RESPONSIF: Gunakan width dinamis sesuai perhitungan layar
  width={displayWidth} 
  
  onRenderSuccess={() => onPageRenderSuccess(i)}
  onLoadSuccess={(pdfPage) => handlePageLoadSuccess(pdfPage, i)}
  renderAnnotationLayer={true}
  renderTextLayer={true}
  className="pdf-page-render"
  
  // 2. KETAJAMAN:
  // Jangan gunakan window.devicePixelRatio bawaan (kadang return 1 di HP tertentu)
  // Kita PAKSA minimal 2.0 di mobile. Ini akan membuat teks tajam/crisp.
  // Tapi dibatasi max 3.0 agar HP kentang tidak crash/lag.
  devicePixelRatio={isMobile ? 2.0 : Math.min(window.devicePixelRatio || 1, 3.0)}
  
  // 3. HAPUS SCALE:
  // Jangan pakai scale={...} jika sudah pakai width={...} agar layout tidak rusak.
  scale={1}
  
  loading=""
/>
                  </div>
                </div>
              );
            })}
          </Document>
        </div>
      </main>
    </div>
  );
};

export default ViewDocumentPage;
