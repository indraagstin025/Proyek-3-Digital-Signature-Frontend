import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService";
import { packageService } from "../../services/packageService";
import { useSearchParams } from "react-router-dom";
import { useCanPerformAction } from "../useCanPerformAction";
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

  // --- 1. USER DATA (FIXED: Parse dengan Aman) ---
  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser);
      // [PERBAIKAN] Pastikan mengambil object user yang benar (kadang terbungkus property 'user')
      return parsed?.user || parsed;
    } catch (e) {
      console.warn("Gagal parsing user dari storage", e);
      return null;
    }
  });

  // --- 2. FETCH DATA (FIXED: Anti Crash / Anti Stuck) ---
  const fetchDocuments = useCallback(async (query = "") => {
    // Batalkan request sebelumnya jika ada (mencegah memory leak / race condition)
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

      // [PERBAIKAN UTAMA] Validasi Array!
      // Jika API error dan return null/undefined, kita paksa jadi array kosong []
      // Ini mencegah error "filter of undefined" yang bikin web stuck.
      const validDocs = Array.isArray(allDocs) ? allDocs : [];

      setDocuments(validDocs);
      setPersonalDocuments(validDocs.filter((doc) => !doc.groupId));
      setGroupDocuments(validDocs.filter((doc) => doc.groupId));
    } catch (err) {
      // Abaikan error jika request dibatalkan user (pindah halaman/ketik cepat)
      if (err.name === "CanceledError" || err.name === "AbortError") return;

      console.error("Error fetching docs:", err);
      const isAuthError = err.response?.status === 401;
      const isNetworkError = err.message === "Request Timeout" || err.message === "Network Error" || err.message.includes("offline") || err.code === "ECONNABORTED";

      if (!isAuthError && !isNetworkError) {
        setError("Gagal memuat dokumen.");
      }

      // [PENTING] Reset state agar UI tidak crash render
      setDocuments([]);
      setPersonalDocuments([]);
      setGroupDocuments([]);
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

      // 1. Cek Dokumen Grup (Logic Signer)
      if (doc.groupId && globalStatus === "pending") {
        const myRequest = doc.signerRequests?.find((req) => req.userId === currentUser.id);
        if (myRequest) {
          if (myRequest.status === "PENDING") return "action_needed";
          if (myRequest.status === "SIGNED") return "waiting";
        }
        return "pending";
      }

      // 2. Cek Dokumen Personal (Logic Signature)
      const version = doc.currentVersion;
      if (version) {
        const isSelfSigned = version.signaturesPersonal && version.signaturesPersonal.some((sig) => sig.signerId === currentUser.id);
        // Jika status masih draft/pending tapi user ini sudah tanda tangan
        if (isSelfSigned && globalStatus !== "completed") return "signed";
      }

      return globalStatus;
    },
    [currentUser]
  );

  // --- 5. DELETE DENGAN FEEDBACK ---
  const deleteDocument = async (docId) => {
    const deletePromise = documentService.deleteDocument(docId);

    try {
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

  // --- 7. START BATCH SIGNING (DENGAN SOFT LOCK) ---
  const { canPerform: canCreatePackage, reason: createPackageReason } = useCanPerformAction("create_package", selectedDocIds.size);

  const startBatchSigning = async () => {
    if (selectedDocIds.size === 0) return;

    // [SOFT LOCK CHECK]
    if (!canCreatePackage) {
      toast.error(createPackageReason, { icon: "🔒", duration: 4000 });
      return;
    }

    setIsSubmittingBatch(true);
    const toastId = toast.loading("Membuat paket tanda tangan...");

    try {
      const docIdsArray = Array.from(selectedDocIds);
      const newPackage = await packageService.createPackage("Batch Sign " + new Date().toLocaleDateString(), docIdsArray);

      toast.dismiss(toastId);
      navigate(`/packages/sign/${newPackage.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Gagal membuat paket.";
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
