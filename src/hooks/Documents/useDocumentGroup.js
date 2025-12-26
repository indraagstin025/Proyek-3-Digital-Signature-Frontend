// File: hooks/useDocuments.js (BARU atau tambahkan)

import { useQuery } from "@tanstack/react-query";
import { documentService } from "../../services/documentService"; // Asumsi nama file ini

/**
 * @description Hook untuk mengambil SEMUA dokumen milik user.
 */
export const useGetMyDocuments = () => {
  return useQuery({
    queryKey: ["documents", "all"],
    // KODE LAMA (Nonaktif): TanStack Query mengirim context object sebagai argumen pertama,
    // menyebabkan /api/documents?search=[object Object]
    // queryFn: documentService.getAllDocuments,

    // KODE BARU: Membungkus dengan fungsi kosong agar tidak ada argumen yang diteruskan ke getAllDocuments
    queryFn: () => documentService.getAllDocuments(),
  });
};
