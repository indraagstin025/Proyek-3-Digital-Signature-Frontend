import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService.js";
import { Document, Page, pdfjs } from "react-pdf";
import { FaSpinner, FaChevronLeft, FaChevronRight, FaFolderOpen, FaArrowLeft, FaTimes, FaThLarge, FaExclamationTriangle } from "react-icons/fa";

import DashboardHeader from "../../components/DashboardHeader/DashboardHeader.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import { userService } from "../../services/userService";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

console.log(`🔧 PDF.js Worker initialized. Version: ${pdfjs.version}`);
// =========================================================================

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
  const [loadError, setLoadError] = useState(null);

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
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ✅ Derive userStatus from userData
  const userStatus = userData?.userStatus || "FREE";

  // --- 1. User Sync Logic ---
  useEffect(() => {
    let mounted = true;
    async function syncUser() {
      try {
        setIsLoadingUser(true);
        const fresh = await userService.getMyProfile();
        if (!mounted) return;
        const prev = localStorage.getItem("authUser");
        if (JSON.stringify(fresh) !== prev) {
          setUserData(fresh);
          localStorage.setItem("authUser", JSON.stringify(fresh));
        } else {
          setUserData(fresh);
        }
      } catch {
        // Sync failed silently
      } finally {
        if (mounted) setIsLoadingUser(false);
      }
    }
    syncUser();
    return () => {
      mounted = false;
    };
  }, []);

  const [pageWidth, setPageWidth] = useState(800);
  const [pagesRendered, setPagesRendered] = useState([]);
  const [zoom, setZoom] = useState(1);
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3.0;

  // Metadata Fetching
  const [signatures, setSignatures] = useState([]);
  const [isMetaLoading, setIsMetaLoading] = useState(false);

  // --- 2. Load PDF URL Logic (With Logs) ---
  // src/pages/dashboard/ViewDocumentPage.jsx

  // --- 2. Load PDF URL Logic (With Logs) ---
  useEffect(() => {
    const controller = new AbortController();

    async function loadURL() {
      if (!documentId) {
        setIsLoading(false);
        return;
      }

      // Reset error setiap kali mulai request baru
      setLoadError(null);

      console.log(`🚀 [ViewDocument] Mulai mengambil URL untuk Dokumen ID: ${documentId}`);

      try {
        // Panggil API Backend
        const response = await documentService.getDocumentFileUrl(documentId, {
          signal: controller.signal,
        });

        // Cek jika component sudah unmount/request dicancel sebelum kita proses datanya
        if (controller.signal.aborted) return;

        // Validasi dan Ekstraksi URL
        const finalUrl = typeof response === "object" && response.url ? response.url : response;

        if (!finalUrl || typeof finalUrl !== "string") {
          throw new Error("URL dokumen tidak valid atau kosong.");
        }

        console.log("🔗 [ViewDocument] Final URL yang akan dipakai:", finalUrl);
        setDocumentUrl(finalUrl);
        // Pastikan error kosong jika sukses
        setLoadError(null);
      } catch (err) {
        // --- DETEKSI CANCEL LEBIH KUAT ---
        // Cek berbagai ciri error cancellation
        const isCanceled = err.name === "CanceledError" || err.message === "canceled" || err.code === "ERR_CANCELED" || controller.signal.aborted;

        if (isCanceled) {
          console.log("🛑 Request dibatalkan (Clean up).");
          return; // JANGAN setLoadError jika cuma dibatalkan
        }

        console.error("❌ [ViewDocument] Gagal load URL:", err);
        setLoadError(err.message || "Gagal menghubungi server.");
      } finally {
        // Hanya matikan loading jika tidak di-cancel
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadURL();
    return () => controller.abort();
  }, [documentId]);

  // --- 3. Fetch Metadata (Signatures) ---
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!documentId || !userData?.id) return;
      try {
        setIsMetaLoading(true);
        const doc = await documentService.getDocumentById(documentId, userData.id);

        // Cek status document
        console.log("📊 [ViewDocument] Metadata Doc Loaded:", doc?.title, "| Status:", doc?.status);

        const isCompleted = doc.status === "completed" || doc.status === "archived";

        if (!isCompleted && doc.currentVersion) {
          const groupSigs = doc.currentVersion.signaturesGroup || [];
          const personalSigs = doc.currentVersion.signaturesPersonal || [];
          const rawSignatures = [...groupSigs, ...personalSigs];

          const overlays = rawSignatures.map((sig) => ({
            uniqueId: sig.id,
            signatureImageUrl: sig.signatureImageUrl,
            pageNumber: sig.pageNumber,
            positionX: parseFloat(sig.positionX),
            positionY: parseFloat(sig.positionY),
            width: parseFloat(sig.width),
            height: parseFloat(sig.height),
          }));

          console.log(`🖊️ [ViewDocument] Found ${overlays.length} active signature overlays.`);
          setSignatures(overlays);
        } else {
          setSignatures([]);
        }
      } catch (error) {
        console.error("❌ [ViewDocument] Gagal fetch metadata:", error);
      } finally {
        setIsMetaLoading(false);
      }
    };
    fetchMetadata();
  }, [documentId, userData]);

  // --- 4. Layout & Resize Logic ---
  const computePageSize = useCallback(() => {
    const screenW = window.innerWidth;
    const mobile = screenW < 640;
    setIsMobile(mobile);

    const left = !mobile && mainSidebarOpen ? MAIN_SIDEBAR_WIDTH : 0;
    const right = !mobile && previewOpen ? PREVIEW_PANEL_WIDTH : 0;
    const containerPadding = mobile ? 32 : 60;
    const availableWidth = screenW - left - right - containerPadding;
    const idealWidth = Math.min(availableWidth, mobile ? availableWidth : 1000);
    const finalWidth = Math.max(280, idealWidth);

    setPageWidth(Math.floor(finalWidth));
  }, [mainSidebarOpen, previewOpen]);

  useEffect(() => {
    computePageSize();
    window.addEventListener("resize", computePageSize);
    let ro;
    const ref = viewerRef.current;
    if (ref && window.ResizeObserver) {
      ro = new ResizeObserver(() => computePageSize());
      ro.observe(ref);
    }
    return () => {
      window.removeEventListener("resize", computePageSize);
      if (ro && ref) ro.disconnect();
    };
  }, [computePageSize]);

  // --- 5. Zoom & Scroll Logic ---
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

  // --- 6. PDF Event Handlers (With Error Logs) ---
  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log(`✅ [ViewDocument] PDF Loaded Successfully! Pages: ${numPages}`);
    setNumPages(numPages);
    setPageNumber(1);
    setPagesRendered(new Array(numPages).fill(false));
    pagesRef.current = new Array(numPages);
    setLoadError(null);

    setTimeout(() => {
      scrollToPage(0, { center: false });
    }, 250);

    setTimeout(() => computePageSize(), 180);
  };

  const onDocumentLoadError = (error) => {
    console.error("❌ [ViewDocument] PDF Load Error (Structure/Parse):", error);
    let msg = "Gagal memuat dokumen.";
    if (error.message) msg += ` (${error.message})`;
    if (error.name === "InvalidPDFException") msg = "Struktur PDF tidak valid atau rusak.";
    if (error.name === "MissingPDFException") msg = "File PDF tidak ditemukan di server.";

    setLoadError(msg);
  };

  const onDocumentSourceError = (error) => {
    console.error("❌ [ViewDocument] PDF Source Error (Network/Fetch):", error);
    setLoadError("Gagal mengunduh file PDF (Network Error / CORS / 404).");
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
    // console.log(`✅ Page ${index + 1} loaded.`);
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

  // Keyboard Navigation
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

  // Intersection Observer
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
  const pageShadowStyle = theme === "dark" ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 15px rgba(0,0,0,0.08)";

  // --- RENDER LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <p className="text-lg text-slate-700 dark:text-slate-300">Menyiapkan dokumen...</p>
        </div>
      </div>
    );
  }

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardHeader activePage="documents" theme={theme} toggleTheme={toggleTheme} isSidebarOpen={mainSidebarOpen} onToggleSidebar={toggleMainSidebar} userStatus={userStatus} isLoadingUser={isLoadingUser} />
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
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => navigate("/dashboard/documents")} className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${btnSizeClass}`} title="Kembali">
            <FaArrowLeft className="text-slate-700 dark:text-slate-200" />
          </button>
          {!isMobile && <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{numPages > 0 ? `${pageNumber} / ${numPages}` : "-- / --"}</p>}
          {isMobile && <p className="text-sm text-slate-500 font-medium ml-1">{numPages > 0 ? `${pageNumber}/${numPages}` : "--"}</p>}
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
        isPremium={userStatus === "PREMIUM" || userStatus === "PREMIUM_YEARLY"}
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
              {/* Document Preview Mobile (No Error/Loading Handlers needed here for simplicity) */}
              {documentUrl && (
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
                        <Page pageNumber={i + 1} width={100} renderAnnotationLayer={false} renderTextLayer={false} error="" loading="" />
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-1">
                          <span className="text-xs text-white font-medium">{i + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Document>
              )}
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
            <Document file={documentUrl} error="" loading="">
              <div className="flex flex-col gap-4">
                {Array.from({ length: numPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToPage(i)}
                    className={`flex flex-col items-center rounded-lg p-2 transition-all ${pageNumber === i + 1 ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                  >
                    <div className="shadow-sm border border-slate-200 dark:border-slate-700 rounded bg-white overflow-hidden">
                      <Page pageNumber={i + 1} width={PREVIEW_PANEL_WIDTH - 64} renderAnnotationLayer={false} renderTextLayer={false} error="" loading="" />
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
          {/* TAMPILKAN ERROR JIKA ADA */}
          {loadError && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Gagal Membuka Dokumen</h3>
              <p className="text-slate-500 mt-2 max-w-md">{loadError}</p>
              <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Coba Muat Ulang
              </button>
            </div>
          )}

          {!loadError && (
            <Document
              file={documentUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError} // Logs + UI Update
              onSourceError={onDocumentSourceError} // Logs + UI Update
              loading={
                <div className="py-20 flex flex-col items-center gap-3">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                  <span className="text-slate-500">Merender halaman PDF...</span>
                </div>
              }
              error={null} // Kita handle error manual di atas
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
                        maxWidth: "100%",
                        boxShadow: isActive ? (theme === "dark" ? "0 0 0 2px #3b82f6, 0 10px 30px rgba(0,0,0,0.5)" : "0 0 0 2px #3b82f6, 0 10px 30px rgba(0,0,0,0.15)") : pageShadowStyle,
                        borderRadius: 2,
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
                        width={displayWidth}
                        onRenderSuccess={() => onPageRenderSuccess(i)}
                        onLoadSuccess={(pdfPage) => handlePageLoadSuccess(pdfPage, i)}
                        renderAnnotationLayer={true}
                        renderTextLayer={true}
                        className="pdf-page-render"
                        devicePixelRatio={isMobile ? 2.0 : Math.min(window.devicePixelRatio || 1, 3.0)}
                        scale={1}
                        loading=""
                        error={
                          <div className="flex flex-col items-center justify-center h-full p-10 bg-gray-50 text-red-500">
                            <FaExclamationTriangle className="mb-2" />
                            <span className="text-xs">Gagal Render Halaman</span>
                          </div>
                        }
                      />

                      {/* OVERLAY SIGNATURES */}
                      {signatures
                        .filter((sig) => sig.pageNumber === i + 1)
                        .map((sig) => (
                          <img
                            key={sig.uniqueId}
                            src={sig.signatureImageUrl}
                            alt="Signature"
                            className="absolute select-none pointer-events-none"
                            style={{
                              left: `${sig.positionX * 100}%`,
                              top: `${sig.positionY * 100}%`,
                              width: `${sig.width * 100}%`,
                              height: `${sig.height * 100}%`,
                              zIndex: 20,
                              objectFit: "contain",
                            }}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
            </Document>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewDocumentPage;
