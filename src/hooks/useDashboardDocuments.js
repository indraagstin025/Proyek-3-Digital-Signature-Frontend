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

  // --- 1. OPTIMASI USER DATA (SINKRON) ---
  // Kita tidak perlu memanggil API /me lagi. Ambil data user dari cache LocalStorage.
  // Ini menghilangkan error "ERR_INTERNET_DISCONNECTED" untuk endpoint user saat offline.
  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("authUser"); // Sesuaikan key di sistem Anda
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.warn("Gagal parsing user dari storage", e);
      return null;
    }
  });

  // --- 2. FETCH DATA DENGAN ABORT & ERROR FILTER ---
  const fetchDocuments = useCallback(async (query = "") => {
    // Batalkan request sebelumnya jika user mengetik cepat (Search Optimization)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(""); // Reset error lokal
    if (query) setIsSearching(true);

    try {
      // Kirim signal ke service (pastikan service support pass config ke axios)
      const allDocs = await documentService.getAllDocuments(query, {
        signal: abortControllerRef.current.signal,
      });

      setDocuments(allDocs);

      // Filter Client Side (Lebih cepat daripada request ulang)
      setPersonalDocuments(allDocs.filter((doc) => !doc.groupId));
      setGroupDocuments(allDocs.filter((doc) => doc.groupId));
    } catch (err) {
      // Abaikan jika error disebabkan oleh pembatalan manual (Abort)
      if (err.name === "CanceledError" || err.name === "AbortError") return;

      console.error("Error fetching docs:", err);

      // --- FILTER ERROR (Agar tidak double toast dengan Global Handler) ---
      const isAuthError = err.response?.status === 401;
      const isNetworkError = err.message === "Request Timeout" || err.message === "Network Error" || err.message.includes("offline") || err.code === "ECONNABORTED";

      // Hanya set pesan error di UI Dashboard jika BUKAN masalah koneksi/auth
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
    }, 500); // Tunggu 500ms setelah user berhenti mengetik
    return () => clearTimeout(timer);
  }, [searchQuery, fetchDocuments]);

  // --- 4. LOGIKA STATUS DINAMIS ---
  const getDerivedStatus = useCallback(
    (doc) => {
      if (!currentUser) return doc.status;

      const globalStatus = doc.status;

      // Jika dokumen grup masih pending, cek apakah SAYA yang harus tanda tangan?
      if (doc.groupId && globalStatus === "pending") {
        const myRequest = doc.signerRequests?.find((req) => req.userId === currentUser.id);

        if (myRequest) {
          if (myRequest.status === "PENDING") return "action_needed"; // Giliran saya
          if (myRequest.status === "SIGNED") return "waiting"; // Saya sudah, nunggu yang lain
        }
        return "pending";
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

      // Optimistic Update: Hapus dari state UI tanpa fetch ulang (Cepat!)
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
    const toastId = toast.loading("Membuat paket tanda tangan...");

    try {
      const docIdsArray = Array.from(selectedDocIds);
      const newPackage = await packageService.createPackage("Batch Sign " + new Date().toLocaleDateString(), docIdsArray);

      toast.success("Paket siap! Mengalihkan...", { id: toastId });
      navigate(`/packages/sign/${newPackage.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Gagal membuat paket.";
      // Pastikan toast error muncul karena ini aksi user manual (klik tombol)
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
