import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { signatureService } from "../services/signatureService";
import { documentService } from "../services/documentService";

export const useSignatureManager = ({ documentId, documentVersionId, currentUser, isGroupDoc, refreshKey }) => {
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);

  const deletedSignaturesRef = useRef(new Set());

  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        const sourceSignatures = [...(doc.currentVersion.signaturesGroup || []), ...(doc.currentVersion.signaturesPersonal || [])];

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

              isLocked: !isMySignature,
            };
          })
          .filter((sig) => !deletedSignaturesRef.current.has(sig.id));

        setSignatures((prev) => {
          const myOwnDrafts = prev.filter((sig) => sig.userId === currentUser.id && typeof sig.id === "string" && sig.id.startsWith("sig-tap-"));

          return [...dbSignatures, ...myOwnDrafts];
        });
      } catch (e) {
        console.error("Failed to load signatures:", e);
      }
    };

    loadInitialSignatures();
  }, [documentId, currentUser, refreshKey]);



  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      setIsSaving(true);

      const tempId = `sig-tap-${Date.now()}`;
      const newSignature = {
        id: tempId,
        documentId,
        documentVersionId,
        userId: currentUser.id,
        signatureImageUrl: savedSignatureUrl,
        isLocked: false,
        isTemp: true,
        ...signatureData,
      };

      setSignatures((prev) => [...prev, newSignature]);

      try {
        const savedData = await signatureService.saveDraft(documentId, newSignature, isGroupDoc, includeQrCode);

        deletedSignaturesRef.current.delete(savedData.id);

        setSignatures((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: savedData.id, isTemp: false } : s)));
      } catch (error) {
        toast.error("Gagal menyimpan draft.");

        setSignatures((prev) => prev.filter((s) => s.id !== tempId));
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, documentVersionId, currentUser, isGroupDoc]
  );

  const handleUpdateSignature = useCallback(async (updatedSignature) => {
    setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));

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
      }
    }
  }, []);

  const handleDeleteSignature = useCallback(
    async (signatureId) => {
      deletedSignaturesRef.current.add(signatureId);

      setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));

      if (!signatureId.toString().startsWith("sig-")) {
        try {
          await signatureService.deleteSignature(signatureId);
        } catch (e) {
          console.error(e);
          toast.error("Gagal menghapus tanda tangan.");

          deletedSignaturesRef.current.delete(signatureId);
        }
      }
    },
    [documentId]
  );

  const handleAnalyzeDocument = useCallback(async () => {
    if (!documentId) return;
    
    setIsAnalyzing(true);
    setAiData(null); // Reset data lama agar modal tertutup sebentar/loading ulang

    try {
   
      const result = await signatureService.analyzeDocument(documentId);
      
      setAiData(result);
      toast.success("Analisis AI selesai!", { icon: "🤖" });
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      toast.error(error.message || "Gagal melakukan analisis dokumen.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  const handleFinalSave = useCallback(
    async (includeQrCode) => {
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

      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        if (isGroupDoc) {
          await Promise.all([signatureService.addGroupSignature({ documentId, ...payload }), minLoadingTime]);
        } else {
          await Promise.all([
            signatureService.addPersonalSignature({
              signatures: [{ documentVersionId, ...payload }],
            }),
            minLoadingTime,
          ]);
        }

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
    handleAnalyzeDocument,
  };
};
