// File: hooks/useDocuments.js (BARU atau tambahkan)

import { useQuery } from '@tanstack/react-query';
import { documentService } from '../services/documentService'; // Asumsi nama file ini

/**
 * @description Hook untuk mengambil SEMUA dokumen milik user.
 */
export const useGetMyDocuments = () => {
  return useQuery({
    queryKey: ['documents', 'all'], 
    queryFn: documentService.getAllDocuments, // <--- INI BENAR
  });
};