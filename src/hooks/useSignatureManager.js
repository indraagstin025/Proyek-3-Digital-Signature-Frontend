import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { signatureService } from "../services/signatureService"; // Service Personal (Clean)
import { documentService } from "../services/documentService";

export const useSignatureManager = ({ 
  documentId, 
  documentVersionId, 
  currentUser, 
  refreshKey 
}) => {
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);

  // 1. LOAD INITIAL DATA (Hanya mengambil signature yang sudah FINAL dari DB)
  useEffect(() => {
    const loadInitialSignatures = async () => {
      if (!documentId || !currentUser) return;

      try {
        const doc = await documentService.getDocumentById(documentId);

        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        // Ambil hanya Personal Signatures (karena ini hook personal)
        const sourceSignatures = doc.currentVersion.signaturesPersonal || [];

        const dbSignatures = sourceSignatures.map((sig) => ({
            id: sig.id,
            userId: sig.signerId || sig.userId, // Sesuaikan dengan respon prisma
            signerName: sig.signer?.name || "Saya",
            signatureImageUrl: sig.signatureImageUrl,
            pageNumber: sig.pageNumber,
            positionX: parseFloat(sig.positionX),
            positionY: parseFloat(sig.positionY),
            width: parseFloat(sig.width),
            height: parseFloat(sig.height),
            isLocked: true, // Signature dari DB (Personal) selalu locked/final
            status: "final"
        }));

        setSignatures(dbSignatures);
      } catch (e) {
        console.error("Failed to load signatures:", e);
      }
    };

    loadInitialSignatures();
  }, [documentId, currentUser, refreshKey]);

  // 2. HANDLER: ADD SIGNATURE (DROP)
  // Perubahan: Hanya simpan di Local State. Tidak ada API Call 'saveDraft'.
  const handleAddSignature = useCallback(
    async (signatureData, savedSignatureUrl, includeQrCode) => {
      // Generate ID Sementara Client-Side
      const tempId = `sig-local-${Date.now()}`;
      
      const newSignature = {
        id: tempId,
        documentId,
        documentVersionId,
        userId: currentUser.id,
        signatureImageUrl: savedSignatureUrl,
        isLocked: false, // Bisa digeser karena masih draft lokal
        isTemp: true,
        status: "draft",
        ...signatureData,
      };

      // Update UI langsung
      setSignatures((prev) => [...prev, newSignature]);

      // Tidak ada API Call ke backend untuk Personal Draft
      // Data akan dikirim nanti saat handleFinalSave
    },
    [documentId, documentVersionId, currentUser]
  );

  // 3. HANDLER: UPDATE POSITION (DRAG)
  // Perubahan: Hanya update Local State. Tidak ada API Call 'updatePosition'.
  const handleUpdateSignature = useCallback(async (updatedSignature) => {
    setSignatures((prev) => 
      prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig))
    );
    // Tidak perlu try-catch API call, karena murni operasi client-side
  }, []);

  // 4. HANDLER: DELETE SIGNATURE
  // Perubahan: Hanya hapus dari Local State.
  const handleDeleteSignature = useCallback(
    async (signatureId) => {
      setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
      // Tidak perlu API call delete, karena data belum ada di DB
    },
    []
  );

  // 5. HANDLER: AI ANALYSIS (Tetap menggunakan API)
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
      toast.error(error.message || "Gagal melakukan analisis dokumen.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  // 6. HANDLER: FINAL SAVE (ACTION KE SERVER)
  // Ini satu-satunya saat kita menghubungi Backend Personal Signature
  const handleFinalSave = useCallback(
    async (includeQrCode) => {
      // Ambil signature lokal yang belum terkunci
      const myLocalSignatures = signatures.filter((sig) => !sig.isLocked && sig.isTemp);

      if (myLocalSignatures.length === 0) {
        throw new Error("Silakan tempatkan tanda tangan Anda terlebih dahulu.");
      }

      setIsSaving(true);

      // Kita asumsikan Personal Sign bisa multiple, tapi biasanya 1.
      // Kita ambil yang pertama atau mapping semua jika backend support batch array.
      // Sesuai controller Anda: req.body.signatures (Array)
      
      const payloadSignatures = myLocalSignatures.map(sig => ({
          documentVersionId: documentVersionId,
          signatureImageUrl: sig.signatureImageUrl,
          positionX: sig.positionX,
          positionY: sig.positionY,
          pageNumber: sig.pageNumber,
          width: sig.width,
          height: sig.height,
          method: "canvas",
          displayQrCode: includeQrCode
      }));

      const payload = {
        signatures: payloadSignatures
      };

      try {
        // Panggil endpoint: POST /api/signatures/personal
        await signatureService.addPersonalSignature(payload);
        
        // Bersihkan state lokal karena sudah tersimpan di server
        // Nanti useEffect loadInitialSignatures akan mengambil data final yang baru
        setSignatures((prev) => prev.filter(s => s.isLocked)); 
        
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