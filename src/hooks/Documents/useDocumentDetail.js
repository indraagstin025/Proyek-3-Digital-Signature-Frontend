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
  const [pdfFile, setPdfFile] = useState(null);
  const [isGroupDoc, setIsGroupDoc] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [isSignedSuccess, setIsSignedSuccess] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

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

  // 3. FETCH DATA & LOGIC STATUS
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    let objectUrl = null;

    const fetchDocumentAndPdf = async () => {
      if (!documentId || !currentUser?.id) return;

      try {
        if (refreshKey === 0) setIsLoadingDoc(true);

        const [doc, tempSignedUrl] = await Promise.all([
          documentService.getDocumentById(documentId, { signal: controller.signal }),
          documentService.getDocumentFileUrl(documentId).catch((e) => null),
        ]);

        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan.");

        if (isMounted) {
          setDocumentTitle(doc.title);
          setDocumentData(doc);
          setDocumentVersionId(doc.currentVersion.id);

          if (loadedVersionRef.current !== doc.currentVersion.id && tempSignedUrl) {
            loadedVersionRef.current = { versionId: doc.currentVersion.id, fetching: true };
          }
        }

        // --- FIX LOGIC STATUS (GROUP VS PERSONAL) ---
        const isCompleted = doc.status === "completed" || doc.status === "archived";
        let userHasSigned = false;

        if (doc.groupId) {
          setIsGroupDoc(true);
          // [PERBAIKAN] Gunakan String() untuk membandingkan ID agar aman dari tipe data (Int/UUID)
          const myRequest = (doc.signerRequests || []).find((s) => String(s.userId) === String(currentUser.id));

          if (myRequest) {
            if (myRequest.status === "PENDING") {
              if (isMounted) setCanSign(true);
            } else {
              if (isMounted) setCanSign(false);
              if (myRequest.status === "SIGNED") userHasSigned = true;

              if (myRequest.status === "SIGNED" && !isCompleted && refreshKey === 0) {
                toast.success("Tanda tangan tersimpan. Menunggu pihak lain.", { id: "grp-signed" });
              }
            }
          } else {
            // User tidak terdaftar sebagai signer di dokumen ini
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

        // FETCH PDF
        if (tempSignedUrl && isMounted) {
          try {
            const response = await fetch(tempSignedUrl, { signal: controller.signal });
            if (!response.ok) throw new Error("Gagal mengunduh PDF.");
            const blob = await response.blob();
            if (!isMounted) return;
            objectUrl = URL.createObjectURL(blob);
            setPdfFile(objectUrl);
          } catch (pdfError) {
            if (pdfError.name !== "AbortError") console.error("PDF fetch error:", pdfError);
          }
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching doc:", error);
          if (isMounted) toast.error("Gagal memuat dokumen.");
        }
      } finally {
        if (isMounted && refreshKey === 0) setIsLoadingDoc(false);
      }
    };

    fetchDocumentAndPdf();

    return () => {
      controller.abort();
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId, currentUser?.id, refreshKey, navigate]);

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
    isLoadingPdf,
  };
};