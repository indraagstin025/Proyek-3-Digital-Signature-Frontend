import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../services/documentService";
import { packageService } from "../services/packageService";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export const useDashboardDocuments = () => {
  // --- STATE ---
  const [documents, setDocuments] = useState([]);
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [groupDocuments, setGroupDocuments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const [searchParams] = useSearchParams();

  // --- 1. USER DATA ---
  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.warn("Gagal parsing user dari storage", e);
      return null;
    }
  });

  // --- 2. FETCH DATA ---
  const fetchDocuments = useCallback(async (query = "") => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError("");
    if (query) setIsSearching(true);

    try {
      const allDocs = await documentService.getAllDocuments(query, {
        signal: abortControllerRef.current.signal,
      });

      setDocuments(allDocs);
      setPersonalDocuments(allDocs.filter((doc) => !doc.groupId));
      setGroupDocuments(allDocs.filter((doc) => doc.groupId));
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;

      console.error("Error fetching docs:", err);
      const isAuthError = err.response?.status === 401;
      const isNetworkError = err.message === "Request Timeout" || err.message === "Network Error" || err.message.includes("offline") || err.code === "ECONNABORTED";

      if (!isAuthError && !isNetworkError) {
        setError("Gagal memuat dokumen.");
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("openUpload") === "true") {
      setIsUploadModalOpen(true);
    }
  }, [searchParams]);

  // --- 3. DEBOUNCE SEARCH ---
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchDocuments]);

  // --- 4. STATUS DINAMIS ---
  const getDerivedStatus = useCallback(
    (doc) => {
      if (!currentUser) return doc.status;
      const globalStatus = doc.status;

      if (doc.groupId && globalStatus === "pending") {
        const myRequest = doc.signerRequests?.find((req) => req.userId === currentUser.id);
        if (myRequest) {
          if (myRequest.status === "PENDING") return "action_needed";
          if (myRequest.status === "SIGNED") return "waiting";
        }
        return "pending";
      }
      return globalStatus;
    },
    [currentUser]
  );

  // --- 5. DELETE DENGAN FEEDBACK (TOAST DISINI SAJA) ---
  const deleteDocument = async (docId) => {
    const deletePromise = documentService.deleteDocument(docId);

    try {
      // ✅ KITA PERTAHANKAN TOAST DISINI
      await toast.promise(deletePromise, {
        loading: "Menghapus dokumen...",
        success: "Dokumen berhasil dihapus",
        error: (err) => `Gagal menghapus: ${err.message}`,
      });

      // Optimistic Update
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setPersonalDocuments((prev) => prev.filter((d) => d.id !== docId));
      setGroupDocuments((prev) => prev.filter((d) => d.id !== docId));

      setSelectedDocIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  // --- 6. BATCH ACTIONS ---
  const toggleDocumentSelection = (docId) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const clearSelection = () => setSelectedDocIds(new Set());

  const startBatchSigning = async () => {
    if (selectedDocIds.size === 0) return;

    setIsSubmittingBatch(true);
    // 1. Simpan ID toast loading
    const toastId = toast.loading("Membuat paket tanda tangan...");

    try {
      const docIdsArray = Array.from(selectedDocIds);
      const newPackage = await packageService.createPackage("Batch Sign " + new Date().toLocaleDateString(), docIdsArray);

      // ✅ FIX MASALAH PERTAMA:
      // Jangan pakai toast.success karena akan muncul telat di halaman berikutnya.
      // Cukup matikan loading, lalu pindah. User tau itu berhasil karena halamannya berubah.
      toast.dismiss(toastId);

      navigate(`/packages/sign/${newPackage.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Gagal membuat paket.";

      // Jika error, ubah loading menjadi error (ini tetap perlu ditampilkan)
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  return {
    documents,
    personalDocuments,
    groupDocuments,
    isLoading,
    isSearching,
    error,
    currentUser,

    getDerivedStatus,
    fetchDocuments,
    deleteDocument,

    selectedDocIds,
    toggleDocumentSelection,
    clearSelection,
    startBatchSigning,
    isSubmittingBatch,

    searchQuery,
    setSearchQuery,
    isUploadModalOpen,
    setIsUploadModalOpen,
  };
};
