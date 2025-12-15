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
      deleteDoc({
        documentId: docToDelete.id,
        userId: currentUserId,
        groupId: groupId,
      });
      setIsConfirmOpen(false);
      setDocToDelete(null);
    }
  };

  const handleOpenManageSigners = (doc) => {
    setSelectedDocForEdit(doc);
    setIsManageSignersOpen(true);
  };

  const handleFinalize = (docId, docTitle) => {
    if (confirm(`Finalisasi dokumen "${docTitle}"? \nDokumen akan dikunci dan PDF final akan dibuat.`)) {
      finalizeDoc({ groupId, documentId: docId });
    }
  };

  return (
    // ✅ WRAPPER HALAMAN
    <div className="h-full w-full py-1 px-1">

      {/* --- MODALS --- */}
      <AssignDocumentModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} groupId={groupId} documentsAlreadyInGroup={documents} members={members} />
      <UploadGroupDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} groupId={groupId} members={members} />
      {selectedDocForEdit && (
        <ManageSignersModal isOpen={isManageSignersOpen} onClose={() => setIsManageSignersOpen(false)} groupId={groupId} documentId={selectedDocForEdit.id} currentSigners={selectedDocForEdit.signerRequests || []} members={members} />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        title="Hapus Dokumen Grup"
        message={`Apakah Anda yakin ingin menghapus dokumen "${docToDelete?.title}"? Tindakan ini akan menghapus dokumen secara permanen untuk semua anggota.`}
        confirmButtonColor="bg-red-600"
        confirmText={isDeleting ? "Menghapus..." : "Hapus Permanen"}
      />

      {/* ✅ KARTU LUAR (OUTER CARD) */}
      <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm overflow-hidden">
        
        {/* 1. HEADER */}
        <div className="flex-none px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              Dokumen Grup
              <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600/50">
                {documents.length}
              </span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Kelola semua file dan status tanda tangan dalam grup ini.
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
              >
                <HiOutlineDocumentAdd className="w-5 h-5" />
                <span>Draft</span>
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                <HiOutlineUpload className="w-5 h-5" />
                <span>Upload</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. AREA SCROLL */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0f172a]/20 p-4 sm:p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {documents.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3">
              {documents.map((doc) => {
                // Logika Status
                const signersList = doc.signerRequests || doc.groupSigners || [];
                const totalSigners = signersList.length;
                const signedCount = signersList.filter((s) => s.status === "SIGNED").length;
                const isDocCompleted = doc.status === "completed" || doc.status === "archived";
                const isReadyToFinalize = totalSigners > 0 && signedCount === totalSigners && !isDocCompleted;

                const myRequest = signersList.find((req) => req.userId === currentUserId);
                const myStatus = myRequest ? myRequest.status : null;
                
                // Tampilkan tombol "Tanda Tangani" jika status user PENDING dan Dokumen BELUM selesai
                const showSignButton = myStatus === "PENDING" && !isDocCompleted;

                return (
                  <li 
                    key={doc.id} 
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <Link to={`/documents/${doc.id}/view`} className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors">
                            {doc.title}
                          </Link>

                          {showSignButton && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                              ⏳ Perlu TTD
                            </span>
                          )}
                          {(myStatus === "SIGNED" || isDocCompleted) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                              <HiCheckCircle /> {isDocCompleted ? "Selesai" : "Sudah TTD"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${doc.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                            <span className="capitalize font-medium">{doc.status || "Draft"}</span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <div className="flex items-center gap-1.5">
                            <HiUserGroup className="text-slate-400" />
                            <span>{signedCount}/{totalSigners} Ditandatangani</span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span className="font-mono bg-slate-100 dark:bg-slate-700/50 px-1.5 rounded text-xs text-slate-500 dark:text-slate-400">v{doc.versions?.length || 1}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isAdmin && !isDocCompleted && (
                          <button
                            onClick={() => handleOpenManageSigners(doc)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700/50 dark:hover:text-blue-400 rounded-lg transition-all"
                            title="Kelola Penanda Tangan"
                          >
                            <HiUserGroup className="w-5 h-5" />
                          </button>
                        )}

                        {isAdmin && isReadyToFinalize && (
                          <button
                            onClick={() => handleFinalize(doc.id, doc.title)}
                            disabled={isFinalizing}
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wide rounded-lg shadow-sm transition-all"
                          >
                            {isFinalizing ? <ImSpinner9 className="animate-spin" /> : <HiShieldCheck />}
                            <span>Finalisasi</span>
                          </button>
                        )}

                        {showSignButton ? (
                          // ✅ UPDATE LINK: Mengarah ke halaman GROUP SIGN
                          <Link to={`/documents/${doc.id}/group-sign`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors shadow-blue-500/20">
                            <HiOutlinePencil className="w-4 h-4" />
                            <span className="">Tanda Tangani</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/documents/${doc.id}/view`}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                            <span className="hidden sm:inline">Lihat</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <button onClick={() => handleDeleteClick(doc)} disabled={isDeleting} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus Permanen">
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                <HiOutlineDocumentAdd className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Belum ada dokumen grup</h4>
              <p className="max-w-xs mt-1 text-sm opacity-80 mb-4">Grup ini masih kosong. {isAdmin ? "Mulai dengan mengunggah dokumen baru." : "Tunggu admin menambahkan dokumen."}</p>
              {isAdmin && (
                  <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Upload dokumen sekarang
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};