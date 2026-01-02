// File: components/Group/AcceptInviteLinks.jsx

import React, { useEffect, useRef } from "react"; // ✅ 1. Impor 'useRef'
import { useNavigate } from "react-router-dom";
import { useAcceptInvitation } from "../../hooks/Group/useGroups"; // Sesuaikan path
import toast from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im";

export const AcceptInviteLinks = ({ token, onDone }) => {
  const navigate = useNavigate();

  // ✅ 2. Buat 'ref' untuk menyimpan ID toast
  const loadingToastId = useRef(null);

  const { mutate: acceptInvite, isPending, isError, error, isSuccess } = useAcceptInvitation();

  // Handler saat sukses
  useEffect(() => {
    if (isSuccess) {
      // ✅ 3. Perbarui toast yang ada, JANGAN buat yang baru
      toast.success("Berhasil bergabung dengan grup!", {
        id: loadingToastId.current,
      });
      onDone(); // Tutup modal
      // Redirect ke halaman workspace setelah 500ms
      setTimeout(() => {
        navigate("/dashboard/workspaces");
      }, 500);
    }
  }, [isSuccess, onDone, navigate]);

  // Handler saat error
  useEffect(() => {
    if (isError) {
      const errorMessage = error?.response?.data?.message || "Gagal bergabung";

      // ✅ 3. Perbarui toast yang ada, JANGAN buat yang baru
      toast.error(errorMessage, {
        id: loadingToastId.current,
      });
      onDone(); // Tutup modal
    }
  }, [isError, error, onDone]);

  // Fungsi klik
  const handleAccept = () => {
    // ✅ 4. Simpan ID toast ke dalam 'ref'
    loadingToastId.current = toast.loading("Bergabung...");
    acceptInvite(token);
  };

  const handleDecline = () => {
    onDone(); // Tutup saja
  };

  // --- JSX (Sudah benar) ---
  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-50 w-full max-w-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Undangan Grup</h2>
        <p className="text-slate-600 dark:text-gray-400 mb-6">Anda telah diundang untuk bergabung ke grup.</p>

        <div className="flex gap-4">
          <button onClick={handleDecline} disabled={isPending} className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-slate-800 dark:text-white hover:bg-gray-300 disabled:opacity-50">
            Nanti
          </button>
          <button onClick={handleAccept} disabled={isPending} className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
            {isPending ? <ImSpinner9 className="animate-spin h-5 w-5" /> : "Terima Undangan"}
          </button>
        </div>
      </div>
    </div>
  );
};
