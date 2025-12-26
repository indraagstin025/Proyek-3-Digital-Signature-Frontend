/* eslint-disable no-unused-vars */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "../../services/groupService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ==========================================
// 1. GET HOOKS (Query) - Tidak ada perubahan
// ==========================================

export const useGetGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupService.getAllUserGroups,
  });
};

export const useGetGroupById = (groupId) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroupById(groupId),
    enabled: !!groupId,
  });
};

// ==========================================
// 2. MUTATION HOOKS (Action) - Dengan Fix Toast
// ==========================================

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupName) => groupService.createGroup(groupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      console.error("Gagal membuat grup:", error.message);
      // Tambahkan toast error jika perlu, dengan ID unik
      toast.error("Gagal membuat grup", { id: "create-group-error" });
    },
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, role }) => groupService.createInvitation(groupId, role),
    onSuccess: (data, variables) => {
      console.log("Link Undangan Dibuat:", data.invitationLink);
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      // Opsional: Toast sukses copy link
      toast.success("Link undangan dibuat!", { id: "create-invite-success" });
    },
    onError: (error) => {
      console.error("Gagal membuat undangan:", error.message);
      toast.error("Gagal membuat undangan", { id: "create-invite-error" });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token) => groupService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

/**
 * FIX: Menambahkan ID unik berdasarkan userId yang dihapus
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userIdToRemove }) => groupService.removeMember(groupId, userIdToRemove),

    onSuccess: (data, variables) => {
      queryClient.setQueryData(["group", Number(variables.groupId)], (old) => {
        if (!old) return old;
        return {
          ...old,
          members: old.members.filter((m) => m.user.id !== variables.userIdToRemove),
        };
      });
      // ✅ FIX: ID unik mencegah duplikasi visual
      toast.success("Anggota berhasil dikeluarkan.", { 
        id: `remove-member-${variables.userIdToRemove}` 
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal mengeluarkan anggota.";
      toast.error(message, { id: "remove-member-error" });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, name }) => groupService.updateGroup(groupId, { name }),

    onSuccess: (updatedGroup, variables) => {
      queryClient.setQueryData(["group", Number(variables.groupId)], (old) => {
        if (!old) return old;
        return { ...old, name: updatedGroup.name };
      });

      queryClient.setQueryData(["groups"], (oldGroups) => {
        if (!oldGroups) return oldGroups;
        return oldGroups.map((g) => (g.id === variables.groupId ? { ...g, name: updatedGroup.name } : g));
      });

      // ✅ FIX: ID unik per grup
      toast.success("Nama grup berhasil diperbarui!", { 
        id: `update-group-${variables.groupId}` 
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal memperbarui nama.";
      toast.error(message, { id: "update-group-error" });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (groupId) => groupService.deleteGroup(groupId),
    onSuccess: (data, groupId) => {
      queryClient.removeQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      
      navigate("/dashboard/workspaces");
      
      // ✅ FIX: ID unik
      toast.success("Grup berhasil dihapus.", { 
        id: `delete-group-${groupId}` 
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menghapus grup.";
      toast.error(message, { id: "delete-group-error" });
    },
  });
};

export const useAssignDocumentToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId, signerUserIds }) => groupService.assignDocumentToGroup(groupId, documentId, signerUserIds),

    onSuccess: (updatedDoc, variables) => {
      queryClient.setQueryData(["group", Number(variables.groupId)], (old) => {
        if (!old) return old;
        if (old.documents.find((d) => d.id === updatedDoc.id)) return old;
        return {
          ...old,
          documents: [updatedDoc, ...old.documents],
        };
      });

      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      
      // ✅ FIX: ID unik per dokumen
      toast.success("Dokumen berhasil ditambahkan ke grup!", { 
        id: `assign-doc-${variables.documentId}` 
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menambahkan dokumen.";
      toast.error(message, { id: "assign-doc-error" });
    },
  });
};

export const useUnassignDocumentFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId }) => groupService.unassignDocumentFromGroup(groupId, documentId),

    onSuccess: (data, variables) => {
      queryClient.setQueryData(["group", Number(variables.groupId)], (old) => {
        if (!old) return old;
        return {
          ...old,
          documents: old.documents.filter((doc) => doc.id !== variables.documentId),
        };
      });

      // ✅ FIX: ID unik
      toast.success("Dokumen berhasil dilepaskan dari grup.", { 
        id: `unassign-doc-${variables.documentId}` 
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menghapus dokumen.";
      toast.error(message, { id: "unassign-doc-error" });
    },
  });
};

export const useUploadGroupDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, file, title, signerUserIds }) => 
      groupService.uploadGroupDocument(groupId, file, title, signerUserIds),

    onSuccess: (newDocument, variables) => {
      const gId = Number(variables.groupId);

      queryClient.setQueryData(["group", gId], (oldGroupData) => {
        if (!oldGroupData) return oldGroupData;
        return {
          ...oldGroupData,
          documents: [newDocument, ...oldGroupData.documents],
        };
      });
  
      queryClient.invalidateQueries({ queryKey: ["group", gId] });
      toast.success("Dokumen berhasil diupload!", { id: "upload-doc-success" });
    },

    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal mengupload dokumen.";
      toast.error(message, { id: "upload-doc-error" });
    },
  });
};

export const useUpdateDocumentSigners = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, documentId, signerUserIds, members }) => {
      return await groupService.updateDocumentSigners(groupId, documentId, signerUserIds);
    },

    onMutate: async ({ groupId, documentId, signerUserIds, members }) => {
      console.log("🚀 [Optimistic] Memulai Update UI Instan...");
      const gId = Number(groupId);

      await queryClient.cancelQueries({ queryKey: ["group", gId] });
      const previousGroupData = queryClient.getQueryData(["group", gId]);

      const optimisticSigners = signerUserIds.map((userId) => {
        const memberData = members.find((m) => m.user.id === userId);
        return {
          userId: userId,
          status: "PENDING",
          user: memberData ? memberData.user : { id: userId, name: "Loading..." },
        };
      });

      queryClient.setQueryData(["group", gId], (old) => {
        if (!old) return old;
        return {
          ...old,
          documents: old.documents.map((doc) => {
            if (doc.id === documentId) {
              return {
                ...doc,
                signerRequests: optimisticSigners,
                status: optimisticSigners.length > 0 ? (doc.status === "draft" ? "pending" : doc.status) : "draft",
              };
            }
            return doc;
          }),
        };
      });

      return { previousGroupData };
    },

    onError: (err, newTodo, context) => {
      console.error("🔴 Update Gagal, Rollback UI...");
      if (context?.previousGroupData) {
        queryClient.setQueryData(["group", Number(newTodo.groupId)], context.previousGroupData);
      }
      toast.error("Gagal memperbarui signer. Perubahan dibatalkan.", { id: "update-signer-error" });
    },

    onSuccess: (serverResult, variables) => {
      const gId = Number(variables.groupId);

      if (serverResult && serverResult.id) {
        queryClient.setQueryData(["group", gId], (old) => {
          if (!old) return old;
          return {
            ...old,
            documents: old.documents.map((doc) => (doc.id === serverResult.id ? serverResult : doc)),
          };
        });
      }

      toast.success("Daftar penanda tangan diperbarui!", { 
        id: `update-signer-${variables.documentId}` 
      });
    },
  });
};

export const useFinalizeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId }) => groupService.finalizeDocument(groupId, documentId),

    onSuccess: (updatedDocument, variables) => {
      const gId = Number(variables.groupId);

      queryClient.setQueryData(["group", gId], (oldGroupData) => {
        if (!oldGroupData) return oldGroupData;
        return {
          ...oldGroupData,
          documents: oldGroupData.documents.map((doc) => (doc.id === variables.documentId ? { ...doc, status: "completed", signedFileUrl: updatedDocument.signedFileUrl } : doc)),
        };
      });

      queryClient.setQueryData(["document", variables.documentId], (oldDoc) => {
        if (!oldDoc) return updatedDocument;
        return {
          ...oldDoc,
          ...updatedDocument,
          status: "completed",
        };
      });

      queryClient.invalidateQueries({ queryKey: ["group", gId] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.documentId] });

      // ✅ FIX: ID unik
      toast.success("Dokumen berhasil difinalisasi!", { 
        icon: "✅",
        id: `finalize-${variables.documentId}`
      });
    },

    onError: (error) => {
      console.error("Gagal finalisasi:", error);
      toast.error(error?.response?.data?.message || "Gagal memfinalisasi dokumen.", { id: "finalize-error" });
    },
  });
};

export const useDeleteGroupDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId }) => groupService.deleteGroupDocument(groupId, documentId),

    onSuccess: (data, variables) => {
      const gId = Number(variables.groupId);

      queryClient.setQueryData(["group", gId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          documents: oldData.documents.filter((doc) => doc.id !== variables.documentId),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["group", gId] });
      
      // ✅ FIX: ID unik
      toast.success("Dokumen berhasil dihapus permanen.", { 
        id: `delete-doc-${variables.documentId}` 
      });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menghapus dokumen.";
      toast.error(message, { id: "delete-doc-error" });
    },
  });
};