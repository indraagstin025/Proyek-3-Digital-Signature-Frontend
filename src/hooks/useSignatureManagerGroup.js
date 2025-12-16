import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { signatureService } from "../services/signatureService";
import { documentService } from "../services/documentService";
import { socketService } from "../services/socketService";
import { userService } from "../services/userService";

// Helper Generate UUID Client-Side
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
  onRefreshRequest 
}) => {
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  const onRefreshRequestRef = useRef(onRefreshRequest);
  
  // Refs untuk manajemen state & race conditions
  const deletedSignaturesRef = useRef(new Set());
  const pendingCreationIds = useRef(new Set()); // ID yang sedang proses saveDraft
  const pendingUpdates = useRef(new Map());     // Update posisi yang tertunda

  useEffect(() => {
    onRefreshRequestRef.current = onRefreshRequest;
  }, [onRefreshRequest]);

  // 1. Verifikasi Auth
  useEffect(() => {
    const verifySession = async () => {
      if (currentUser && documentId) {
        try {
          await userService.getMyProfile();
          setIsAuthVerified(true);
        } catch (error) {
          console.error("❌ Sesi Group invalid:", error);
          setIsAuthVerified(false);
        }
      }
    };
    verifySession();
  }, [currentUser, documentId]);

  // =====================================================================
  // 2. LOAD & MERGE STRATEGY (SOLUSI 1: STATUS BASED PRIORITY)
  // =====================================================================
  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        const sourceSignatures = [
            ...(doc.currentVersion.signaturesGroup || []), 
            ...(doc.currentVersion.signaturesPersonal || [])
        ];

        // A. Normalisasi Data DB
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
            // 🔥 DEFAULT ke FINAL jika null (Backward Compatibility)
            status: sig.status || "final", 
            isLocked: String(sig.userId) !== String(currentUser.id),
        }));

        setSignatures((prev) => {
            const map = new Map();

            // 1️⃣ FINAL SIGNATURE (DB) → Prioritas Mutlak
            dbSignatures
                .filter(s => s.status === "final")
                .forEach(sig => {
                     // Kunci Map menggunakan UserID. Satu user = satu signature final.
                     if (!deletedSignaturesRef.current.has(sig.id)) {
                         map.set(sig.userId, sig);
                     }
                });

            // 2️⃣ DRAFT SIGNATURE (DB) → Hanya jika belum ada FINAL
            dbSignatures
                .filter(s => s.status === "draft")
                .forEach(sig => {
                    if (deletedSignaturesRef.current.has(sig.id)) return;
                    
                    // Jika user ini belum punya final, masukkan draft DB
                    if (!map.has(sig.userId)) {
                        map.set(sig.userId, sig);
                    }
                });

            // 3️⃣ DRAFT LOKAL/SOCKET (Optimistic UI)
            prev.forEach(local => {
                if (deletedSignaturesRef.current.has(local.id)) return;

                // Jika user ini belum punya Final DAN belum punya Draft DB
                // Berarti ini draft lokal yang valid (sedang digeser/dibuat)
                if (!map.has(local.userId)) {
                     // Paksa status local jadi 'draft'
                     map.set(local.userId, { ...local, status: 'draft' });
                } else {
                    // Jika data DB sudah ada, tapi ini data SAYA sendiri yang sedang saya edit
                    // Kita pertahankan lokal agar tidak "lompat" saat drag
                    if (String(local.userId) === String(currentUser.id)) {
                        const dbItem = map.get(local.userId);
                        // Merge: Data DB + Posisi Lokal Terbaru
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

  // =====================================================================
  // 3. SOCKET LOGIC (SOLUSI 3: SOCKET DISCIPLINE)
  // =====================================================================
  useEffect(() => {
    if (!documentId || !isAuthVerified) return;

    socketService.connect();
    socketService.joinRoom(documentId);

    const handleAddLive = (newSig) => {
      const incomingUserId = String(newSig.userId || newSig.signerId || "");
      const myCurrentId = String(currentUser.id || "");

      // 1. Ignore Self Echo
      if (incomingUserId === myCurrentId) return;

      setSignatures((prev) => {
        // 2. Cek apakah user ini SUDAH punya FINAL signature di layar?
        const hasFinal = prev.some(s => String(s.userId) === incomingUserId && s.status === 'final');
        
        // Jika user itu sudah final, jangan terima draft socket lagi (cegah duplikat hantu)
        if (hasFinal) return prev;

        // 3. Cek Blacklist
        if (deletedSignaturesRef.current.has(newSig.id)) return prev;

        // 4. Clean Draft Lama User Tersebut (Replace logic)
        // Hapus draft lama user ini agar tidak menumpuk, lalu masukkan yang baru
        const cleanPrev = prev.filter(s => String(s.userId) !== incomingUserId);

        toast(`${newSig.signerName || "User lain"} sedang menandatangani...`, { icon: "✏️" });
        return [...cleanPrev, { ...newSig, status: 'draft', isLocked: true }];
      });
    };

    const handleRemoveLive = (signatureId) => {
      setSignatures((prev) => prev.filter((s) => s.id !== signatureId));
    };

    const handlePositionUpdate = (data) => {
      setSignatures((prev) => prev.map((s) => (s.id === data.signatureId ? { ...s, ...data } : s)));
    };

    // 🔥 Trigger Refetch dari DB saat ada user yang Final Save
    const handleRefetch = () => {
      if (onRefreshRequestRef.current) onRefreshRequestRef.current();
    };

    socketService.onPositionUpdate(handlePositionUpdate);
    socketService.onAddSignatureLive(handleAddLive);
    socketService.onRemoveSignatureLive(handleRemoveLive);
    socketService.onRefetchData(handleRefetch);

    return () => {
      socketService.off("update_signature_position", handlePositionUpdate);
      socketService.off("add_signature_live", handleAddLive);
      socketService.off("remove_signature_live", handleRemoveLive);
      socketService.off("refetch_data", handleRefetch);
      socketService.leaveRoom(documentId);
    };
  }, [documentId, isAuthVerified, currentUser.id]);

  // =====================================================================
  // 4. HANDLERS (DRAFT & FINAL)
  // =====================================================================

  const handleUpdateSignature = useCallback((updatedSignature) => {
    setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));

    // Logic Queue untuk mencegah 404 pada Drag Cepat
    if (pendingCreationIds.current.has(updatedSignature.id)) {
      console.log(`⏳ [QUEUE] Update posisi ditahan karena ID ${updatedSignature.id} sedang dibuat.`);
      pendingUpdates.current.set(updatedSignature.id, updatedSignature);
      return;
    }

    signatureService
      .updatePosition(updatedSignature.id, {
        positionX: updatedSignature.positionX,
        positionY: updatedSignature.positionY,
        width: updatedSignature.width,
        height: updatedSignature.height,
        pageNumber: updatedSignature.pageNumber,
      })
      .catch((err) => {
         // Silent fail (handled by service warning)
      });
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
        status: "draft", // 🔥 Explicitly set Draft
      };

      // Optimistic UI
      setSignatures((prev) => [...prev, newSignature]);
      socketService.emitAddSignature(documentId, { ...newSignature, isLocked: true });

      try {
        console.log(`💾 [API] Saving Draft ${fixedId}...`);
        await signatureService.saveDraft(documentId, newSignature, true, includeQrCode);
        console.log(`✅ [API] Draft ${fixedId} Saved.`);

        pendingCreationIds.current.delete(fixedId);

        // Eksekusi antrean update jika user menggeser saat loading
        if (pendingUpdates.current.has(fixedId)) {
          const latestData = pendingUpdates.current.get(fixedId);
          console.log(`🚀 [QUEUE] Mengeksekusi update tertunda untuk ${fixedId}`);
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
        await signatureService.deleteSignature(signatureId);
      } catch (e) {
        console.error("Gagal delete di server", e);
      }
    },
    [documentId]
  );

  const handleFinalSave = useCallback(
    async (includeQrCode) => {
      // Cari draft milik user ini
      const myDraft = signatures.find((sig) => String(sig.userId) === String(currentUser.id));
      
      // Jika tidak ada draft, cek apakah mungkin sudah final?
      // Tapi logic UI biasanya tombol save hanya aktif jika ada draft.
      if (!myDraft) throw new Error("Tanda tangan Anda belum ditempatkan.");

      setIsSaving(true);

      try {
        const payload = {
          signatureImageUrl: myDraft.signatureImageUrl,
          positionX: myDraft.positionX,
          positionY: myDraft.positionY,
          pageNumber: myDraft.pageNumber,
          width: myDraft.width,
          height: myDraft.height,
          method: "canvas",
          displayQrCode: includeQrCode,
          userId: currentUser.id // Kirim userId untuk backend cleanup
        };

        // 1. Simpan Final (Backend akan menghapus draft)
        await signatureService.addGroupSignature({ documentId, ...payload });
        
        // 2. Notifikasi Global (Memicu Refetch di semua client)
        socketService.notifyDataChanged(documentId);
        
        // 3. Hapus Draft Lokal (Karena akan digantikan oleh Final dari DB saat Refetch)
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