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
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
};

export const useSignatureManagerGroup = ({ documentId, documentVersionId, currentUser, refreshKey, onRefreshRequest }) => {
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
    const myDraft = signatures.find((s) => String(s.userId) === String(currentUser.id) && s.status === "draft");
    myDraftIdRef.current = myDraft ? myDraft.id : null;
  }, [signatures, currentUser]);

  // --- 1. CEK SESI USER ---
  useEffect(() => {
    const verifySession = async () => {
      if (currentUser && documentId) {
        try {
          // Hanya cek ringan untuk memastikan token valid
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

        let sourceSignatures = [...(doc.currentVersion.signaturesGroup || []), ...(doc.currentVersion.signaturesPersonal || [])];

        // [PERBAIKAN] Sortir berdasarkan created_at descending (terbaru diatas)
        // Ini mencegah pengambilan draft "hantu" (draft lama yang tidak sengaja tersisa)
        sourceSignatures.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));

        // Normalisasi Data
        const dbSignatures = sourceSignatures.map((sig) => ({
          id: sig.id,
          userId: String(sig.userId || sig.signerId || sig.signer?.id),
          signerName: sig.signer?.name || "User Lain",
          signatureImageUrl: sig.signatureImageUrl,
          pageNumber: parseInt(sig.pageNumber || 1),
          positionX: parseFloat(sig.positionX || 0),
          positionY: parseFloat(sig.positionY || 0),
          width: parseFloat(sig.width || 100),
          height: parseFloat(sig.height || 50),
          status: sig.status || "final",
          createdAt: sig.createdAt, // Bawa field ini untuk debug
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

          // 2. Data Draft (Ambil draft TERBARU untuk setiap user)
          dbSignatures
            .filter((s) => s.status === "draft")
            .forEach((sig) => {
              if (deletedSignaturesRef.current.has(sig.id)) return;
              
              // Karena sudah disort descending, yang pertama masuk map adalah yang terbaru
              if (!map.has(sig.userId)) {
                map.set(sig.userId, sig);
              }
            });

          // 3. Local State (Merge dengan DB data)
          prev.forEach((local) => {
            if (deletedSignaturesRef.current.has(local.id)) return;
            
            // Logika merge: Jika di local ada draft user sendiri, pertahankan posisi local
            // karena user mungkin baru saja geser-geser sebelum refresh selesai/API update
            if (String(local.userId) === String(currentUser.id)) {
                const dbItem = map.get(local.userId);
                // Jika di DB ada, merge. Jika tidak, pakai local (kasus belum tersimpan)
                map.set(local.userId, {
                    ...(dbItem || {}),
                    ...local,
                    isLocked: false,
                    status: "draft"
                });
            } else if (!map.has(local.userId)) {
                // User lain yang ada di socket tapi belum masuk DB fetch
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

  // --- 3. SOCKET LOGIC (Sama seperti sebelumnya) ---
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

      setTimeout(() => {
        setSignatures((prev) => {
          const exists = prev.find((s) => s.id === newSig.id);
          if (exists) return prev;
          const hasFinal = prev.some((s) => String(s.userId) === incomingUserId && s.status === "final");
          if (hasFinal) return prev;
          if (deletedSignaturesRef.current.has(newSig.id)) return prev;

          // Hapus draft lama user tersebut jika ada (visual cleanup)
          const cleanPrev = prev.filter((s) => String(s.userId) !== incomingUserId);
          return [...cleanPrev, { ...newSig, status: "draft", isLocked: true }];
        });
        toast(`${newSig.signerName || "User lain"} sedang menandatangani...`, { icon: "✏️", id: "sig-toast" });
      }, 0);
    };

    const handleRemoveLive = (signatureId) => {
      setTimeout(() => setSignatures((prev) => prev.filter((s) => s.id !== signatureId)), 0);
    };

    const handlePositionUpdate = (data) => {
      setTimeout(() => setSignatures((prev) => prev.map((s) => (s.id === data.signatureId ? { ...s, ...data } : s))), 0);
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

  // --- 4. ACTION HANDLERS (CRUD) ---

  const handleUpdateSignature = useCallback((updatedSignature) => {
    setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));

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
      .catch((e) => console.error("Update pos failed silent:", e));
  }, []);

  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      setIsSaving(true);
      const fixedId = generateUUID(); // ID Sementara Client-Side

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
        // Simpan ke DB. Backend mungkin akan generate ID baru atau pakai fixedId.
        // Jika backend generate ID baru, data di DB akan beda ID dengan state local saat ini.
        // Tapi setelah refresh, ID akan sinkron dengan DB.
        await groupSignatureService.saveDraft(documentId, newSignature);
        
        pendingCreationIds.current.delete(fixedId);

        // Jika ada pergerakan saat sedang saving awal
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
      } catch (e) { console.error("Gagal delete di server", e); }
    },
    [documentId]
  );

  const handleFinalSave = useCallback(
    async (includeQrCode) => {
      // Cari draft milik user saat ini
      const myDraft = signatures.find((sig) => String(sig.userId) === String(currentUser.id));

      if (!myDraft) throw new Error("Tanda tangan Anda belum ditempatkan.");

      if (!myDraft.signatureImageUrl) {
        throw new Error("Gambar tanda tangan hilang. Harap hapus dan tempatkan ulang.");
      }

      setIsSaving(true);
      console.log("💾 [FINAL SAVE] Memulai proses finalisasi...", myDraft);

      try {
        const payload = {
          id: myDraft.id, // ID ini harus match dengan yang ada di DB
          signatureImageUrl: myDraft.signatureImageUrl,
          positionX: parseFloat(myDraft.positionX), // Pastikan float
          positionY: parseFloat(myDraft.positionY),
          pageNumber: parseInt(myDraft.pageNumber),
          width: parseFloat(myDraft.width),
          height: parseFloat(myDraft.height),
          method: "canvas",
        };

        console.log("📤 Payload dikirim ke API:", payload);

        await groupSignatureService.signDocument(documentId, payload);

        console.log("✅ Finalisasi Berhasil");
        socketService.notifyDataChanged(documentId);
        setSignatures((prev) => prev.filter((s) => s.id !== myDraft.id));
      } catch (error) {
        console.error("❌ [FINAL SAVE ERROR]:", error.response?.data || error.message);
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