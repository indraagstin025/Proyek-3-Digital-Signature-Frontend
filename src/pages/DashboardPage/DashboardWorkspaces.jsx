// File: src/pages/DashboardPage/DashboardWorkspaces.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom"; // ✅ 1. Impor Link
import CreateGroupModal from "../../components/CreateGroupModal/CreateGroupModal";
// ✅ 2. Impor custom hook baru kita
import { useGetGroups, useCreateGroup } from "../../hooks/useGroups";

// import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
// import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

const DashboardWorkspaces = ({ theme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ 3. GANTI dummy data 'useState' dengan 'useQuery' dari hook kita
  const { data: groups, isLoading, error } = useGetGroups();

  // ✅ 4. Siapkan MUTATION untuk membuat grup baru
  const { mutate: createGroup, isLoading: isCreatingGroup } = useCreateGroup();

  const handleCreateGroup = (groupDataFromModal) => {
    // 'groupDataFromModal' adalah { name: '...', description: '...' }
    // Service kita 'createGroup' hanya butuh 'name'
    if (!groupDataFromModal || !groupDataFromModal.name) return;

    // ✅ 5. GANTI logika 'setGroups' dengan memanggil mutasi
    createGroup(groupDataFromModal.name, {
      onSuccess: () => {
        setIsModalOpen(false); // Tutup modal jika sukses
      },
    });
  };

  // ✅ 6. Tampilkan status Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* <LoadingSpinner /> */}
        <p>Memuat workspaces Anda...</p>
      </div>
    );
  }

  // ✅ 7. Tampilkan status Error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {/* <ErrorMessage message={error.message} /> */}
        <p>Terjadi kesalahan: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div
  id="tab-overview"
  className="mx-auto max-w-screen-xl pt-10 sm:pt-20"
>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Workspace Anda</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Berkolaborasi dengan tim dalam grup kerja.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            // ✅ 8. Nonaktifkan tombol saat proses 'creating'
            disabled={isCreatingGroup}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-4 rounded-full hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 w-full sm:w-auto disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {/* Tampilkan teks berbeda saat loading */}
            <span>{isCreatingGroup ? "Membuat..." : "Buat Grup Baru"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ✅ 9. Perbarui perulangan 'map' untuk menggunakan <Link> */}
          {/* Pastikan 'groups' ada sebelum di-map */}
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              // Ganti <a> dengan <Link> dan arahkan ke halaman detail
              <Link
                key={group.id}
                // Arahkan ke rute halaman detail grup (yang akan kita buat)
                to={`../group/${group.id}`}
                className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700/50 
                                  flex flex-col justify-between min-h-[220px] group transition-all hover:shadow-xl hover:-translate-y-1"
              >
                {/* CATATAN PENTING:
                  API kita (getAllUserGroups) saat ini HANYA mengembalikan data
                  dasar grup (id, name). API-nya BELUM mengembalikan 'description',
                  'docs' (count), dan 'members' (count).

                  Untuk sementara, kita hanya akan tampilkan 'name'.
                  Nanti kita harus perbarui kueri Prisma di BACKEND untuk
                  menyertakan data ini (_count).
                */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{group.name}</h4>
                  {/* <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 h-10">{group.description}</p> */}
                </div>

                <div>
                  {/* Tampilkan 'placeholder' atau sembunyikan bagian ini sementara */}
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      {/* ... svg ... */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>{group.docs_count || 0} Dokumen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* ... svg ... */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{group.members_count || 1} Anggota</span>
                    </div>
                  </div>
                  {/* Bagian avatar juga bisa disembunyikan sementara */}
                </div>
              </Link> /* ✅ PERBAIKAN: Ini adalah tag penutup yang benar */
            ))
          ) : (
            // Tampilan jika tidak ada grup
            <p className="text-slate-500 dark:text-slate-400">Anda belum memiliki workspace. Silakan buat grup baru untuk memulai.</p>
          )}
        </div>
      </div>

      {/* ✅ 10. Hubungkan 'isLoading' ke Modal */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreate={handleCreateGroup}
        isLoading={isCreatingGroup} // <-- Prop baru
        theme={theme}
      />
    </>
  );
};

export default DashboardWorkspaces;
