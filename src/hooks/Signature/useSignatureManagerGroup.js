/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

import { groupSignatureService } from "../../services/groupSignatureService";
import { documentService } from "../../services/documentService";
import { socketService } from "../../services/socketService";
import { userService } from "../../services/userService";

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

  // Ref untuk melacak draft aktif
  const myDraftIdRef = useRef(null);

  useEffect(() => {
    onRefreshRequestRef.current = onRefreshRequest;
  }, [onRefreshRequest]);

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
          await userService.getMyProfile();
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

  // --- 2. LOAD INITIAL DATA ---
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

        // [PERBAIKAN 1] HAPUS LOGIKA 'AUTO-DELETE'.
        // Jangan hapus draft saat load! Kita justru ingin memuatnya kembali.
        
        // [PERBAIKAN 2] SORTING DRAFT TERBARU
        // Pastikan kita mengambil draft paling baru jika ada duplikat di DB
        sourceSignatures.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));

        // Normalisasi Data
        const dbSignatures = sourceSignatures.map((sig) => ({
          id: sig.id,
          userId: String(sig.userId || sig.signerId || sig.signer?.id),
          signerName: sig.signer?.name || "User Lain",
          signatureImageUrl: sig.signatureImageUrl,
          pageNumber: parseInt(sig.pageNumber || 1),
          positionX: parseFloat(sig.positionX),
          positionY: parseFloat(sig.positionY),
          width: parseFloat(sig.width),
          height: parseFloat(sig.height),
          status: sig.status || "final",
          // [PENTING] Draft milik sendiri JANGAN di-lock, supaya bisa diedit/dihapus/disimpan setelah refresh
          isLocked: String(sig.userId) !== String(currentUser.id) || sig.status === "final",
        }));

        setSignatures((prev) => {
          const map = new Map();

          // 1. Data Final (Prioritas Utama)
          dbSignatures
            .filter((s) => s.status === "final")
            .forEach((sig) => {
              if (!deletedSignaturesRef.current.has(sig.id)) {
                map.set(sig.userId, sig);
              }
            });

          // 2. Data Draft
          dbSignatures
            .filter((s) => s.status === "draft")
            .forEach((sig) => {
              if (deletedSignaturesRef.current.has(sig.id)) return;
              
              // Ambil draft pertama (terbaru) per user
              if (!map.has(sig.userId)) {
                map.set(sig.userId, sig);
              }
            });

          // 3. Local State (Merge)
          prev.forEach((local) => {
            if (deletedSignaturesRef.current.has(local.id)) return;
            
            if (String(local.userId) === String(currentUser.id)) {
                // Merge data lokal dengan DB agar transisi mulus
                const dbItem = map.get(local.userId);
                map.set(local.userId, { 
                    ...(dbItem || {}), 
                    ...local, 
                    isLocked: false, 
                    status: "draft" 
                });
            } else if (!map.has(local.userId)) {
                map.set(local.userId, { ...local, status: "draft" });
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

    if (isSocketInitialized.current === documentId) return;

    console.log("🚀 [Hook] Menginisialisasi Socket Service...");
    isSocketInitialized.current = documentId;
    const socket = socketService.connect();

    const handleConnect = () => {
        socketService.joinRoom(documentId);
    };

    if (socket.connected) handleConnect();
    socketService.on("connect", handleConnect);

    const handleAddLive = (newSig) => {
      const incomingUserId = String(newSig.userId || newSig.signerId || "");
      const myCurrentId = String(userIdRef.current || "");

      if (incomingUserId === myCurrentId) return;

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
      setSignatures((prev) => prev.filter((s) => s.id !== signatureId));
    };

    const handlePositionUpdate = (data) => {
      setSignatures((prev) =>
        prev.map((s) => (s.id === data.signatureId ? { ...s, ...data } : s))
      );
    };

    const handleRefetch = () => {
      if (onRefreshRequestRef.current) onRefreshRequestRef.current();
    };

    socketService.onPositionUpdate(handlePositionUpdate);
    socketService.onAddSignatureLive(handleAddLive);
    socketService.onRemoveSignatureLive(handleRemoveLive);
    socketService.onRefetchData(handleRefetch);

    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("update_signature_position", handlePositionUpdate);
      socketService.off("add_signature_live", handleAddLive);
      socketService.off("remove_signature_live", handleRemoveLive);
      socketService.off("refetch_data", handleRefetch);
      socketService.leaveRoom(documentId);
      isSocketInitialized.current = null;
    };
  }, [documentId, isAuthVerified]);

  // --- 4. ACTION HANDLERS ---

  const handleUpdateSignature = useCallback((updatedSignature) => {
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig))
    );

    if (pendingCreationIds.current.has(updatedSignature.id)) {
      pendingUpdates.current.set(updatedSignature.id, updatedSignature);
      return;
    }

    groupSignatureService
      .updateDraftPosition(updatedSignature.id, {
        positionX: parseFloat(updatedSignature.positionX),
        positionY: parseFloat(updatedSignature.positionY),
        width: parseFloat(updatedSignature.width),
        height: parseFloat(updatedSignature.height),
        pageNumber: parseInt(updatedSignature.pageNumber),
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
      socketService.emitAddSignature(documentId, { ...newSignature, isLocked: true });

      try {
        await groupSignatureService.saveDraft(documentId, newSignature);
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
        // [FIX] Pastikan payload menggunakan tipe data yang benar (Float/Int)
        const payload = {
          id: myDraft.id,
          signatureImageUrl: myDraft.signatureImageUrl,
          positionX: parseFloat(myDraft.positionX),
          positionY: parseFloat(myDraft.positionY),
          pageNumber: parseInt(myDraft.pageNumber),
          width: parseFloat(myDraft.width),
          height: parseFloat(myDraft.height),
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