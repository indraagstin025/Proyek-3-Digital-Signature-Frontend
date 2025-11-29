import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import { HiOutlineEye, HiOutlineX } from "react-icons/hi";
import { AssignDocumentModal } from "../../components/AssignDocumentModal/AssignDocumentModal";
import { useUnassignDocumentFromGroup } from "../../hooks/useGroups";

export const GroupDocuments = ({ documents, groupId, members, currentUserId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: unassignDocument, isPending: isUnassigning } = useUnassignDocumentFromGroup();

  const isAdmin = useMemo(() => members.some((m) => m.userId === currentUserId && m.role === "admin_group"), [members, currentUserId]);

  const handleAssignDocument = () => {
    setIsModalOpen(true);
  };

  const handleUnassign = (docId, docTitle) => {
    if (confirm(`Anda yakin ingin menghapus "${docTitle}" dari grup ini? (Dokumen tidak akan terhapus permanen)`)) {
      unassignDocument({ groupId, documentId: docId });
    }
  };

  return (
    <div>
      <AssignDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} groupId={groupId} documentsAlreadyInGroup={documents} />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Dokumen Grup</h3>

        {isAdmin && (
          <button onClick={handleAssignDocument} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
            + Tambah Dokumen
          </button>
        )}
      </div>

      {/* Daftar Dokumen */}
      <div className="bg-white dark:bg-slate-800/50 shadow rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700/50">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <li key={doc.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                {/* Info Dokumen */}
                <div>
                  <Link to={`/documents/${doc.id}/view`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {doc.title}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Status: <span className="font-medium capitalize">{doc.status}</span>
                  </p>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2">
                  <Link to={`/documents/${doc.id}/view`} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" title="Lihat Dokumen">
                    <HiOutlineEye className="w-5 h-5" />
                  </Link>

                  {/* 'HiOutlineX' sekarang sudah didefinisikan */}
                  {isAdmin && (
                    <button onClick={() => handleUnassign(doc.id, doc.title)} disabled={isUnassigning} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Hapus dari Grup">
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </li>
            ))
          ) : (
            <p className="p-4 text-center text-slate-500 dark:text-slate-400">Belum ada dokumen di grup ini.</p>
          )}
        </ul>
      </div>
    </div>
  );
};
