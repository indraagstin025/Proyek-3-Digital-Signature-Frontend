import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineUpload, HiOutlineDocumentAdd, HiOutlinePencil, HiCheckCircle, HiUserGroup, HiShieldCheck, HiTrash, HiOutlineDocumentText} from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";
import { AssignDocumentModal } from "../../components/AssignDocumentModal/AssignDocumentModal";
import { UploadGroupDocumentModal } from "../../components/UploadGroupDocumentModal/UploadGroupDocumentModal";
import { ManageSignersModal } from "../../components/ManageSignersModals/ManageSignersModals";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";
import { useFinalizeDocument, useDeleteGroupDocument } from "../../hooks/Group/useGroups.js";

export const GroupDocuments = ({ documents, groupId, members, currentUserId }) => {
  // ... (State logic tidak berubah)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageSignersOpen, setIsManageSignersOpen] = useState(false);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteGroupDocument();
  const { mutate: finalizeDoc, isPending: isFinalizing } = useFinalizeDocument();
  const isAdmin = useMemo(() => members.some((m) => m.userId === currentUserId && m.role === "admin_group"), [members, currentUserId]);

  const handleDeleteClick = (doc) => { setDocToDelete(doc); setIsConfirmOpen(true); };
  const onConfirmDelete = () => { if (docToDelete) { deleteDoc({ groupId, documentId: docToDelete.id }); setIsConfirmOpen(false); setDocToDelete(null); } };
  const handleOpenManageSigners = (doc) => { setSelectedDocForEdit(doc); setIsManageSignersOpen(true); };
  const handleFinalize = (docId, docTitle) => { if (confirm(`Apakah Anda yakin ingin finalisasi dokumen "${docTitle}"?`)) { finalizeDoc({ groupId, documentId: docId }); } };

  return (
    <div className="h-full w-full py-1">
      {/* MODALS tetap sama */}
      <AssignDocumentModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} groupId={groupId} documentsAlreadyInGroup={documents} members={members} />
      <UploadGroupDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} groupId={groupId} members={members} />
      {selectedDocForEdit && <ManageSignersModal isOpen={isManageSignersOpen} onClose={() => setIsManageSignersOpen(false)} groupId={groupId} documentId={selectedDocForEdit.id} currentSigners={selectedDocForEdit.signerRequests || []} members={members} />}
      <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={onConfirmDelete} title="Hapus Dokumen" message={`Hapus "${docToDelete?.title}"?`} confirmButtonColor="bg-red-600" confirmText={isDeleting ? "Menghapus..." : "Hapus"} />

      <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        
        {/* 1. HEADER DOKUMEN */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Daftar Dokumen
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola file dan status tanda tangan tim.</p>
          </div>

          {isAdmin && (
            <div className="flex gap-3 w-full sm:w-auto">
              {/* Tombol Draft Style Outline */}
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 transition-all shadow-sm"
              >
                <HiOutlineDocumentAdd className="w-5 h-5" />
                <span>Pilih Draft</span>
              </button>
              
              {/* 🔥 TOMBOL UPLOAD GRADASI */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <HiOutlineUpload className="w-5 h-5" />
                <span>Upload Baru</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. LIST DOKUMEN */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0f172a]/30 p-4 sm:p-6 [&::-webkit-scrollbar]:hidden">
          {documents.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4">
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
                  <li key={doc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                      {/* Left Info */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Icon Type Placeholder */}
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                             <HiOutlineDocumentText className="w-6 h-6" />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <Link to={`/documents/${doc.id}/view`} className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 transition-colors block truncate">
                                {doc.title}
                            </Link>
                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                               {/* Badge Status Small */}
                               <span className={`inline-block w-2 h-2 rounded-full ${doc.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                               <span className="capitalize">{doc.status || "Draft"}</span> • v{doc.versions?.length || 1}
                            </p>
                          </div>
                        </div>

                        {/* Status Bar / Signers */}
                        <div className="flex items-center gap-3 pl-[3.25rem]">
                           {/* Status Badges */}
                           {showSignButton && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/60">Perlu TTD</span>}
                           {(myStatus === "SIGNED" || isDocCompleted) && (
                             <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                               <HiCheckCircle className="w-3.5 h-3.5" /> {isDocCompleted ? "Selesai" : "Sudah TTD"}
                             </span>
                           )}

                           {/* Tooltip Signers */}
                           <div className="relative group/tooltip">
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-help hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                 <HiUserGroup className="w-3.5 h-3.5" />
                                 {signedCount}/{totalSigners} Signed
                              </div>
                              {/* ... (Isi Tooltip sama seperti sebelumnya, disembunyikan utk ringkas) ... */}
                           </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="w-full sm:w-auto flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700 mt-2 sm:mt-0">
                        {isAdmin && isReadyToFinalize && (
                          <button
                            onClick={() => handleFinalize(doc.id, doc.title)}
                            disabled={isFinalizing}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
                          >
                            {isFinalizing ? <ImSpinner9 className="animate-spin" /> : <HiShieldCheck className="w-4 h-4" />}
                            <span>Finalisasi</span>
                          </button>
                        )}

                        {showSignButton ? (
                          <Link
                            to={`/documents/${doc.id}/group-sign`}
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                            <span>TTD Sekarang</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/documents/${doc.id}/view`}
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                            <span>Lihat</span>
                          </Link>
                        )}

                        {isAdmin && (
                            <div className="flex gap-1 ml-1">
                                {!isDocCompleted && (
                                    <button onClick={() => handleOpenManageSigners(doc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Signer">
                                        <HiUserGroup className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteClick(doc)} disabled={isDeleting} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                    <HiTrash className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                  <HiOutlineDocumentAdd className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-slate-600 dark:text-slate-300 font-semibold text-lg">Belum ada dokumen</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Upload dokumen baru atau pilih dari draft Anda untuk memulai kolaborasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};