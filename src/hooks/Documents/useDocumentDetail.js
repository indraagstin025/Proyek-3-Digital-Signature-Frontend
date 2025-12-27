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
    // Prioritas 1: Context
    if (contextData?.user) return contextData.user;

    // Prioritas 2: LocalStorage
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

  // Metadata State
  const [documentTitle, setDocumentTitle] = useState("Memuat...");
  const [documentVersionId, setDocumentVersionId] = useState(null);
  const [documentData, setDocumentData] = useState(null); // ✅ Store full doc object

  // PDF Blob State
  const [pdfFile, setPdfFile] = useState(null);

  // Status Logic State
  const [isGroupDoc, setIsGroupDoc] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [isSignedSuccess, setIsSignedSuccess] = useState(false);

  // Loading States
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Ref untuk caching versi agar tidak download ulang saat refreshKey berubah
  const loadedVersionRef = useRef(null);

  // 2. CEK USER SESSION (Jika null)
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

  // ============================================================
  // 3. EFFECT A: FETCH METADATA & STATUS + PDF IN PARALLEL
  // ============================================================
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    let objectUrl = null;

    const fetchDocumentAndPdf = async () => {
      if (!documentId || !currentUser?.id) return;

      try {
        // Hanya set loading jika ini load pertama kali (bukan refresh save ttd)
        if (refreshKey === 0) setIsLoadingDoc(true);

        // ✅ OPTIMASI: Fetch metadata dan PDF URL secara PARALEL
        const [doc, tempSignedUrl] = await Promise.all([
          documentService.getDocumentById(documentId, { signal: controller.signal }),
          documentService.getDocumentFileUrl(documentId).catch((e) => {
            console.warn("PDF URL fetch failed:", e);
            return null;
          }),
        ]);

        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan/rusak.");

        if (isMounted) {
          setDocumentTitle(doc.title);
          setDocumentData(doc); // ✅ Store full doc untuk useSignatureManager
          setDocumentVersionId(doc.currentVersion.id);

          // ✅ Cache banding untuk PDF (track full doc object)
          if (loadedVersionRef.current !== doc.currentVersion.id && tempSignedUrl) {
            loadedVersionRef.current = { versionId: doc.currentVersion.id, fetching: true };
          }
        }

        // --- LOGIKA PENENTUAN STATUS (GROUP VS PERSONAL) ---
        const isCompleted = doc.status === "completed" || doc.status === "archived";
        let userHasSigned = false;

        if (doc.groupId) {
          setIsGroupDoc(true);
          const myRequest = (doc.signerRequests || []).find((s) => s.userId === currentUser.id);

          if (myRequest) {
            if (myRequest.status === "PENDING") {
              if (isMounted) setCanSign(true);
            } else {
              if (isMounted) setCanSign(false);
              if (myRequest.status === "SIGNED") userHasSigned = true;

              if (myRequest.status === "SIGNED" && !isCompleted && refreshKey === 0) {
                toast.success("Tanda tangan Anda tersimpan. Menunggu pihak lain.", { id: "grp-signed" });
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

        // ✅ FETCH PDF BLOB PARALEL (Jangan tunggu metadata selesai)
        if (tempSignedUrl && isMounted) {
          try {
            const response = await fetch(tempSignedUrl, { signal: controller.signal });
            if (!response.ok) throw new Error("Gagal mengunduh file PDF.");

            const blob = await response.blob();
            if (!isMounted) return;

            objectUrl = URL.createObjectURL(blob);
            setPdfFile(objectUrl);
          } catch (pdfError) {
            console.error("PDF fetch error:", pdfError);
            if (isMounted && pdfError.name !== "AbortError") {
              toast.error("Gagal memuat file PDF.");
            }
          }
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.message === "canceled") return;
        console.error("Error fetching document:", error);
        if (isMounted) toast.error("Gagal memuat detail dokumen.");
      } finally {
        if (isMounted && refreshKey === 0) {
          setIsLoadingDoc(false);
        }
      }
    };

    fetchDocumentAndPdf();

    return () => {
      controller.abort();
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId, currentUser?.id, refreshKey, navigate]);

  return {
    currentUser,
    documentTitle,
    documentData, // ✅ Buat untuk useSignatureManager
    pdfFile, // Blob URL yang stabil
    documentVersionId,
    isGroupDoc,
    canSign,
    isSignedSuccess,
    setIsSignedSuccess,
    isLoadingDoc, // Loading Metadata
    isLoadingPdf, // Loading File PDF (opsional untuk UI)
  };
};
