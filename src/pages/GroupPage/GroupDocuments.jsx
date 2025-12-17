import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineUpload, HiOutlineDocumentAdd, HiOutlinePencil, HiCheckCircle, HiUserGroup, HiShieldCheck, HiTrash } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";
import { AssignDocumentModal } from "../../components/AssignDocumentModal/AssignDocumentModal";
import { UploadGroupDocumentModal } from "../../components/UploadGroupDocumentModal/UploadGroupDocumentModal";
import { ManageSignersModal } from "../../components/ManageSignersModals/ManageSignersModals";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";
import { useFinalizeDocument, useDeleteGroupDocument } from "../../hooks/useGroups";

export const GroupDocuments = ({ documents, groupId, members, currentUserId }) => {
  // ... (State dan Logic sama persis, saya sembunyikan agar fokus ke UI)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageSignersOpen, setIsManageSignersOpen] = useState(false);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteGroupDocument();
  const { mutate: finalizeDoc, isPending: isFinalizing } = useFinalizeDocument();
  const isAdmin = useMemo(() => members.some((m) => m.userId === currentUserId && m.role === "admin_group"), [members, currentUserId]);

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsConfirmOpen(true);
  };
  const onConfirmDelete = () => {
    if (docToDelete) {
      deleteDoc({ documentId: docToDelete.id, userId: currentUserId, groupId: groupId });
      setIsConfirmOpen(false);
      setDocToDelete(null);
    }
  };
  const handleOpenManageSigners = (doc) => {
    setSelectedDocForEdit(doc);
    setIsManageSignersOpen(true);
  };
  const handleFinalize = (docId, docTitle) => {
  if (confirm(`Apakah Anda yakin ingin finalisasi dokumen "${docTitle}"?`)) {
    finalizeDoc({ groupId, documentId: docId });
  }
};

  return (
    <div className="h-full w-full py-1 px-1">
      {/* --- MODALS (Code sama) --- */}
      <AssignDocumentModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} groupId={groupId} documentsAlreadyInGroup={documents} members={members} />
      <UploadGroupDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} groupId={groupId} members={members} />
      {selectedDocForEdit && (
        <ManageSignersModal isOpen={isManageSignersOpen} onClose={() => setIsManageSignersOpen(false)} groupId={groupId} documentId={selectedDocForEdit.id} currentSigners={selectedDocForEdit.signerRequests || []} members={members} />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        title="Hapus Dokumen"
        message={`Hapus "${docToDelete?.title}"?`}
        confirmButtonColor="bg-red-600"
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
      />

      {/* ✅ CARD UTAMA */}
      <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        {/* 1. HEADER */}
        <div className="flex-none px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 sm:gap-3">
              Dokumen Grup
              <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">{documents.length}</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Kelola file dan status tanda tangan.</p>
          </div>

          {isAdmin && (
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-all"
              >
                <HiOutlineDocumentAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Draft</span>
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                <HiOutlineUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Upload</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. LIST DOKUMEN (SCROLL AREA) */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0f172a]/20 p-3 sm:p-5 [&::-webkit-scrollbar]:hidden">
          {documents.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3">
              {documents.map((doc) => {
                const signersList = doc.signerRequests || doc.groupSigners || [];
                const totalSigners = signersList.length;
                const signedCount = signersList.filter((s) => s.status === "SIGNED").length;
                const isDocCompleted = doc.status === "completed" || doc.status === "archived";
                const isReadyToFinalize = totalSigners > 0 && signedCount === totalSigners && !isDocCompleted;
                const myRequest = signersList.find((req) => req.userId === currentUserId);
                const myStatus = myRequest ? myRequest.status : null;
                const showSignButton = myStatus === "PENDING" && !isDocCompleted;

                return (
                  <li key={doc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
                    {/* ✅ FLEX-COL di Mobile, FLEX-ROW di Desktop */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Left: Info Dokumen */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Link to={`/documents/${doc.id}/view`} className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 truncate transition-colors max-w-full">
                            {doc.title}
                          </Link>

                          {/* Badges */}
                          {showSignButton && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Perlu TTD</span>}
                          {(myStatus === "SIGNED" || isDocCompleted) && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <HiCheckCircle /> {isDocCompleted ? "Selesai" : "Sudah TTD"}
                            </span>
                          )}
                        </div>

                        {/* Metadata (Status, Signers) - Wrap di mobile */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${doc.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                            <span className="capitalize font-medium">{doc.status || "Draft"}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <HiUserGroup className="text-slate-400" />
                            <span>
                              {signedCount}/{totalSigners} <span className="hidden sm:inline">Ditandatangani</span>
                              <span className="sm:hidden">TTD</span>
                            </span>
                          </div>

                          <span className="font-mono bg-slate-100 dark:bg-slate-700/50 px-1.5 rounded text-xs">v{doc.versions?.length || 1}</span>
                        </div>
                      </div>

                      {/* Right: Actions Buttons */}
                      {/* Di Mobile: Width Full dan justify-end atau space-between */}
                      <div className="w-full sm:w-auto flex items-center justify-end gap-2 border-t pt-3 sm:border-0 sm:pt-0 mt-2 sm:mt-0 border-slate-100 dark:border-slate-700">
                        {isAdmin && !isDocCompleted && (
                          <button onClick={() => handleOpenManageSigners(doc)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:bg-transparent" title="Kelola Penanda Tangan">
                            <HiUserGroup className="w-5 h-5" />
                          </button>
                        )}

                        {isAdmin && isReadyToFinalize && (
                          <button onClick={() => handleFinalize(doc.id, doc.title)} disabled={isFinalizing} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded-lg">
                            {isFinalizing ? <ImSpinner9 className="animate-spin" /> : <HiShieldCheck />}
                            <span>Finalisasi</span>
                          </button>
                        )}

                        {showSignButton ? (
                          <Link to={`/documents/${doc.id}/group-sign`} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                            <HiOutlinePencil className="w-4 h-4" />
                            <span>Tanda Tangani</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/documents/${doc.id}/view`}
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                            <span>Lihat</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <button onClick={() => handleDeleteClick(doc)} disabled={isDeleting} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:bg-transparent" title="Hapus">
                            <HiTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            // Empty State yang Responsif
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <HiOutlineDocumentAdd className="w-12 h-12 text-slate-300 mb-2" />
              <p>Belum ada dokumen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
