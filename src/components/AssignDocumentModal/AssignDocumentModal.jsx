// File: components/Group/AssignDocumentModal.jsx (BARU)

import React, { useState, useMemo } from 'react';
import toast from "react-hot-toast";
import { HiX } from 'react-icons/hi';
import { ImSpinner9 } from 'react-icons/im';
import { useGetMyDocuments } from '../../hooks/useDocument'; // Hook dari Langkah 1
import { useAssignDocumentToGroup } from '../../hooks/useGroups'; // Hook dari Langkah 2

/**
 * @param {boolean} isOpen - Tampilkan/sembunyikan modal
 * @param {function} onClose - Fungsi untuk menutup modal
 * @param {number} groupId - ID grup target
 * @param {Array} documentsAlreadyInGroup - Daftar dokumen (dari 'group.documents')
 */
export const AssignDocumentModal = ({ isOpen, onClose, groupId, documentsAlreadyInGroup = [] }) => {
  
  // State untuk menyimpan dokumen yang dipilih
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // 1. Ambil SEMUA dokumen milik user
  const { data: allMyDocuments, isLoading: isLoadingDocs } = useGetMyDocuments();
  
  // 2. Siapkan mutasi untuk "Assign"
  const { mutate: assignDocument, isPending: isAssigning } = useAssignDocumentToGroup();

  // 3. Filter dokumen:
  // Buat daftar ID dokumen yang sudah ada di grup
  const existingDocIds = useMemo(() => 
    new Set(documentsAlreadyInGroup.map(doc => doc.id)),
    [documentsAlreadyInGroup]
  );

  // Buat daftar dokumen yang bisa dipilih (yang BELUM ada di grup)
  const availableDocuments = useMemo(() => 
    allMyDocuments?.filter(doc => !existingDocIds.has(doc.id)) || [],
    [allMyDocuments, existingDocIds]
  );

  // Handler
  const handleAssign = () => {
    if (!selectedDocumentId) {
      toast.error("Silakan pilih dokumen terlebih dahulu.");
      return;
    }
    // Panggil mutasi
    assignDocument(
      { groupId, documentId: selectedDocumentId },
      {
        onSuccess: () => {
          onClose(); // Tutup modal jika sukses
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg z-50 w-full max-w-lg">
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Pilih Dokumen</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Daftar Dokumen */}
        <div className="max-h-64 overflow-y-auto border dark:border-slate-700 rounded-lg">
          {isLoadingDocs ? (
            <p className="p-4 text-center text-slate-500">Memuat dokumen Anda...</p>
          ) : availableDocuments.length === 0 ? (
            <p className="p-4 text-center text-slate-500">
              Tidak ada dokumen lain yang tersedia untuk ditambahkan.
            </p>
          ) : (
            <ul className="divide-y dark:divide-slate-700">
              {availableDocuments.map(doc => (
                <li 
                  key={doc.id}
                  onClick={() => setSelectedDocumentId(doc.id)}
                  className={`p-3 cursor-pointer ${
                    selectedDocumentId === doc.id 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{doc.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Status: {doc.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-slate-800 dark:text-white hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedDocumentId || isAssigning || isLoadingDocs}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isAssigning ? (
              <ImSpinner9 className="animate-spin h-5 w-5" />
            ) : (
              "Tambahkan ke Grup"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};