/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { documentService } from "../services/documentService";
import { signatureService } from "../services/signatureService";
import { userService } from "../services/userService";
import { socketService } from "../services/socketService";

export const useSignaturePage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const contextData = useOutletContext();

  // --- State Management ---
  const [currentUser, setCurrentUser] = useState(
    contextData?.user || JSON.parse(localStorage.getItem("user") || "null")
  );

  const [documentTitle, setDocumentTitle] = useState("Memuat...");
  const [pdfFile, setPdfFile] = useState(null);
  const [documentVersionId, setDocumentVersionId] = useState(null);
  
  // Permissions & Status
  const [isGroupDoc, setIsGroupDoc] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [mySignStatus, setMySignStatus] = useState(null);
  const [isSignedSuccess, setIsSignedSuccess] = useState(false);
  
  // Loading States
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Signatures Data
  const [signatures, setSignatures] = useState([]);
  
  // UI States (Modal, Sidebar, Responsive, dll)
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  
  // AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiData, setAiData] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // Responsive State
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  // --- Effects ---

  // 1. Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Fetch User jika belum ada
  useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        try {
          const data = await userService.getMyProfile();
          setCurrentUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } catch (error) {
          toast.error("Sesi berakhir. Mohon login ulang.");
          navigate("/login");
        }
      };
      fetchUser();
    }
  }, [currentUser, navigate]);

  // 3. Socket Connection & Listeners
  useEffect(() => {
    if (documentId) {
      socketService.connect();
      socketService.joinRoom(documentId);

      // Listener: Teman menggeser signature
      socketService.onPositionUpdate((data) => {
        setSignatures((prev) =>
          prev.map((sig) => {
            if (sig.id === data.signatureId) {
              return {
                ...sig,
                positionX: data.positionX,
                positionY: data.positionY,
                width: data.width !== undefined ? data.width : sig.width,
                height: data.height !== undefined ? data.height : sig.height,
                // Reset display offset karena posisi absolut sudah diupdate
                x_display: 0, y_display: 0, width_display: 0, height_display: 0,
              };
            }
            return sig;
          })
        );
      });

      // Listener: Teman menambah signature baru
      socketService.onAddSignatureLive((newSig) => {
        console.log("Menerima tanda tangan baru dari teman:", newSig);
        setSignatures((prev) => {
          if (prev.some((s) => s.id === newSig.id)) return prev;
          return [...prev, { ...newSig, isLocked: true }];
        });
      });

      // Listener: Teman menghapus signature
      socketService.onRemoveSignatureLive((data) => {
        // Support format object {signatureId} atau string ID langsung
        const targetId = data.signatureId || data;
        setSignatures((prev) => prev.filter((s) => s.id !== targetId));
      });

      // Listener: Refresh Data Trigger
      socketService.onRefetchData(() => {
        console.log("♻️ Data berubah, memuat ulang...");
        toast("Data diperbarui oleh pengguna lain.", { icon: "🔄" });
        setRefreshKey((prev) => prev + 1);
      });
    }

    return () => {
      if (documentId) socketService.leaveRoom(documentId);
      socketService.disconnect();
    };
  }, [documentId]);

  // 4. Fetch Document Data
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDocument = async () => {
      if (!documentId || !currentUser?.id) return;

      try {
        if (refreshKey === 0) setIsLoadingDoc(true);

        const doc = await documentService.getDocumentById(documentId, { signal });
        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan.");

        setDocumentTitle(doc.title);
        setDocumentVersionId(doc.currentVersion.id);

        const isCompleted = doc.status === "completed" || doc.status === "archived";

        if (isCompleted) {
          setSignatures([]);
          setIsSignedSuccess(true);
          setCanSign(false);
        } else {
          // Mapping data dari DB ke format State
// ... di dalam useEffect fetchDocument ...

          const dbSignatures = (doc.currentVersion.signaturesGroup || []).map((sig) => ({
            id: sig.id,
            // Pastikan mengambil ID user dengan benar
            userId: sig.userId || sig.signerId || (sig.signer && sig.signer.id),
            // Ambil nama dari relasi signer yang kita include di Langkah 2
            signerName: sig.signer?.name || "User Lain",
            
            signatureImageUrl: sig.signatureImageUrl,
            pageNumber: sig.pageNumber,
            
            // [PENTING] Pastikan parse float karena kadang DB mengembalikan string
            positionX: parseFloat(sig.positionX), 
            positionY: parseFloat(sig.positionY),
            width: parseFloat(sig.width),
            height: parseFloat(sig.height),
            
            // Reset variabel display agar kotak menempel pas di koordinatnya
            x_display: 0, 
            y_display: 0, 
            width_display: 0, 
            height_display: 0,
            
            // Kunci jika ini bukan punya user yang sedang login
            isLocked: (sig.userId || sig.signerId || sig.signer?.id) !== currentUser.id,
          }));

// ...

          setSignatures((prevLocalSignatures) => {
            // Pertahankan draft lokal yang belum tersimpan (opsional, jaga-jaga race condition)
            const myDrafts = prevLocalSignatures.filter((sig) => typeof sig.id === "string" && sig.id.toString().startsWith("sig-"));
            return [...dbSignatures, ...myDrafts];
          });
        }

        // Logic Dokumen Grup vs Personal
        if (doc.groupId) {
          setIsGroupDoc(true);
          const signersList = doc.signerRequests || [];
          const myRequest = signersList.find((s) => s.userId === currentUser.id);

          if (myRequest) {
            setMySignStatus(myRequest.status);
            const currentStatus = myRequest.status ? myRequest.status.toUpperCase() : "UNKNOWN";

            if (currentStatus === "PENDING") {
              setCanSign(true);
            } else {
              setCanSign(false);
              if (currentStatus === "SIGNED" && !isCompleted && refreshKey === 0) {
                toast("Anda sudah menandatangani dokumen ini.", { icon: "✅" });
              }
            }
          } else {
            setCanSign(false);
            if (refreshKey === 0) toast("Anda dalam mode melihat (View Only).", { icon: "👀" });
          }
        } else {
          setIsGroupDoc(false);
          setCanSign(!isCompleted);
        }

        // Load PDF URL
        const isInitialLoad = refreshKey === 0;
        const isFileMissing = !pdfFile;
        if (isInitialLoad || isCompleted || isFileMissing) {
          const signedUrl = await documentService.getDocumentFileUrl(documentId, { signal });
          setPdfFile((prev) => (prev !== signedUrl ? signedUrl : prev));
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Document fetch failed:", error);
          toast.error("Gagal memuat dokumen.");
        }
      } finally {
        if (refreshKey === 0 && !signal.aborted) {
          setIsLoadingDoc(false);
        }
      }
    };

    fetchDocument();
    return () => controller.abort();
  }, [documentId, currentUser, refreshKey, navigate]);


  // --- Action Handlers (Refactored with Persistence) ---

  const handleSaveSignature = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl);
    setIsSignatureModalOpen(false);
  }, []);

  // [UPDATED] Auto Save Draft saat Drop
  const handleAddSignature = useCallback(async (newSignature) => {
    // 1. Optimistic Update (Tampilkan Segera)
    const signatureWithIdentity = {
        ...newSignature,
        signerName: currentUser.name,
        isLocked: false
    };
    setSignatures((prev) => [...prev, signatureWithIdentity]);

    try {
        // 2. Call API Save Draft (Ke Backend)
        const savedData = await signatureService.saveDraft(documentId, {
            signatureImageUrl: newSignature.signatureImageUrl,
            pageNumber: newSignature.pageNumber,
            positionX: newSignature.positionX,
            positionY: newSignature.positionY,
            width: newSignature.width,
            height: newSignature.height
        });

        // 3. Update ID Lokal dengan ID Asli Database
        const finalSignature = {
            ...signatureWithIdentity,
            id: savedData.id,
            signerName: savedData.signer?.name || currentUser.name
        };

        setSignatures((prev) => prev.map(sig => 
            sig.id === newSignature.id ? finalSignature : sig
        ));

        // 4. Emit Socket dengan ID Valid
        if (documentId) {
            socketService.emitAddSignature(documentId, finalSignature);
        }

    } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Gagal menyimpan draft.");
        // Rollback jika gagal
        setSignatures((prev) => prev.filter(sig => sig.id !== newSignature.id));
    }
  }, [documentId, currentUser]);

  // [UPDATED] Update Position (Drag/Resize)
  const handleUpdateSignature = useCallback(async (updatedSignature) => {
    // 1. Update State Lokal
    setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));

    // 2. Call API Update Position
    // Cek agar tidak mengirim update untuk ID sementara ('sig-...')
    if (!updatedSignature.id.toString().startsWith("sig-")) {
        try {
            await signatureService.updatePosition(updatedSignature.id, {
                positionX: updatedSignature.positionX,
                positionY: updatedSignature.positionY,
                width: updatedSignature.width,
                height: updatedSignature.height,
                pageNumber: updatedSignature.pageNumber
            });
        } catch (e) {
            console.error("Gagal update posisi di server:", e);
        }
    }
  }, []);

  // [UPDATED] Delete Signature
  const handleDeleteSignature = useCallback(async (signatureId) => {

    console.group("🔥 MENCARI PELAKU DELETE");
    console.log("Delete dipanggil untuk ID:", signatureId);
    console.trace("Siapa yang memanggil saya?"); // <--- INI AKAN MENUNJUKKAN FILE & BARIS PENYEBABNYA
    console.groupEnd()
    // 1. Hapus Lokal
    setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));

    // 2. Emit Socket
    if (documentId) {
      socketService.emitRemoveSignature(documentId, signatureId);
    }

    // 3. Call API Delete
    if (!signatureId.toString().startsWith("sig-")) {
        try {
            await signatureService.deleteSignature(signatureId);
        } catch (e) {
            console.error("Gagal menghapus di server:", e);
            toast.error("Gagal menghapus di server.");
        }
    }
  }, [documentId]);

  // AI Auto Tagging
  const handleAutoTag = useCallback(async () => {
    if (!documentId) return;
    if (!window.confirm("Jalankan AI Auto-Tagging?")) return;

    setIsAnalyzing(true);
    const toastId = toast.loading("🤖 AI sedang membaca dokumen...");

    try {
      const result = await signatureService.autoTagDocument(documentId);
      if (result.data && result.data.length > 0) {
        const aiSignatures = result.data.map((sig) => ({
          id: sig.id,
          pageNumber: sig.pageNumber,
          positionX: sig.positionX,
          positionY: sig.positionY,
          width: sig.width,
          height: sig.height,
          signatureImageUrl: savedSignatureUrl || null,
          type: "placeholder",
          x_display: 0, y_display: 0,
          isLocked: false,
        }));
        setSignatures((prev) => [...prev, ...aiSignatures]);
        toast.success(`Berhasil! ${result.data.length} lokasi ditemukan.`, { id: toastId });
      } else {
        toast.success("AI tidak menemukan lokasi.", { id: toastId });
      }
    } catch (error) {
      toast.error("Gagal menjalankan AI.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId, savedSignatureUrl]);

  // AI Analyze Document
  const handleAnalyzeDocument = useCallback(async () => {
    if (!documentId) return;
    setIsAnalyzing(true);
    setIsAiModalOpen(true);
    setAiData(null);
    try {
      const result = await signatureService.analyzeDocument(documentId);
      if (result?.data) setAiData(result.data);
      else throw new Error("No Data");
    } catch (error) {
      toast.error("Gagal menganalisis dokumen.");
      setIsAiModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  // Final Save (Burn to PDF)
  const handleFinalSave = useCallback(async () => {
    const myNewSignatures = signatures.filter((sig) => !sig.isLocked && sig.signatureImageUrl);

    if (myNewSignatures.length === 0) return toast.error("Silakan tempatkan tanda tangan Anda sebelum menyimpan.");

    setIsSaving(true);
    const sigToSave = myNewSignatures[0];

    const payload = {
      signatureImageUrl: sigToSave.signatureImageUrl,
      positionX: sigToSave.positionX,
      positionY: sigToSave.positionY,
      pageNumber: sigToSave.pageNumber,
      width: sigToSave.width,
      height: sigToSave.height,
      method: "canvas",
      displayQrCode: includeQrCode,
    };

    try {
      if (isGroupDoc) {
        await signatureService.addGroupSignature({ documentId: documentId, ...payload });
        setSignatures((prev) => prev.filter((s) => s.id !== sigToSave.id));
        socketService.notifyDataChanged(documentId);
        setRefreshKey((prev) => prev + 1);
        setIsSignedSuccess(true);
        toast.success("Tanda tangan berhasil disimpan! Menunggu anggota lain.");
      } else {
        await signatureService.addPersonalSignature({
          signatures: [{ documentVersionId: documentVersionId, ...payload }],
        });
        setSignatures((prev) => prev.filter((s) => s.id !== sigToSave.id));
        setIsSignedSuccess(true);
        toast.success("Dokumen berhasil ditandatangani!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal menyimpan.");
    } finally {
      setIsSaving(false);
    }
  }, [signatures, documentVersionId, documentId, navigate, includeQrCode, isGroupDoc]);

  const handleNavigateToView = () => {
    navigate(`/documents/${documentId}/view`);
  };

  // --- Return Values ---
  return {
    // Data
    currentUser,
    documentId,
    documentTitle,
    pdfFile,
    documentVersionId,
    signatures,
    savedSignatureUrl,
    aiData,
    
    // Status & Permissions
    isLoadingDoc,
    isSaving,
    isAnalyzing,
    isSignedSuccess,
    canSign,
    isGroupDoc,
    
    // UI State
    isSignatureModalOpen,
    isSidebarOpen,
    isAiModalOpen,
    includeQrCode,
    isLandscape,
    isPortrait,
    
    // Setters (Untuk UI Toggles)
    setIsSignatureModalOpen,
    setIsSidebarOpen,
    setIncludeQrCode,
    setIsAiModalOpen,
    setSavedSignatureUrl,
    
    // Handlers
    handleSaveSignature,
    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleAutoTag,
    handleAnalyzeDocument,
    handleFinalSave,
    handleNavigateToView,
    
    // Utils
    toggleSidebar: () => setIsSidebarOpen(prev => !prev),
  };
};