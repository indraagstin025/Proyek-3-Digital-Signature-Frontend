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

  // Update ref saat prop berubah
  useEffect(() => {
    onRefreshRequestRef.current = onRefreshRequest;
  }, [onRefreshRequest]);

  // --- 1. CEK SESI USER ---
  useEffect(() => {
    const verifySession = async () => {
      if (currentUser && documentId) {
        try {
          console.log("🔍 [Hook] Verifikasi Sesi User...");
          await userService.getMyProfile(); // Pastikan token valid
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

  // --- 2. LOAD INITIAL DATA ---
  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        // Jika dokumen sudah selesai/arsip, kosongkan signature editor
        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        // Gabungkan signature group & personal
        const sourceSignatures = [
          ...(doc.currentVersion.signaturesGroup || []),
          ...(doc.currentVersion.signaturesPersonal || []),
        ];

        // Normalisasi Data dari DB ke Format Frontend
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
          // Lock jika bukan milik user yang sedang login
          isLocked: String(sig.userId) !== String(currentUser.id),
        }));

        // Logika Merge DB dengan Local State (Optimistic)
        setSignatures((prev) => {
          const map = new Map();

          // 1. Prioritas: Data Final dari DB
          dbSignatures
            .filter((s) => s.status === "final")
            .forEach((sig) => {
              if (!deletedSignaturesRef.current.has(sig.id)) {
                map.set(sig.userId, sig);
              }
            });

          // 2. Data Draft dari DB
          dbSignatures
            .filter((s) => s.status === "draft")
            .forEach((sig) => {
              if (deletedSignaturesRef.current.has(sig.id)) return;
              if (!map.has(sig.userId)) {
                map.set(sig.userId, sig);
              }
            });

          // 3. Local State (Yang sedang digeser/diedit user)
          prev.forEach((local) => {
            if (deletedSignaturesRef.current.has(local.id)) return;

            if (!map.has(local.userId)) {
              // Jika belum ada di DB, pakai local
              map.set(local.userId, { ...local, status: "draft" });
            } else {
              // Jika milik sendiri, pertahankan posisi local (biar smooth saat drag)
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

  // --- 3. SOCKET LOGIC (VERSI STABIL & FIX LOGS) ---
  useEffect(() => {
    if (!documentId || !isAuthVerified) return;

    console.log("🚀 [Hook] Menginisialisasi Socket Service...");
    const socket = socketService.connect();

    // Handler Koneksi
    const handleConnect = () => {
      console.log("♻️ [Hook] Socket Connected/Reconnected, Joining Room:", documentId);
      socketService.joinRoom(documentId);
    };

    if (socket.connected) {
      handleConnect();
    }
    socketService.on("connect", handleConnect);

    // --- EVENT HANDLERS ---

    // 1. Handle User Lain Menambah Signature
    const handleAddLive = (newSig) => {
      const incomingUserId = String(newSig.userId || newSig.signerId || "");
      const myCurrentId = String(currentUser.id || "");

      // [PENTING] FILTER: Abaikan jika data berasal dari DIRI SENDIRI
      // Karena kita sudah punya datanya via Optimistic UI (handleAddSignature)
      if (incomingUserId === myCurrentId) return;

      console.log("📥 [Socket] Terima Signature Baru dari Teman:", newSig);
      console.log(`👤 [Socket] User lain (${newSig.signerName}) menambah signature.`);

      setSignatures((prev) => {
        // Cek duplikasi ID
        const exists = prev.find((s) => s.id === newSig.id);
        if (exists) return prev;
        
        // Cek jika user ini sudah punya final signature (cegah tumpuk)
        const hasFinal = prev.some(
          (s) => String(s.userId) === incomingUserId && s.status === "final"
        );
        if (hasFinal) return prev;

        // Cek jika kita barusan menghapus signature ini
        if (deletedSignaturesRef.current.has(newSig.id)) return prev;

        // Bersihkan data lama user tersebut (jika ada draft sebelumnya)
        const cleanPrev = prev.filter((s) => String(s.userId) !== incomingUserId);

        toast(`${newSig.signerName || "User lain"} sedang menandatangani...`, {
          icon: "✏️",
          id: "sig-toast",
        });

        return [...cleanPrev, { ...newSig, status: "draft", isLocked: true }];
      });
    };

    // 2. Handle User Lain Menghapus Signature
    const handleRemoveLive = (signatureId) => {
      console.log(`🗑️ [Socket] User lain menghapus signature ID: ${signatureId}`);
      setSignatures((prev) => prev.filter((s) => s.id !== signatureId));
    };

    // 3. Handle User Lain Menggeser Posisi
    const handlePositionUpdate = (data) => {
      // Tidak perlu log verbose di sini agar console tidak spam saat drag
      setSignatures((prev) =>
        prev.map((s) => (s.id === data.signatureId ? { ...s, ...data } : s))
      );
    };

    // 4. Handle Refetch Request
    const handleRefetch = () => {
      console.log("🔄 [Socket] Server meminta Refetch Data");
      if (onRefreshRequestRef.current) onRefreshRequestRef.current();
    };

    // Register Listeners
    socketService.onPositionUpdate(handlePositionUpdate);
    socketService.onAddSignatureLive(handleAddLive);
    socketService.onRemoveSignatureLive(handleRemoveLive);
    socketService.onRefetchData(handleRefetch);

    // CLEANUP FUNCTION (PENTING untuk mencegah Double Event)
    return () => {
      console.log("🛑 [Hook] Cleanup Socket Listeners (Unmount)");
      socketService.off("connect", handleConnect);
      socketService.off("update_signature_position", handlePositionUpdate);
      socketService.off("add_signature_live", handleAddLive);
      socketService.off("remove_signature_live", handleRemoveLive);
      socketService.off("refetch_data", handleRefetch);
      socketService.leaveRoom(documentId);
    };
  }, [documentId, isAuthVerified, currentUser.id]);

  // --- 4. ACTION HANDLERS (CRUD) ---

  const handleUpdateSignature = useCallback((updatedSignature) => {
    // 1. Update State Lokal (Optimistic)
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig))
    );

    // 2. Cek apakah signature ini masih "fresh" (baru dibuat)?
    if (pendingCreationIds.current.has(updatedSignature.id)) {
      console.log(`⏳ [QUEUE] Update posisi ditahan karena ID ${updatedSignature.id} sedang proses simpan.`);
      pendingUpdates.current.set(updatedSignature.id, updatedSignature);
      return;
    }

    // 3. Kirim ke Server (Debounce dihandle di service atau biarkan async)
    groupSignatureService
      .updateDraftPosition(updatedSignature.id, {
        positionX: updatedSignature.positionX,
        positionY: updatedSignature.positionY,
        width: updatedSignature.width,
        height: updatedSignature.height,
        pageNumber: updatedSignature.pageNumber,
      })
      .catch((err) => {
        // Silent error utk update posisi
      });
  }, []);

  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      setIsSaving(true);
      const fixedId = generateUUID(); // ID Lokal/Tetap

      // Tandai ID ini sedang proses "saving" agar update posisi ditahan dulu
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

      // 1. Optimistic UI: Tampilkan langsung di layar sendiri
      setSignatures((prev) => [...prev, newSignature]);

      // 2. Socket: Beritahu teman (tapi teman akan filter karena userId beda)
      // Log ini yang Anda lihat sebagai "✨ Emit Add Signature"
      console.log(`✨ [Socket] Emit Add Signature ke Room: ${documentId}`);
      socketService.emitAddSignature(documentId, { ...newSignature, isLocked: true });

      try {
        console.log(`💾 [API] Saving Draft ${fixedId}...`);

        // 3. Simpan ke Database
        await groupSignatureService.saveDraft(documentId, newSignature);

        console.log(`✅ [API] Draft ${fixedId} Saved.`);

        // Lepas lock update posisi
        pendingCreationIds.current.delete(fixedId);

        // Jika user menggeser tanda tangan SAAT sedang saving,
        // terapkan update terakhir yang tertunda di queue
        if (pendingUpdates.current.has(fixedId)) {
          const latestData = pendingUpdates.current.get(fixedId);
          handleUpdateSignature(latestData);
          pendingUpdates.current.delete(fixedId);
        }
      } catch (error) {
        console.error("Save Draft Failed:", error);
        toast.error("Gagal menyimpan draft.");

        // Rollback jika gagal
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

      // Optimistic Remove
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
        
        // Beritahu semua client untuk refresh data (status berubah jadi final)
        socketService.notifyDataChanged(documentId);

        // Hapus dari state draft lokal karena sudah jadi final (akan reload via fetch)
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