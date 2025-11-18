import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "../services/groupService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook untuk mengambil SEMUA grup milik user.
 * Ini akan otomatis menangani caching, loading, dan error.
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
    mutationFn: (variables) => groupService.assignDocumentToGroup(variables.groupId, variables.documentId),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["group", variables.groupId],
      });

      toast.success("Dokumen berhasil ditambahkan ke grup!");
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
    mutationFn: ({ groupId, documentId }) => 
      groupService.unassignDocumentFromGroup(groupId, documentId),
    
    onSuccess: (data, variables) => {
      // 'variables' adalah { groupId, documentId }
      
      // Refresh data 'group' untuk memperbarui daftar dokumen
      queryClient.invalidateQueries({ 
        queryKey: ['group', variables.groupId] 
      });
      
      toast.success("Dokumen berhasil dihapus dari grup.");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Gagal menghapus dokumen.";
      toast.error(message);
    }
  });
};
