/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { signatureService } from "../../services/signatureService";
import { documentService } from "../../services/documentService";

export const useSignatureManager = ({ documentId, documentVersionId, currentUser, refreshKey }) => {
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        const sourceSignatures = doc.currentVersion.signaturesPersonal || [];

        const dbSignatures = sourceSignatures.map((sig) => ({
          id: sig.id,
          userId: sig.signerId || sig.userId,
          signerName: sig.signer?.name || "Saya",
          signatureImageUrl: sig.signatureImageUrl,
          pageNumber: sig.pageNumber,
          positionX: parseFloat(sig.positionX),
          positionY: parseFloat(sig.positionY),
          width: parseFloat(sig.width),
          height: parseFloat(sig.height),
          isLocked: true,
          status: "final",
        }));

        setSignatures(dbSignatures);
      } catch (e) {
        console.error("Failed to load signatures:", e);
      }
    };

    loadInitialSignatures();
  }, [documentId, currentUser, refreshKey]);

  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      const tempId = `sig-local-${Date.now()}`;

      const newSignature = {
        id: tempId,
        documentId,
        documentVersionId,
        userId: currentUser.id,
        signatureImageUrl: savedSignatureUrl,
        isLocked: false,
        isTemp: true,
        status: "draft",
        ...signatureData,
      };

      setSignatures((prev) => [...prev, newSignature]);
    },
    [documentId, documentVersionId, currentUser]
  );

  const handleUpdateSignature = useCallback(async (updatedSignature) => {
    setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));
  }, []);

  const handleDeleteSignature = useCallback(async (signatureId) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
  }, []);

  const handleAnalyzeDocument = useCallback(async () => {
    if (!documentId) return;

    setIsAnalyzing(true);
    setAiData(null);

    try {
      const result = await signatureService.analyzeDocument(documentId);
      setAiData(result);
      toast.success("Analisis AI selesai!", { icon: "🤖" });
    } catch (error) {
      console.error("AI Analysis Failed:", error);

      let displayMessage = "Gagal melakukan analisis dokumen.";
      const errorString = error.toString();

      if (errorString.includes("ECONNREFUSED") || errorString.includes("Network Error") || errorString.includes("500") || errorString.includes("502")) {
        displayMessage = "⚠️ Koneksi ke Layanan AI terputus. Pastikan server AI aktif.";
      } else if (error.response && error.response.data && error.response.data.message) {
        displayMessage = error.response.data.message;
      } else if (error.message) {
        displayMessage = error.message;
      }

      toast.error(displayMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  const handleFinalSave = useCallback(
    async (includeQrCode) => {
      const myLocalSignatures = signatures.filter((sig) => !sig.isLocked && sig.isTemp);

      if (myLocalSignatures.length === 0) {
        throw new Error("Silakan tempatkan tanda tangan Anda terlebih dahulu.");
      }

      setIsSaving(true);

      const payloadSignatures = myLocalSignatures.map((sig) => ({
        documentVersionId: documentVersionId,
        signatureImageUrl: sig.signatureImageUrl,
        positionX: sig.positionX,
        positionY: sig.positionY,
        pageNumber: sig.pageNumber,
        width: sig.width,
        height: sig.height,
        method: "canvas",
        displayQrCode: includeQrCode,
      }));

      const payload = {
        signatures: payloadSignatures,
      };

      try {
        await signatureService.addPersonalSignature(payload);

        setSignatures((prev) => prev.filter((s) => s.isLocked));
      } catch (error) {
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [signatures, documentVersionId]
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
