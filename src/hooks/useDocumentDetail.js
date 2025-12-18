/* eslint-disable no-unused-vars */
// src/hooks/useDocumentDetail.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { documentService } from "../services/documentService";
import { userService } from "../services/userService";

export const useDocumentDetail = (documentId, contextData, refreshKey) => {
  const navigate = useNavigate();
  
  // KODE LAMA (Pemicu Crash): Menggunakan key "user" yang tidak sinkron & tanpa try-catch
  // const [currentUser, setCurrentUser] = useState(
  //   contextData?.user || JSON.parse(localStorage.getItem("user") || "null")
  // );

  // KODE BARU: Sinkronisasi dengan authService (key: "authUser") & Safety Check (try-catch)
  const [currentUser, setCurrentUser] = useState(() => {
    if (contextData?.user) return contextData.user;
    try {
      const stored = localStorage.getItem("authUser");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Extraksi user (mendukung format {user: {...}} atau langsung {...})
      return parsed?.user || parsed;
    } catch (e) {
      console.error("Gagal parsing session di useDocumentDetail:", e);
      return null;
    }
  });

  const [documentTitle, setDocumentTitle] = useState("Memuat...");
  const [pdfFile, setPdfFile] = useState(null);
  const [documentVersionId, setDocumentVersionId] = useState(null);
  
  const [isGroupDoc, setIsGroupDoc] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [isSignedSuccess, setIsSignedSuccess] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);

  // 1. Cek User Session
  useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        try {
          const data = await userService.getMyProfile();
          setCurrentUser(data);
          // KODE LAMA: 
          // localStorage.setItem("user", JSON.stringify(data));
          
          // KODE BARU: Selalu simpan dengan key "authUser" agar konsisten di seluruh aplikasi
          localStorage.setItem("authUser", JSON.stringify({ user: data }));
        } catch (error) {
          toast.error("Sesi berakhir.");
          navigate("/login");
        }
      };
      fetchUser();
    }
  }, [currentUser, navigate]);

  // 2. Fetch Dokumen
  useEffect(() => {
    const controller = new AbortController();
    const fetchDocument = async () => {
      if (!documentId || !currentUser || !currentUser.id) return;

      try {
        if (refreshKey === 0) setIsLoadingDoc(true);

        const doc = await documentService.getDocumentById(documentId, { signal: controller.signal });
        if (!doc || !doc.currentVersion?.id) throw new Error("Dokumen tidak ditemukan.");

        setDocumentTitle(doc.title);
        setDocumentVersionId(doc.currentVersion.id);

        const isCompleted = doc.status === "completed" || doc.status === "archived";
        let userHasSigned = false; // Flag baru untuk melacak status individu

        // --- LOGIKA GROUP VS PERSONAL ---
        if (doc.groupId) {
          setIsGroupDoc(true);
          const myRequest = (doc.signerRequests || []).find((s) => s.userId === currentUser?.id);
          
          if (myRequest) {
            if (myRequest.status === "PENDING") {
              setCanSign(true);
            } else {
              // Jika status SIGNED atau REJECTED
              setCanSign(false);
              
              // ✅ PERBAIKAN DI SINI: Tandai bahwa user ini sudah selesai
              if (myRequest.status === "SIGNED") {
                userHasSigned = true;
              }

              if (myRequest.status === "SIGNED" && !isCompleted && refreshKey === 0) {
                toast.success("Anda sudah menyelesaikan tanda tangan. Menunggu anggota lain.");
              }
            }
          } else {
            // Member grup tapi tidak di-assign tanda tangan (Viewer)
            setCanSign(false);
          }
        } else {
          // Dokumen Personal
          setIsGroupDoc(false);
          setCanSign(!isCompleted);
          if (isCompleted) userHasSigned = true;
        }

        // --- LOGIKA PENENTUAN SUCCESS STATE ---
        // Kita anggap sukses jika: Dokumen Selesai SECARA GLOBAL -ATAU- User ini sudah tanda tangan
        if (isCompleted || userHasSigned) {
          setIsSignedSuccess(true);
          setCanSign(false); // Pastikan tidak bisa sign lagi
        } else {
           // Reset hanya jika dokumen belum selesai DAN user belum tanda tangan
           setIsSignedSuccess(false); 
        }

        // Fetch PDF URL
        if (!pdfFile || isCompleted || refreshKey === 0) {
          const url = await documentService.getDocumentFileUrl(documentId, { signal: controller.signal });
          setPdfFile((prev) => (prev !== url ? url : prev));
        }

      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Error fetching document:", error);
          toast.error("Gagal memuat dokumen.");
        }
      } finally {
        if (refreshKey === 0 && !controller.signal.aborted) {
          setIsLoadingDoc(false);
        }
      }
    };

    fetchDocument();
    return () => controller.abort();
  }, [documentId, currentUser, refreshKey, navigate]);

  return {
    currentUser,
    documentTitle,
    pdfFile,
    documentVersionId,
    isGroupDoc,
    canSign,
    isSignedSuccess,
    setIsSignedSuccess,
    isLoadingDoc,
  };
};