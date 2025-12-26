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
  // 3. EFFECT A: FETCH METADATA & STATUS (Jalan tiap refreshKey)
  // ============================================================
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchDocumentMetadata = async () => {
      if (!documentId || !currentUser?.id) return;

      try {
        // Hanya set loading jika ini load pertama kali (bukan refresh save ttd)
        if (refreshKey === 0) setIsLoadingDoc(true);

        const doc = await documentService.getDocumentById(documentId, { signal: controller.signal });

        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan/rusak.");

        if (isMounted) {
          setDocumentTitle(doc.title);
          // Ini kunci utama: Kita update Version ID.
          // Effect B di bawah akan mendeteksi perubahan ini.
          setDocumentVersionId(doc.currentVersion.id);
        }

        // --- LOGIKA PENENTUAN STATUS (GROUP VS PERSONAL) ---
        const isCompleted = doc.status === "completed" || doc.status === "archived";
        let userHasSigned = false;

        if (doc.groupId) {
          setIsGroupDoc(true);
          // Cari request milik user yang sedang login
          const myRequest = (doc.signerRequests || []).find((s) => s.userId === currentUser.id);

          if (myRequest) {
            if (myRequest.status === "PENDING") {
              if (isMounted) setCanSign(true);
            } else {
              if (isMounted) setCanSign(false);
              if (myRequest.status === "SIGNED") userHasSigned = true;

              // Toast Info
              if (myRequest.status === "SIGNED" && !isCompleted && refreshKey === 0) {
                toast.success("Tanda tangan Anda tersimpan. Menunggu pihak lain.", { id: "grp-signed" });
              }
            }
          } else {
            // Member tapi Viewer
            if (isMounted) setCanSign(false);
          }
        } else {
          // Dokumen Personal
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
        if (error.name === "CanceledError" || error.message === "canceled") return;
        console.error("Error fetching document metadata:", error);
        if (isMounted) toast.error("Gagal memuat detail dokumen.");
      } finally {
        if (isMounted && refreshKey === 0) {
          setIsLoadingDoc(false);
        }
      }
    };

    fetchDocumentMetadata();

    return () => {
      controller.abort();
      isMounted = false;
    };
  }, [documentId, currentUser?.id, refreshKey, navigate]);

  // ============================================================
  // 4. EFFECT B: FETCH PDF BLOB (Hanya jalan jika Version ID berubah)
  // ============================================================
  useEffect(() => {
    // Jangan jalan jika ID belum ada
    if (!documentId || !documentVersionId) return;

    // 🔥 OPTIMASI: Jika versi dokumen masih sama dengan yang sudah diload, JANGAN download ulang.
    if (loadedVersionRef.current === documentVersionId) {
      console.log("⚡ [PDF Cache] Menggunakan PDF yang sudah ada (Versi sama).");
      return;
    }

    let isMounted = true;
    let objectUrl = null;

    const fetchPdfBlob = async () => {
      try {
        setIsLoadingPdf(true); // Loading khusus PDF (bisa dipakai untuk spinner overlay di viewer)
        console.log(`📥 [PDF Fetch] Mengunduh versi baru: ${documentVersionId}`);

        // 1. Dapatkan Signed URL dari Backend
        // Pastikan service frontend Anda mengembalikan string URL
        const tempSignedUrl = await documentService.getDocumentFileUrl(documentId);

        // 2. Fetch File Fisik via Browser
        const response = await fetch(tempSignedUrl);
        if (!response.ok) throw new Error("Gagal mengunduh file PDF.");

        const blob = await response.blob();

        if (!isMounted) return;

        // 3. Buat Blob URL (Persistent di sesi browser)
        objectUrl = URL.createObjectURL(blob);
        setPdfFile(objectUrl);

        // 4. Update Cache Ref
        loadedVersionRef.current = documentVersionId;
      } catch (error) {
        console.error("Error fetching PDF Blob:", error);
        if (isMounted) toast.error("Gagal memuat file PDF.");
      } finally {
        if (isMounted) setIsLoadingPdf(false);
      }
    };

    fetchPdfBlob();

    // Cleanup: Revoke URL saat unmount atau ganti versi untuk cegah memory leak
    return () => {
      isMounted = false;
      if (objectUrl) {
        console.log("🧹 [PDF Cleanup] Membersihkan memori Blob.");
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId, documentVersionId]); // ❌ refreshKey TIDAK BOLEH ADA DI SINI

  return {
    currentUser,
    documentTitle,
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
