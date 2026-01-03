/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { documentService } from "../../services/documentService";
import { userService } from "../../services/userService";

export const useDocumentDetail = (documentId, contextData, refreshKey) => {
  const navigate = useNavigate();

  // 1. STATE INITIALIZATION
  const [currentUser, setCurrentUser] = useState(() => {
    if (contextData?.user) return contextData.user;
    try {
      const stored = localStorage.getItem("authUser");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.user || parsed;
    } catch (e) {
      console.error("Session parse error:", e);
      return null;
    }
  });

  const [documentTitle, setDocumentTitle] = useState("Memuat...");
  const [documentVersionId, setDocumentVersionId] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [pdfFile, setPdfFile] = useState(null); // Blob URL
  const [isGroupDoc, setIsGroupDoc] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [isSignedSuccess, setIsSignedSuccess] = useState(false);
  
  // Loading States
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  
  // Ref untuk caching versi agar tidak download ulang PDF saat refreshKey berubah
  const loadedVersionRef = useRef(null);

  // 2. CEK USER SESSION
  useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        try {
          const data = await userService.getMyProfile();
          setCurrentUser(data);
          localStorage.setItem("authUser", JSON.stringify({ user: data }));
        } catch (error) {
          console.error("Session expired:", error);
          toast.error("Sesi berakhir, silakan login kembali.");
          navigate("/login");
        }
      };
      fetchUser();
    }
  }, [currentUser, navigate]);

  // 3. FETCH DATA (METADATA + PDF)
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    let objectUrl = null;

    const fetchDocumentData = async () => {
      if (!documentId || !currentUser?.id) return;

      try {
        // [OPTIMASI 1] Silent Loading
        // Hanya tampilkan spinner loading layar penuh saat PERTAMA kali buka (refreshKey === 0).
        // Saat save (refreshKey > 0), biarkan user tetap melihat dokumen (background update).
        if (refreshKey === 0) setIsLoadingDoc(true);

        // 1. Fetch Metadata Dokumen (Selalu ambil yang terbaru)
        const doc = await documentService.getDocumentById(documentId, { signal: controller.signal });
        
        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan.");

        if (isMounted) {
          setDocumentTitle(doc.title);
          setDocumentData(doc);
          setDocumentVersionId(doc.currentVersion.id);
        }

        // [OPTIMASI 2] Cerdas Fetch PDF
        // Cek apakah kita SUDAH punya PDF dengan versi yang sama?
        // Jika loadedVersionRef.current SAMA dengan doc.currentVersion.id, DAN pdfFile sudah ada,
        // MAKA JANGAN DOWNLOAD ULANG.
        const shouldFetchPdf = !loadedVersionRef.current || loadedVersionRef.current !== doc.currentVersion.id || !pdfFile;

        if (shouldFetchPdf) {
            console.log("📥 [useDocumentDetail] Mengunduh File PDF Baru...");
            try {
                const tempSignedUrl = await documentService.getDocumentFileUrl(documentId);
                const response = await fetch(tempSignedUrl, { signal: controller.signal });
                if (!response.ok) throw new Error("Gagal mengunduh PDF.");
                
                const blob = await response.blob();
                if (isMounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setPdfFile(objectUrl);
                    // Update Cache Ref
                    loadedVersionRef.current = doc.currentVersion.id;
                }
            } catch (pdfError) {
                if (pdfError.name !== "AbortError") console.error("PDF fetch error:", pdfError);
            }
        } else {
            console.log("♻️ [useDocumentDetail] PDF Versi sama. Menggunakan cache Blob (Mencegah Refresh).");
        }

        // --- STATUS LOGIC (Tetap jalankan ini agar tombol berubah status) ---
        const isCompleted = doc.status === "completed" || doc.status === "archived";
        let userHasSigned = false;

        if (doc.groupId) {
          setIsGroupDoc(true);
          const myRequest = (doc.signerRequests || []).find((s) => String(s.userId) === String(currentUser.id));

          if (myRequest) {
            if (myRequest.status === "PENDING") {
              if (isMounted) setCanSign(true);
            } else {
              if (isMounted) setCanSign(false);
              if (myRequest.status === "SIGNED") userHasSigned = true;

              if (myRequest.status === "SIGNED" && !isCompleted && refreshKey === 0) {
                toast.success("Tanda tangan tersimpan.", { id: "grp-signed" });
              }
            }
          } else {
            if (isMounted) setCanSign(false);
          }
        } else {
          setIsGroupDoc(false);
          if (isMounted) setCanSign(!isCompleted);
          if (isCompleted) userHasSigned = true;
        }

        if (isMounted) {
          if (isCompleted || userHasSigned) {
            setIsSignedSuccess(true);
            setCanSign(false);
          } else {
            setIsSignedSuccess(false);
          }
        }

      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching doc:", error);
          if (isMounted) toast.error("Gagal memuat dokumen.");
        }
      } finally {
        // Matikan loading hanya jika ini load awal
        if (isMounted && refreshKey === 0) setIsLoadingDoc(false);
      }
    };

    fetchDocumentData();

    return () => {
      controller.abort();
      isMounted = false;
      // Jangan revoke objectUrl di sini jika kita ingin mempertahankan PDF saat refreshKey berubah
      // Revoke dilakukan otomatis oleh browser saat page unmount total
    };
  }, [documentId, currentUser?.id, refreshKey, navigate]); // pdfFile dikeluarkan dari dep array agar tidak loop

  return {
    currentUser,
    documentTitle,
    documentData,
    pdfFile,
    documentVersionId,
    isGroupDoc,
    canSign,
    isSignedSuccess,
    setIsSignedSuccess,
    isLoadingDoc,
  };
};