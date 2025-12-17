import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../services/documentService";
import { packageService } from "../services/packageService"; // Opsional: jika ada fitur batch sign
import { userService } from "../services/userService"; 
import toast from "react-hot-toast";

export const useDashboardDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [groupDocuments, setGroupDocuments] = useState([]);
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  
  // Selection & Batch Action State
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  // 1. Initial Load User
  useEffect(() => {
    const loadUser = async () => {
        try {
            const user = await userService.getMyProfile();
            setCurrentUser(user);
        } catch (e) {
            console.error("Gagal load user profile", e);
        }
    };
    loadUser();
  }, []);

  // 2. Fetch Documents
  const fetchDocuments = useCallback(async (query = "") => {
    setIsLoading(true);
    setError("");
    if (query) setIsSearching(true);

    try {
      // Mengambil semua dokumen (API sudah handle filter search jika ada)
      const allDocs = await documentService.getAllDocuments(query);
      
      setDocuments(allDocs);

      // Pisahkan Personal vs Group di Frontend
      // (Atau bisa juga minta API memisahkan, tapi ini lebih fleksibel)
      const personal = allDocs.filter(doc => !doc.groupId);
      const group = allDocs.filter(doc => doc.groupId);

      setPersonalDocuments(personal);
      setGroupDocuments(group);

    } catch (err) {
      console.error(err);
      setError("Gagal memuat dokumen.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Trigger fetch saat search query berubah (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchDocuments(searchQuery);
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [searchQuery, fetchDocuments]);


  // 3. Status Logic
  /**
   * Menentukan status tampilan kartu dokumen.
   * Karena Backend SUDAH mereset status signer menjadi PENDING saat rollback,
   * kita bisa percaya penuh pada status dokumen dari database.
   */
const getDerivedStatus = useCallback((doc) => {
    const globalStatus = doc.status;

    // Untuk Group Document yang statusnya 'pending', kita perlu tahu apakah user perlu action atau waiting
    if (doc.groupId && globalStatus === 'pending' && currentUser) {
        // Cari request user
        const myRequest = doc.signerRequests?.find(req => req.userId === currentUser.id);

        if (myRequest) {
            // Jika saya belum sign -> Action Needed
            if (myRequest.status === 'PENDING') return 'action_needed';
            
            // Jika saya SUDAH sign, tapi teman lain belum -> Waiting
            if (myRequest.status === 'SIGNED') return 'waiting';
        }
        
        // Jika saya bukan signer di dokumen group ini (misal hanya member), return pending biasa
        return 'pending';
    }

    // Default Personal / Package
    return globalStatus;
  }, [currentUser]);


  // 4. Delete Logic
  const deleteDocument = async (docId) => {
    await documentService.deleteDocument(docId);
    // Update state lokal tanpa fetch ulang (Optimistic UI update)
    setDocuments(prev => prev.filter(d => d.id !== docId));
    setPersonalDocuments(prev => prev.filter(d => d.id !== docId));
    setGroupDocuments(prev => prev.filter(d => d.id !== docId));
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      next.delete(docId);
      return next;
    });
    return true;
  };


  // 5. Selection Logic
  const toggleDocumentSelection = (docId) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const clearSelection = () => setSelectedDocIds(new Set());


  // 6. Batch Signing Logic
const startBatchSigning = async () => {
    if (selectedDocIds.size === 0) return;
    
    setIsSubmittingBatch(true);
    const toastId = toast.loading("Membuat paket tanda tangan...");

    try {
        const docIdsArray = Array.from(selectedDocIds);
        
        // Panggil service: createPackage(title, documentIds)
        // (Pastikan packageService.js sudah diperbaiki urutan parameternya seperti diskusi sebelumnya)
        const newPackage = await packageService.createPackage(
           "Batch Sign " + new Date().toLocaleDateString(), 
           docIdsArray
        );
        
        toast.success("Paket siap! Mengalihkan...", { id: toastId });
        
        // [UPDATE] Navigasi sesuai route yang Anda berikan:
        // Route: /packages/sign/:packageId
        navigate(`/packages/sign/${newPackage.id}`);

    } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal membuat paket.", { id: toastId });
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
    getDerivedStatus,
    fetchDocuments,
    deleteDocument,
    
    // Selection & Batch
    selectedDocIds,
    toggleDocumentSelection,
    clearSelection,
    startBatchSigning,
    isSubmittingBatch,
    
    // Search
    searchQuery,
    setSearchQuery
  };
};