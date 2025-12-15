import { useState, useEffect } from "react";
import { documentService } from "../services/documentService";

export const useViewPDF = (documentId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  
  // Fetch File URL
  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        const signedUrl = await documentService.getDocumentFileUrl(documentId, { signal: controller.signal });
        setUrl(signedUrl);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Gagal load PDF URL:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => controller.abort();
  }, [documentId]);

  // Navigation Handlers
  const goToPage = (p) => setPageNumber(Math.min(Math.max(1, p), numPages));
  const nextPage = () => goToPage(pageNumber + 1);
  const prevPage = () => goToPage(pageNumber - 1);

  return {
    url,
    loading,
    numPages,
    setNumPages,
    pageNumber,
    setPageNumber,
    nextPage,
    prevPage,
    goToPage
  };
};