import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

import { groupSignatureService } from "../services/groupSignatureService";
import { documentService } from "../services/documentService";
import { socketService } from "../services/socketService";
import { userService } from "../services/userService";

// Utility untuk generate ID sementara
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

export const useSignatureManagerGroup = ({
  documentId,
  documentVersionId,
  currentUser,
  refreshKey,
  onRefreshRequest,
}) => {
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  const onRefreshRequestRef = useRef(onRefreshRequest);
  const deletedSignaturesRef = useRef(new Set());
  const pendingCreationIds = useRef(new Set());
  const pendingUpdates = useRef(new Map());
  const isSocketInitialized = useRef(null); 
  const userIdRef = useRef(currentUser?.id);
  
  // Ref untuk melacak draft aktif (untuk cleanup darurat)
  const myDraftIdRef = useRef(null);

  // Update ref saat prop berubah
  useEffect(() => {
    onRefreshRequestRef.current = onRefreshRequest;
  }, [onRefreshRequest]);

  // Sync myDraftIdRef
  useEffect(() => {
    if (!currentUser) return;
    const myDraft = signatures.find(
      (s) => String(s.userId) === String(currentUser.id) && s.status === "draft"
    );
    myDraftIdRef.current = myDraft ? myDraft.id : null;
  }, [signatures, currentUser]);

  // --- 1. CEK SESI USER ---
  useEffect(() => {
    const verifySession = async () => {
      if (currentUser && documentId) {
        try {
          console.log("🔍 [Hook] Verifikasi Sesi User...");
          await userService.getMyProfile(); 
          console.log("✅ [Hook] Sesi Valid.");
          setIsAuthVerified(true);
        } catch (error) {
          console.error("❌ [Hook] Sesi Group invalid:", error);
          if (error.response?.status === 401) {
            setIsAuthVerified(false);
          }
        }
      }
    };
    verifySession();
  }, [currentUser, documentId]);

  // --- 2. LOAD INITIAL DATA & AUTO-CLEANUP STALE DRAFTS ---
  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        let sourceSignatures = [
          ...(doc.currentVersion.signaturesGroup || []),
          ...(doc.currentVersion.signaturesPersonal || []),
        ];

        // 🔥 [FIX UTAMA: AUTO-DELETE STALE DRAFT SAAT MASUK]
        // Cek apakah ada draft milik user ini di DB? Jika ada, itu pasti "Zombie" dari sesi sebelumnya.
        // Kita hapus DULU sebelum render, supaya user dapat canvas bersih.
        const myStaleDraft = sourceSignatures.find(
            (s) => String(s.userId || s.signerId) === String(currentUser.id) && s.status === "draft"
        );

        if (myStaleDraft) {
            console.log(`🧹 [Auto-Cleanup] Menemukan draft usang (Zombie) ID: ${myStaleDraft.id}. Menghapus otomatis...`);
            
            // 1. Panggil API Delete (Fire and forget agar loading cepat, atau await jika mau strict)
            try {
                await groupSignatureService.deleteDraft(myStaleDraft.id);
                console.log("✅ [Auto-Cleanup] Draft usang berhasil dihapus dari DB.");
            } catch (err) {
                console.warn("⚠️ [Auto-Cleanup] Gagal menghapus draft usang:", err);
            }

            // 2. Filter keluar dari sourceSignatures agar tidak muncul di layar (Ghosting)
            sourceSignatures = sourceSignatures.filter(s => s.id !== myStaleDraft.id);
            
            // 3. Emit socket remove (opsional, untuk memastikan client lain update)
            // (Kita lakukan nanti setelah socket connect, atau biarkan sinkronisasi alamiah)
        }
        // 🔥 [END FIX]

        // Normalisasi Data
        const dbSignatures = sourceSignatures.map((sig) => ({
          id: sig.id,
          userId: String(sig.userId || sig.signerId || sig.signer?.id),
          signerName: sig.signer?.name || "User Lain",
          signatureImageUrl: sig.signatureImageUrl,
          pageNumber: sig.pageNumber,
          positionX: parseFloat(sig.positionX),
          positionY: parseFloat(sig.positionY),
          width: parseFloat(sig.width),
          height: parseFloat(sig.height),
          status: sig.status || "final",
          isLocked: String(sig.userId) !== String(currentUser.id),
        }));

        setSignatures((prev) => {
          const map = new Map();

          // 1. Data Final
          dbSignatures
            .filter((s) => s.status === "final")
            .forEach((sig) => {
              if (!deletedSignaturesRef.current.has(sig.id)) {
                map.set(sig.userId, sig);
              }
            });

          // 2. Data Draft (Milik ORANG LAIN saja, karena milik sendiri sudah dibersihkan di atas)
          dbSignatures
            .filter((s) => s.status === "draft")
            .forEach((sig) => {
              if (deletedSignaturesRef.current.has(sig.id)) return;
              if (!map.has(sig.userId)) {
                map.set(sig.userId, sig);
              }
            });

          // 3. Local State
          prev.forEach((local) => {
            if (deletedSignaturesRef.current.has(local.id)) return;
            if (!map.has(local.userId)) {
              map.set(local.userId, { ...local, status: "draft" });
            } else {
              if (String(local.userId) === String(currentUser.id)) {
                const dbItem = map.get(local.userId);
                map.set(local.userId, { ...dbItem, ...local });
              }
            }
          });

          return Array.from(map.values());
        });
      } catch (e) {
        console.error("Failed to load group signatures:", e);
      }
    };

    loadInitialSignatures();
  }, [documentId, currentUser, refreshKey]);

  // --- 3. SOCKET LOGIC ---
  useEffect(() => {
    userIdRef.current = currentUser?.id;
  }, [currentUser]);

  useEffect(() => {
    if (!documentId || !isAuthVerified) return;

    if (isSocketInitialized.current === documentId) {
      return; 
    }

    console.log("🚀 [Hook] Menginisialisasi Socket Service (HANYA SEKALI)...");
    isSocketInitialized.current = documentId;

    const socket = socketService.connect();

    const handleConnect = () => {
        console.log("♻️ [Hook] Socket Connected/Reconnected, Joining Room:", documentId);
        socketService.joinRoom(documentId);
    };

    if (socket.connected) {
        handleConnect();
    }
    socketService.on("connect", handleConnect);

    // --- EVENT HANDLERS ---
    
    const handleAddLive = (newSig) => {
      const incomingUserId = String(newSig.userId || newSig.signerId || "");
      const myCurrentId = String(userIdRef.current || "");

      if (incomingUserId === myCurrentId) return;

      console.log("📥 [Socket] Terima Signature Baru dari Teman:", newSig);

      setSignatures((prev) => {
        const exists = prev.find((s) => s.id === newSig.id);
        if (exists) return prev;
        
        const hasFinal = prev.some(
          (s) => String(s.userId) === incomingUserId && s.status === "final"
        );
        if (hasFinal) return prev;

        if (deletedSignaturesRef.current.has(newSig.id)) return prev;

        const cleanPrev = prev.filter((s) => String(s.userId) !== incomingUserId);

        toast(`${newSig.signerName || "User lain"} sedang menandatangani...`, {
          icon: "✏️",
          id: "sig-toast",
        });
        return [...cleanPrev, { ...newSig, status: "draft", isLocked: true }];
      });
    };

    const handleRemoveLive = (signatureId) => {
      console.log(`🗑️ [Socket] User lain menghapus signature ID: ${signatureId}`);
      setSignatures((prev) => prev.filter((s) => s.id !== signatureId));
    };

    const handlePositionUpdate = (data) => {
      setSignatures((prev) =>
        prev.map((s) => (s.id === data.signatureId ? { ...s, ...data } : s))
      );
    };

    const handleRefetch = () => {
      console.log("🔄 [Socket] Server meminta Refetch Data");
      if (onRefreshRequestRef.current) onRefreshRequestRef.current();
    };

    socketService.onPositionUpdate(handlePositionUpdate);
    socketService.onAddSignatureLive(handleAddLive);
    socketService.onRemoveSignatureLive(handleRemoveLive);
    socketService.onRefetchData(handleRefetch);

    return () => {
      console.log("🛑 [Hook] Cleanup Socket Listeners (Unmount)");
      socketService.off("connect", handleConnect);
      socketService.off("update_signature_position", handlePositionUpdate);
      socketService.off("add_signature_live", handleAddLive);
      socketService.off("remove_signature_live", handleRemoveLive);
      socketService.off("refetch_data", handleRefetch);
      
      socketService.leaveRoom(documentId);
      isSocketInitialized.current = null;

      // Kita tetap pertahankan cleanup ini sebagai 'best effort'
      // Tapi fix utamanya ada di LOAD INITIAL DATA di atas.
      if (myDraftIdRef.current) {
        const draftId = myDraftIdRef.current;
        console.log(`🧹 [Exit Cleanup] Mencoba hapus draft ID: ${draftId} saat exit.`);
        groupSignatureService.deleteDraft(draftId).catch(() => {}); 
      }
    };
  }, [documentId, isAuthVerified]);

  // --- 4. ACTION HANDLERS (CRUD) ---

  const handleUpdateSignature = useCallback((updatedSignature) => {
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig))
    );

    if (pendingCreationIds.current.has(updatedSignature.id)) {
      console.log(`⏳ [QUEUE] Update posisi ditahan ID ${updatedSignature.id}.`);
      pendingUpdates.current.set(updatedSignature.id, updatedSignature);
      return;
    }

    groupSignatureService
      .updateDraftPosition(updatedSignature.id, {
        positionX: updatedSignature.positionX,
        positionY: updatedSignature.positionY,
        width: updatedSignature.width,
        height: updatedSignature.height,
        pageNumber: updatedSignature.pageNumber,
      })
      .catch(() => {});
  }, []);

  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      setIsSaving(true);
      const fixedId = generateUUID(); 

      pendingCreationIds.current.add(fixedId);

      const newSignature = {
        ...signatureData,
        id: fixedId,
        documentId,
        documentVersionId,
        userId: currentUser.id,
        signerName: currentUser.name,
        signatureImageUrl: savedSignatureUrl,
        isLocked: false,
        isTemp: false,
        status: "draft",
      };

      setSignatures((prev) => [...prev, newSignature]);

      console.log(`✨ [Socket] Emit Add Signature ke Room: ${documentId}`);
      socketService.emitAddSignature(documentId, { ...newSignature, isLocked: true });

      try {
        console.log(`💾 [API] Saving Draft ${fixedId}...`);
        await groupSignatureService.saveDraft(documentId, newSignature);
        console.log(`✅ [API] Draft ${fixedId} Saved.`);

        pendingCreationIds.current.delete(fixedId);

        if (pendingUpdates.current.has(fixedId)) {
          const latestData = pendingUpdates.current.get(fixedId);
          handleUpdateSignature(latestData);
          pendingUpdates.current.delete(fixedId);
        }
      } catch (error) {
        console.error("Save Draft Failed:", error);
        toast.error("Gagal menyimpan draft.");

        setSignatures((prev) => prev.filter((s) => s.id !== fixedId));
        socketService.emitRemoveSignature(documentId, fixedId);

        pendingCreationIds.current.delete(fixedId);
        pendingUpdates.current.delete(fixedId);
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, documentVersionId, currentUser, handleUpdateSignature]
  );

  const handleDeleteSignature = useCallback(
    async (signatureId) => {
      console.log(`❌ [DELETE] Menghapus ID: ${signatureId}`);
      deletedSignaturesRef.current.add(signatureId);

      setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
      socketService.emitRemoveSignature(documentId, signatureId);

      try {
        await groupSignatureService.deleteDraft(signatureId);
      } catch (e) {
        console.error("Gagal delete di server", e);
      }
    },
    [documentId]
  );

  const handleFinalSave = useCallback(
    async (includeQrCode) => {
      const myDraft = signatures.find(
        (sig) => String(sig.userId) === String(currentUser.id)
      );

      if (!myDraft) throw new Error("Tanda tangan Anda belum ditempatkan.");

      setIsSaving(true);

      try {
        const payload = {
          id: myDraft.id,
          signatureImageUrl: myDraft.signatureImageUrl,
          positionX: myDraft.positionX,
          positionY: myDraft.positionY,
          pageNumber: myDraft.pageNumber,
          width: myDraft.width,
          height: myDraft.height,
          method: "canvas",
        };

        await groupSignatureService.signDocument(documentId, payload);
        
        socketService.notifyDataChanged(documentId);

        setSignatures((prev) => prev.filter((s) => s.id !== myDraft.id));
      } catch (error) {
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [signatures, documentId, currentUser.id]
  );

  return {
    signatures,
    setSignatures,
    isSaving,
    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleFinalSave,
  };
};