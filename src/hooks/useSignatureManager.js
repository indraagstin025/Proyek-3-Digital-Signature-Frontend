import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { signatureService } from "../services/signatureService";
import { documentService } from "../services/documentService";
// import { socketService } from "../services/socketService"; // [REMOVED]
// import { userService } from "../services/userService";     // [REMOVED] (Tidak butuh auth check untuk socket lagi)

export const useSignatureManager = ({ 
  documentId, 
  documentVersionId, 
  currentUser, 
  isGroupDoc, // Parameter ini mungkin masih berguna untuk logika simpan ke endpoint berbeda (personal vs group)
  refreshKey 
}) => {
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Tetap dipertahankan jika nanti ada fitur AI
  const [aiData, setAiData] = useState(null);

  // Ref untuk melacak item yang dihapus agar tidak muncul lagi saat re-fetch
  const deletedSignaturesRef = useRef(new Set());

  // --- 1. Load Initial Signatures (Fetch dari API) ---
  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        // Jika dokumen sudah selesai/diarsipkan, kosongkan signature interaktif
        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        // Gabungkan signature Group dan Personal
        const sourceSignatures = [
          ...(doc.currentVersion.signaturesGroup || []), 
          ...(doc.currentVersion.signaturesPersonal || [])
        ];

        const dbSignatures = sourceSignatures
          .map((sig) => {
            const sigOwnerId = sig.userId || sig.signerId || sig.signer?.id;
            const isMySignature = sigOwnerId === currentUser.id;

            return {
              id: sig.id,
              userId: sigOwnerId,
              signerName: sig.signer?.name || "User Lain",
              signatureImageUrl: sig.signatureImageUrl,
              pageNumber: sig.pageNumber,
              positionX: parseFloat(sig.positionX),
              positionY: parseFloat(sig.positionY),
              width: parseFloat(sig.width),
              height: parseFloat(sig.height),
              // Kunci jika bukan milik user ini (agar tidak bisa digeser)
              isLocked: !isMySignature, 
            };
          })
          .filter((sig) => !deletedSignaturesRef.current.has(sig.id));

        setSignatures((prev) => {
          // Pertahankan draft lokal yang sedang dibuat user (yang ID-nya masih temporary 'sig-tap-')
          const myOwnDrafts = prev.filter(
            (sig) => sig.userId === currentUser.id && 
            typeof sig.id === "string" && 
            sig.id.startsWith("sig-tap-")
          );

          return [...dbSignatures, ...myOwnDrafts];
        });
      } catch (e) {
        console.error("Failed to load signatures:", e);
      }
    };

    loadInitialSignatures();
  }, [documentId, currentUser, refreshKey]);


  // --- 2. Handle Add Signature (Local & API Draft) ---
  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      setIsSaving(true);

      const tempId = `sig-tap-${Date.now()}`;
      const newSignature = {
        id: tempId,
        documentId,
        documentVersionId,
        userId: currentUser.id,
        signatureImageUrl: savedSignatureUrl, // Pastikan key ini konsisten dengan PlacedSignature
        isLocked: false,
        isTemp: true,
        ...signatureData, // { pageNumber, x, y, width, height, ... }
      };

      // Update State Lokal (Optimistic UI)
      setSignatures((prev) => [...prev, newSignature]);

      // [REMOVED] socketService.emitAddSignature(...)

      try {
        // Simpan ke Database (sebagai Draft)
        const savedData = await signatureService.saveDraft(
          documentId, 
          newSignature, 
          isGroupDoc, 
          includeQrCode
        );

        // Hapus dari set deleted jika sebelumnya pernah dihapus
        deletedSignaturesRef.current.delete(savedData.id);

        // Ganti ID Temporary dengan ID Database yang asli
        setSignatures((prev) => 
          prev.map((s) => (s.id === tempId ? { ...s, id: savedData.id, isTemp: false } : s))
        );
      } catch (error) {
        toast.error("Gagal menyimpan draft.");
        // Rollback state jika gagal
        setSignatures((prev) => prev.filter((s) => s.id !== tempId));

        // [REMOVED] socketService.emitRemoveSignature(...)
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, documentVersionId, currentUser, isGroupDoc]
  );


  // --- 3. Handle Update Signature (Move/Resize) ---
  const handleUpdateSignature = useCallback(async (updatedSignature) => {
    // Update State Lokal
    setSignatures((prev) => 
      prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig))
    );

    // Update ke API hanya jika ID-nya sudah valid (bukan draft temporary 'sig-tap-')
    // Draft temporary biasanya di-handle saat 'saveDraft' atau menunggu ID asli balik.
    if (!updatedSignature.id.toString().startsWith("sig-")) {
      try {
        await signatureService.updatePosition(updatedSignature.id, {
          positionX: updatedSignature.positionX,
          positionY: updatedSignature.positionY,
          width: updatedSignature.width,
          height: updatedSignature.height,
          pageNumber: updatedSignature.pageNumber,
        });
      } catch (e) {
        console.error("Gagal update posisi:", e);
        // Opsional: Rollback state jika gagal update posisi
      }
    }
  }, []);


  // --- 4. Handle Delete Signature ---
  const handleDeleteSignature = useCallback(
    async (signatureId) => {
      // Tandai sebagai deleted agar tidak muncul lagi saat re-fetch
      deletedSignaturesRef.current.add(signatureId);
      
      // Hapus dari State Lokal
      setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));

      // [REMOVED] socketService.emitRemoveSignature(...)

      // Hapus dari Database jika bukan draft temporary
      if (!signatureId.toString().startsWith("sig-")) {
        try {
          await signatureService.deleteSignature(signatureId);
        } catch (e) {
          console.error(e);
          toast.error("Gagal menghapus tanda tangan.");
          // Rollback: Hapus dari set deleted agar muncul lagi nanti
          deletedSignaturesRef.current.delete(signatureId);
        }
      }
    },
    [documentId] // Dependency dikurangi
  );


  // --- 5. Handle Final Save (Komitmen Akhir) ---
  const handleFinalSave = useCallback(
    async (includeQrCode) => {
      // Cari signature milik user ini yang valid
      const mySignatures = signatures.filter((sig) => !sig.isLocked && sig.signatureImageUrl);

      if (mySignatures.length === 0) {
        throw new Error("Silakan tempatkan tanda tangan Anda.");
      }

      setIsSaving(true);

      const sigToSave = mySignatures[0];
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

      // Simulasi loading agar UX terasa mantap (opsional)
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 2000)); // Dikurangi jadi 2s saja

      try {
        if (isGroupDoc) {
          await Promise.all([
            signatureService.addGroupSignature({ documentId, ...payload }), 
            minLoadingTime
          ]);
          // [REMOVED] socketService.notifyDataChanged(...)
        } else {
          await Promise.all([
            signatureService.addPersonalSignature({
              signatures: [{ documentVersionId, ...payload }],
            }),
            minLoadingTime,
          ]);
        }

        // Hapus signature draft dari layar karena sekarang sudah jadi permanen di dokumen
        setSignatures((prev) => prev.filter((s) => s.id !== sigToSave.id));
      } catch (error) {
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [signatures, documentId, documentVersionId, isGroupDoc]
  );

  return {
    signatures,
    setSignatures,
    isSaving,
    isAnalyzing,
    aiData,
    setAiData,
    handleAddSignature,
    handleUpdateSignature,
    handleDeleteSignature,
    handleFinalSave,
  };
};