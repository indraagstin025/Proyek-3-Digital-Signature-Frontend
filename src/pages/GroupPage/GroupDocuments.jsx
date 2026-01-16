// File: components/Group/GroupDocuments.jsx

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineUpload, HiOutlineDocumentAdd, HiOutlinePencil, HiCheckCircle, HiUserGroup, HiShieldCheck, HiTrash, HiOutlineDocumentText, HiClock, HiExclamation, HiLockClosed, HiSparkles } from "react-icons/hi";
import { FaHistory } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import toast from "react-hot-toast";

import { AssignDocumentModal } from "../../components/AssignDocumentModal/AssignDocumentModal";
import { UploadGroupDocumentModal } from "../../components/UploadGroupDocumentModal/UploadGroupDocumentModal";
import { ManageSignersModal } from "../../components/ManageSignersModals/ManageSignersModals";
import DocumentManagementModal from "../../components/DocumentManagementModal/DocumentManagementModal";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal.jsx";
import { useFinalizeDocument, useDeleteGroupDocument } from "../../hooks/Group/useGroups.js";
import { useQuota } from "../../context/QuotaContext";
import { useCanPerformAction } from "../../hooks/useCanPerformAction";
import { SoftLockError } from "../../components/ui/SoftLockError";

export const GroupDocuments = ({ documents, groupId, groupData, members, currentUser, currentUserId }) => {
  const navigate = useNavigate();
  const { quota } = useQuota(); // Get global quota context

  // --- STATE ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageSignersOpen, setIsManageSignersOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [softLockError, setSoftLockError] = useState(null); // New: Soft lock error state

  const [selectedDocForEdit, setSelectedDocForEdit] = useState(null);
  const [selectedDocForManage, setSelectedDocForManage] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // --- HOOKS ---
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteGroupDocument();
  const { mutate: finalizeDoc, isPending: isFinalizing } = useFinalizeDocument();

  // --- LOGIC LIMIT & HAK AKSES ---

  const isAdmin = useMemo(() => members.some((m) => m.userId === currentUserId && m.role === "admin_group"), [members, currentUserId]);

  // [PREMIUM LOGIC - Using QuotaContext + GroupData]

  // 1. Cek Status User yang sedang Login (Anda)
  const currentUserStatus = quota?.userStatus || "FREE";
  const isCurrentUserPremium = currentUserStatus === "PREMIUM" || currentUserStatus === "PREMIUM_YEARLY";

  // 2. Cek Status Pemilik Grup (Admin)
  let groupOwnerStatus = "FREE";
  const isCurrentUserOwner = String(groupData?.admin?.id) === String(currentUserId);

  if (isCurrentUserOwner) {
    // Jika saya pemilik, ambil dari global quota context (paling update)
    groupOwnerStatus = quota?.userStatus || "FREE";
  } else {
    // Jika saya anggota, ambil status Admin dari data grup
    groupOwnerStatus = groupData?.admin?.userStatus || "FREE";
  }

  const isOwnerPremium = groupOwnerStatus === "PREMIUM" || groupOwnerStatus === "PREMIUM_YEARLY";

  // Limit Backend: Free = 10, Premium = 100 (Berdasarkan status Pemilik Grup)
  const MAX_DOCS = isOwnerPremium ? 100 : 10;
  const currentDocCount = documents.length;
  const isLimitReached = currentDocCount >= MAX_DOCS;
  const usagePercentage = Math.min((currentDocCount / MAX_DOCS) * 100, 100);

  // --- SOFT LOCK DETECTION ---
  const { canPerform: canCreateDoc, reason: createDocReason, isAtLimit: isDocLimitAtLimit } = useCanPerformAction("create_document", currentDocCount);

  // --- HANDLERS ---

  const handleUploadClick = () => {
    // Check soft lock
    if (!canCreateDoc) {
      setSoftLockError({
        message: createDocReason,
        actionType: "create_document",
        feature: "documents",
      });
      return;
    }

    if (isLimitReached) {
      if (isCurrentUserOwner) {
        toast.error(`Kapasitas Penuh (${MAX_DOCS} Dokumen). Upgrade ke Premium untuk limit 100 dokumen.`, { icon: "🔒", duration: 4000 });
      } else {
        toast.error("Grup ini telah mencapai batas penyimpanan. Hubungi Admin Grup.", { icon: "🔒" });
      }
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleAssignClick = () => {
    // Check soft lock
    if (!canCreateDoc) {
      setSoftLockError({
        message: createDocReason,
        actionType: "create_document",
        feature: "documents",
      });
      return;
    }

    if (isLimitReached) {
      toast.error("Limit Dokumen Grup Tercapai.", { icon: "🔒" });
      return;
    }
    setIsAssignModalOpen(true);
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = () => {
    if (docToDelete) {
      deleteDoc({ groupId, documentId: docToDelete.id });
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

  const handleManage = (doc) => {
    const docWithGroupInfo = {
      ...doc,
      groupId: groupId,
      group: {
        id: groupId,
        members: members,
      },
    };
    setSelectedDocForManage(docWithGroupInfo);
    setIsManagementModalOpen(true);
  };

  return (
    <div className="h-full w-full py-1">
      {/* --- MODALS --- */}
      <SoftLockError isOpen={!!softLockError} onClose={() => setSoftLockError(null)} errorMessage={softLockError?.message} actionType={softLockError?.actionType} feature={softLockError?.feature} />

      <AssignDocumentModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} groupId={groupId} documentsAlreadyInGroup={documents} members={members} />
      <UploadGroupDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} groupId={groupId} members={members} currentDocCount={currentDocCount} />

      {selectedDocForEdit && (
        <ManageSignersModal isOpen={isManageSignersOpen} onClose={() => setIsManageSignersOpen(false)} groupId={groupId} documentId={selectedDocForEdit.id} currentSigners={selectedDocForEdit.signerRequests || []} members={members} />
      )}

      {isManagementModalOpen && DocumentManagementModal && (
        <DocumentManagementModal mode="view" initialDocument={selectedDocForManage} currentUser={currentUser} onClose={() => setIsManagementModalOpen(false)} onSuccess={() => { }} initialTab="history" />
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

      <div className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        {/* HEADER CARD - UPDATED UI */}
        <div className="flex-none px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Dokumen</h3>

                {/* --- PREMIUM / FREE BADGE (Milik Group Owner) --- */}
                {isOwnerPremium ? (
                  <div className="relative group/badge cursor-default">
                    {/* Efek Glow di belakang */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full blur opacity-20 group-hover/badge:opacity-40 transition-opacity"></div>
                    {/* Badge Premium (Tanpa Ikon Mahkota) */}
                    <div className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-200 dark:border-amber-700/50 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wide shadow-sm">
                      <span>PREMIUM WORKSPACE</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <span>Free Plan</span>
                  </div>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola file dan status tanda tangan tim.</p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleAssignClick}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all shadow-sm
                ${isLimitReached
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-600 dark:border-slate-700"
                    : "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
              >
                {isLimitReached ? <HiLockClosed className="w-4 h-4" /> : <HiOutlineDocumentAdd className="w-4 h-4" />}
                <span>Pilih Draft</span>
              </button>

              <button
                onClick={handleUploadClick}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all transform
                ${isLimitReached
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none dark:bg-slate-700 dark:text-slate-500"
                    : "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95"
                  }`}
              >
                {isLimitReached ? <HiLockClosed className="w-4 h-4" /> : <HiOutlineUpload className="w-4 h-4" />}
                <span>Upload Baru</span>
              </button>
            </div>
          </div>

          {/* PROGRESS BAR - REFINED DESIGN */}
          <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className={isLimitReached ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}>
                  Penyimpanan ({currentDocCount} / {MAX_DOCS} Dokumen)
                </span>
                <span className={isLimitReached ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}>{Math.round(usagePercentage)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${isLimitReached ? "bg-red-500" : usagePercentage > 80 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-blue-400 to-indigo-500"
                    }`}
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
            </div>

            {/* LOGIKA PERBAIKAN DI SINI: Menyembunyikan tombol upgrade jika User SUDAH Premium */}
            {!isOwnerPremium && (
              <div className="text-xs text-right sm:max-w-[220px] bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                {isLimitReached ? (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <HiLockClosed className="w-3.5 h-3.5" />
                    {isCurrentUserPremium ? (
                      // KASUS A: Grup Penuh, tapi User Premium -> Beri info saja, jangan suruh upgrade
                      <span className="font-bold cursor-help" title="Penyimpanan grup ini dibatasi oleh paket Admin Grup">
                        Limit Grup Penuh
                      </span>
                    ) : (
                      // KASUS B: Grup Penuh, User Free -> Suruh upgrade (karena mungkin dia adminnya)
                      <Link to="/pricing" className="font-bold hover:underline">
                        Limit Penuh. Upgrade &rarr;
                      </Link>
                    )}
                  </div>
                ) : (
                  // Jika Limit Belum Penuh
                  !isCurrentUserPremium ? (
                    // User Free -> Tampilkan Upsell
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span>Butuh lebih? </span>
                      <Link to="/pricing" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        Upgrade ke Pro
                      </Link>
                    </div>
                  ) : (
                    // User Premium -> Tampilkan Info Mode Basic (Optional)
                    <div className="text-slate-400 italic text-[10px]">
                      Mode Basic (Milik Admin)
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* LIST DOKUMEN */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0f172a]/30 p-4 sm:p-6 [&::-webkit-scrollbar]:hidden">
          {documents.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4">
              {documents.map((doc) => {
                // Kalkulasi Logic
                const signersList = doc.signerRequests || doc.groupSigners || [];
                const totalSigners = signersList.length;
                const signedCount = signersList.filter((s) => s.status === "SIGNED").length;

                const isDocCompleted = doc.status === "completed" || doc.status === "archived";
                const isAllSigned = totalSigners > 0 && signedCount === totalSigners;
                const isWaitingForFinalization = isAllSigned && !isDocCompleted;

                const myRequest = signersList.find((req) => req.userId === currentUserId);
                const myStatus = myRequest ? myRequest.status : null;
                const showSignButton = myStatus === "PENDING" && !isDocCompleted;

                // [LOGIC UPDATE] Cek apakah User saat ini adalah PEMILIK dokumen ini
                const isOwner = doc.userId === currentUserId;

                // [LOGIC UPDATE] Hak Akses Manage (Edit/Delete/Finalize) = Admin Group ATAU Pemilik Dokumen
                const canManage = isAdmin || isOwner;

                return (
                  <li
                    key={doc.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                      {/* Left Info */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <HiOutlineDocumentText className="w-6 h-6" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link to={`/documents/${doc.id}/view`} className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 transition-colors block truncate">
                                {doc.title}
                              </Link>
                              {/* Badge Owner jika dokumen milik user sendiri */}
                              {isOwner && <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium">Milik Saya</span>}
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className={`inline-block w-2 h-2 rounded-full ${isDocCompleted ? "bg-emerald-500" : "bg-blue-500"}`}></span>
                              <span className="capitalize">{doc.status || "Draft"}</span> • v{doc.versions?.length || 1} • {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Status Bar */}
                        <div className="flex flex-wrap items-center gap-3 pl-[3.25rem]">
                          {/* Badge Status TTD User Sendiri */}
                          {showSignButton && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200/60">Perlu TTD</span>}
                          {(myStatus === "SIGNED" || isDocCompleted) && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <HiCheckCircle className="w-3.5 h-3.5" /> {isDocCompleted ? "Selesai" : "Sudah TTD"}
                            </span>
                          )}

                          {/* Badge Peringatan: Menunggu Finalisasi */}
                          {isWaitingForFinalization && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-50 text-yellow-700 border border-yellow-200/60 animate-pulse">
                              <HiExclamation className="w-3.5 h-3.5" /> Menunggu Finalisasi
                            </span>
                          )}

                          {/* Tooltip Signer Stats */}
                          <div className="relative group/tooltip">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-help hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                              <HiUserGroup className="w-3.5 h-3.5" />
                              {signedCount}/{totalSigners} Signed
                            </div>

                            <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 border border-slate-700">
                              <p className="font-bold mb-2 pb-1 border-b border-slate-600 text-slate-300">Status Signer:</p>
                              <ul className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                                {signersList.map((signer) => (
                                  <li key={signer.userId} className="flex justify-between items-center">
                                    <span className="truncate max-w-[120px]" title={signer.user?.name}>
                                      {signer.user?.name || "User"}
                                    </span>
                                    {signer.status === "SIGNED" ? <HiCheckCircle className="text-emerald-400 w-4 h-4" /> : <HiClock className="text-amber-400 w-4 h-4" />}
                                  </li>
                                ))}
                                {signersList.length === 0 && <li className="text-slate-500 italic">Belum ada signer</li>}
                              </ul>
                              <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="w-full sm:w-auto flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-700 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleManage(doc)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                          title="Riwayat Versi"
                        >
                          <FaHistory className="w-5 h-5" />
                        </button>

                        {/* [LOGIC UPDATE] Tombol Finalisasi muncul untuk Admin ATAU Owner */}
                        {canManage && isWaitingForFinalization && (
                          <button
                            onClick={() => handleFinalize(doc.id, doc.title)}
                            disabled={isFinalizing}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold uppercase rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/30 ring-2 ring-yellow-400/50 animate-pulse"
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

                        {/* [LOGIC UPDATE] Tombol Edit Signer & Delete muncul untuk Admin ATAU Owner */}
                        {canManage && (
                          <div className="flex gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-slate-700">
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