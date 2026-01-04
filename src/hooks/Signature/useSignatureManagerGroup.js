/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

import { groupSignatureService } from "../../services/groupSignatureService";
import { documentService } from "../../services/documentService";
import { socketService } from "../../services/socketService";
import { userService } from "../../services/userService";
import { signatureService } from "../../services/signatureService"; 

// Utility: Generate ID Sementara
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

// Utility: Generate Warna Acak untuk Avatar
const getRandomColor = (name = "User") => {
    const colors = [
        "bg-red-500", "bg-orange-500", "bg-amber-500", 
        "bg-green-500", "bg-emerald-500", "bg-teal-500", 
        "bg-cyan-500", "bg-blue-500", "bg-indigo-500", 
        "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
        "bg-pink-500", "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const useSignatureManagerGroup = ({
  documentId,
  documentVersionId,
  currentUser,
  refreshKey,
  onRefreshRequest,
}) => {
  // State Utama
  const [signatures, setSignatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // State AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);

  // State Real-time Users (Avatar Group)
  const [activeUsers, setActiveUsers] = useState([]);

  // Refs
  const onRefreshRequestRef = useRef(onRefreshRequest);
  const deletedSignaturesRef = useRef(new Set());
  const pendingCreationIds = useRef(new Set());
  const pendingUpdates = useRef(new Map());
  const isSocketInitialized = useRef(null); 
  const userIdRef = useRef(currentUser?.id);
  const myDraftIdRef = useRef(null);

  // --- DEBUG LOGGER: Monitor activeUsers State ---
  useEffect(() => {
    if (activeUsers.length > 0) {
        console.group("📸 [DEBUG FOTO] State activeUsers Updated");
        console.log("Total User Online:", activeUsers.length);
        activeUsers.forEach((u, idx) => {
            console.log(`   User #${idx + 1}: ${u.userName}`);
            console.log(`   -> URL Foto:`, u.profilePictureUrl ? u.profilePictureUrl : "(KOSONG/UNDEFINED)");
        });
        console.groupEnd();
    }
  }, [activeUsers]);

  useEffect(() => {
    onRefreshRequestRef.current = onRefreshRequest;
  }, [onRefreshRequest]);

  useEffect(() => {
    if (!currentUser) return;
    userIdRef.current = currentUser.id;
    const myDraft = signatures.find(
      (s) => String(s.userId) === String(currentUser.id) && s.status === "draft"
    );
    myDraftIdRef.current = myDraft ? myDraft.id : null;
  }, [signatures, currentUser]);

  // --- 1. VERIFIKASI SESI USER ---
  useEffect(() => {
    const verifySession = async () => {
      if (currentUser && documentId) {
        try {
          await userService.getMyProfile(); 
          setIsAuthVerified(true);
        } catch (error) {
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

        if (doc?.status === "completed" || doc?.status === "archived") {
          setSignatures([]);
          return;
        }

        let sourceSignatures = [
          ...(doc.currentVersion.signaturesGroup || []),
          ...(doc.currentVersion.signaturesPersonal || []),
        ];

        const myStaleDraft = sourceSignatures.find(
            (s) => String(s.userId || s.signerId) === String(currentUser.id) && s.status === "draft"
        );

        if (myStaleDraft) {
            try {
                await groupSignatureService.deleteDraft(myStaleDraft.id);
            } catch (err) { /* ignore */ }
            sourceSignatures = sourceSignatures.filter(s => s.id !== myStaleDraft.id);
        }

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
          isLocked: String(sig.userId) !== String(currentUser.id),
        }));

        setSignatures((prev) => {
          const map = new Map();
          dbSignatures.filter((s) => s.status === "final").forEach((sig) => {
              if (!deletedSignaturesRef.current.has(sig.id)) map.set(sig.userId, sig);
          });
          dbSignatures.filter((s) => s.status === "draft").forEach((sig) => {
              if (deletedSignaturesRef.current.has(sig.id)) return;
              if (!map.has(sig.userId)) map.set(sig.userId, sig);
          });
          prev.forEach((local) => {
            if (deletedSignaturesRef.current.has(local.id)) return;
            if (!map.has(local.userId)) {
              map.set(local.userId, { ...local, status: "draft" });
            } else {
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

  // --- 3. SOCKET CONNECTION & EVENT HANDLERS ---
  useEffect(() => {
    if (!documentId || !isAuthVerified) return;
    if (isSocketInitialized.current === documentId) return;

    isSocketInitialized.current = documentId;
    const socket = socketService.connect();

    const handleConnect = () => socketService.joinRoom(documentId);
    if (socket.connected) handleConnect();
    socketService.on("connect", handleConnect);

    // ✅ HANDLER: USER JOINED (Orang lain masuk)
    const handleUserJoined = (data) => {
        console.log("📸 [DEBUG FOTO] Event 'user_joined' diterima:", data);
        console.log("   -> URL dari Server:", data.profilePictureUrl);

        const incomingUserId = String(data.userId || "");
        if (incomingUserId === String(userIdRef.current)) return;

        const userName = data.userName || "Seseorang";

        setActiveUsers((prev) => {
            if (prev.find(u => String(u.userId) === incomingUserId)) return prev;
            return [
                ...prev, 
                { 
                    userId: incomingUserId, 
                    userName: userName, 
                    profilePictureUrl: data.profilePictureUrl, // 🔥 Check ini
                    color: getRandomColor(userName) 
                }
            ];
        });

        toast.success(`${userName} bergabung!`, {
            icon: "👋",
            position: "top-center",
            style: {
                borderRadius: '10px',
                background: '#1f2937', 
                color: '#fff',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            },
        });
    };

    // ✅ HANDLER: CURRENT ROOM USERS (Data teman yang sudah ada saat kita masuk)
    const handleCurrentRoomUsers = (users) => {
        console.log("📸 [DEBUG FOTO] Event 'current_room_users' diterima. Raw Data:", users);
        
        users.forEach((u, i) => {
             console.log(`   User [${i}] ${u.userName} -> URL:`, u.profilePictureUrl);
        });

        const formattedUsers = users.map(u => ({
            userId: String(u.userId),
            userName: u.userName,
            profilePictureUrl: u.profilePictureUrl, // 🔥 Check ini
            color: getRandomColor(u.userName)
        }));

        setActiveUsers(formattedUsers);
    };

    // --- HANDLER: USER LEFT ---
    const handleUserLeft = (data) => {
        setActiveUsers((prev) => prev.filter(u => String(u.userId) !== String(data.userId)));
    };

    // --- SIGNATURE HANDLERS ---
    const handleAddLive = (newSig) => {
      const incomingUserId = String(newSig.userId || newSig.signerId || "");
      if (incomingUserId === String(userIdRef.current)) return;

      setSignatures((prev) => {
        const exists = prev.find((s) => s.id === newSig.id);
        if (exists) return prev;
        const hasFinal = prev.some((s) => String(s.userId) === incomingUserId && s.status === "final");
        if (hasFinal) return prev;
        if (deletedSignaturesRef.current.has(newSig.id)) return prev;

        const cleanPrev = prev.filter((s) => String(s.userId) !== incomingUserId);
        
        toast(`${newSig.signerName || "User lain"} sedang menandatangani...`, { 
            icon: "✏️", 
            id: `sig-toast-${incomingUserId}`
        });
        
        return [...cleanPrev, { ...newSig, status: "draft", isLocked: true }];
      });
    };

    const handleRemoveLive = (signatureId) => {
      setSignatures((prev) => prev.filter((s) => s.id !== signatureId));
    };

    const handlePositionUpdate = (data) => {
      setSignatures((prev) => prev.map((s) => (s.id === data.signatureId ? { ...s, ...data } : s)));
    };

    const handleRefetch = () => {
      if (onRefreshRequestRef.current) onRefreshRequestRef.current();
    };

    // --- REGISTER LISTENERS ---
    socketService.onPositionUpdate(handlePositionUpdate);
    socketService.onAddSignatureLive(handleAddLive);
    socketService.onRemoveSignatureLive(handleRemoveLive);
    socketService.onRefetchData(handleRefetch);
    
    if (socket.on) {
        socket.on("user_joined", handleUserJoined);
        socket.on("user_left", handleUserLeft);
        socket.on("current_room_users", handleCurrentRoomUsers);
    }

    // --- CLEANUP ---
    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("update_signature_position", handlePositionUpdate);
      socketService.off("add_signature_live", handleAddLive);
      socketService.off("remove_signature_live", handleRemoveLive);
      socketService.off("refetch_data", handleRefetch);
      
      if (socket.off) {
          socket.off("user_joined", handleUserJoined);
          socket.off("user_left", handleUserLeft);
          socket.off("current_room_users", handleCurrentRoomUsers);
      }

      socketService.leaveRoom(documentId);
      isSocketInitialized.current = null;

      if (myDraftIdRef.current) {
        groupSignatureService.deleteDraft(myDraftIdRef.current).catch(() => {}); 
      }
    };
  }, [documentId, isAuthVerified]);

  // --- 4. ACTION HANDLERS ---
  const handleUpdateSignature = useCallback((updatedSignature) => {
    setSignatures((prev) => prev.map((sig) => (sig.id === updatedSignature.id ? updatedSignature : sig)));
    if (pendingCreationIds.current.has(updatedSignature.id)) {
      pendingUpdates.current.set(updatedSignature.id, updatedSignature);
      return;
    }
    groupSignatureService.updateDraftPosition(updatedSignature.id, updatedSignature).catch(() => {});
  }, []);

  const handleAddSignature = useCallback(async (signatureData, savedSignatureUrl, includeQrCode) => {
      setIsSaving(true);
      const fixedId = generateUUID(); 
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

      setSignatures((prev) => [...prev, newSignature]);
      socketService.emitAddSignature(documentId, { ...newSignature, isLocked: true });

      try {
        await groupSignatureService.saveDraft(documentId, newSignature);
        pendingCreationIds.current.delete(fixedId);
        if (pendingUpdates.current.has(fixedId)) {
          const latestData = pendingUpdates.current.get(fixedId);
          handleUpdateSignature(latestData);
          pendingUpdates.current.delete(fixedId);
        }
      } catch (error) {
        toast.error("Gagal menyimpan draft.");
        setSignatures((prev) => prev.filter((s) => s.id !== fixedId));
        socketService.emitRemoveSignature(documentId, fixedId);
        pendingCreationIds.current.delete(fixedId);
        pendingUpdates.current.delete(fixedId);
      } finally {
        setIsSaving(false);
      }
    }, [documentId, documentVersionId, currentUser, handleUpdateSignature]);

  const handleDeleteSignature = useCallback(async (signatureId) => {
      deletedSignaturesRef.current.add(signatureId);
      setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
      socketService.emitRemoveSignature(documentId, signatureId);
      try { await groupSignatureService.deleteDraft(signatureId); } catch (e) { console.error(e); }
    }, [documentId]);

  const handleFinalSave = useCallback(async (includeQrCode) => {
      const myDraft = signatures.find((sig) => String(sig.userId) === String(currentUser.id));
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
        socketService.notifyDataChanged(documentId);
        setSignatures((prev) => prev.filter((s) => s.id !== myDraft.id));
      } catch (error) { throw error; } finally { setIsSaving(false); }
    }, [signatures, documentId, currentUser.id]);

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
      let msg = error.response?.data?.message || "Gagal melakukan analisis.";
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  const handleAutoTag = useCallback(async () => {
    toast("Fitur Auto-Tag segera hadir di mode Grup!", { icon: "🚧" });
  }, []);

  return {
    signatures, setSignatures, isSaving, 
    isAnalyzing, aiData, handleAnalyzeDocument, handleAutoTag,
    activeUsers, 
    handleAddSignature, handleUpdateSignature, handleDeleteSignature, handleFinalSave,
  };
};