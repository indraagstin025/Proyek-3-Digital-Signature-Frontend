import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "../services/groupService";
import { documentService } from "../services/documentService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook untuk mengambil SEMUA grup milik user.
 */
export const useGetGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupService.getAllUserGroups,
  });
};

/**
 * Hook (Mutation) untuk MEMBUAT grup baru.
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupName) => groupService.createGroup(groupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      console.error("Gagal membuat grup:", error.message);
    },
  });
};

export const useGetGroupById = (groupId) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroupById(groupId),
    enabled: !!groupId,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, role }) => groupService.createInvitation(groupId, role),
    onSuccess: (data, variables) => {
      console.log("Link Undangan Dibuat:", data.invitationLink);
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
    onError: (error) => {
      console.error("Gagal membuat undangan:", error.message);
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

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userIdToRemove }) => groupService.removeMember(groupId, userIdToRemove),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
    onError: (error) => {
      console.error("Gagal mengeluarkan anggota:", error.message);
    },
  });
};

/**
 * @description Hook (Mutation) untuk MENGUBAH NAMA grup.
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, name }) => groupService.updateGroup(groupId, { name }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Nama grup berhasil diperbarui!");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal memperbarui nama.";
      toast.error(message);
    },
  });
};

/**
 * @description Hook (Mutation) untuk MENGHAPUS grup.
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (groupId) => groupService.deleteGroup(groupId),
    onSuccess: (data, groupId) => {
      queryClient.removeQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Grup berhasil dihapus.");
      navigate("/dashboard/workspaces");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menghapus grup.";
      toast.error(message);
    },
  });
};

/**
 * @description Hook (Mutation) untuk MENETAPKAN dokumen ke grup.
 */
export const useAssignDocumentToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId, signerUserIds }) => 
      groupService.assignDocumentToGroup(groupId, documentId, signerUserIds),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      toast.success("Dokumen berhasil ditambahkan!");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menambahkan dokumen.";
      toast.error(message);
    },
  });
};

/**
 * @description Hook (Mutation) untuk MELEPASKAN dokumen dari grup.
 */
export const useUnassignDocumentFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId }) => groupService.unassignDocumentFromGroup(groupId, documentId),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["group", variables.groupId],
      });
      toast.success("Dokumen berhasil dihapus dari grup.");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menghapus dokumen.";
      toast.error(message);
    },
  });
};

/**
 * @description Hook (Mutation) untuk MENGUPLOAD dokumen baru ke grup
 * beserta daftar penanda tangannya.
 */
export const useUploadGroupDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, file, title, signerUserIds }) => 
      groupService.uploadGroupDocument(groupId, file, title, signerUserIds),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["group", variables.groupId],
      });
      toast.success("Dokumen berhasil diupload & permintaan tanda tangan dikirim!");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal mengupload dokumen.";
      toast.error(message);
    },
  });
};

/**
 * [BARU] Hook (Mutation) untuk UPDATE DAFTAR SIGNER (Edit Checklist).
 * Digunakan oleh komponen ManageSignersModal.
 */
export const useUpdateDocumentSigners = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, documentId, signerUserIds }) => 
      groupService.updateDocumentSigners(groupId, documentId, signerUserIds),

    onSuccess: (data, variables) => {
      // Invalidate query grup agar list dokumen di UI terupdate dengan signer baru
      queryClient.invalidateQueries({
        queryKey: ["group", variables.groupId],
      });
      // Toast sukses biasanya ditangani di komponen UI, tapi bisa ditaruh sini juga
    },
    onError: (error) => {
      // Error handling
      console.error("Gagal update signer:", error);
    },
  });
};

// Tambahkan Hook baru
export const useFinalizeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, documentId }) => groupService.finalizeDocument(groupId, documentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      toast.success("Dokumen berhasil difinalisasi!");
    },
    onError: (error) => {
      console.error("Gagal finalisasi:", error);
      toast.error(error?.response?.data?.message || "Gagal memfinalisasi dokumen.");
    }
  });
};

export const useDeleteGroupDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Kita panggil documentService.deleteDocument
    mutationFn: ({ documentId, userId }) => documentService.deleteDocument(documentId, userId),

    onSuccess: (data, variables) => {
      // Refresh data grup agar dokumen hilang dari list
      // Kita asumsikan groupId dikirim via variables (opsional, tapi bagus untuk invalidate)
      if (variables.groupId) {
        queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      }
      toast.success("Dokumen berhasil dihapus permanen.");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || "Gagal menghapus dokumen.";
      toast.error(message);
    },
  });
};