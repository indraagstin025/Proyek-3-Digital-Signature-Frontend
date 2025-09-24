import React, { useState } from 'react';
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal';

const DashboardWorkspaces = ({ theme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. Memperbarui data dummy agar lebih bervariasi untuk tampilan
  const [groups, setGroups] = useState([
    { id: 1, name: "Peluncuran Proyek 3", docs: 2, members: 2, description: "Grup untuk koordinasi peluncuran proyek 3." },
    { id: 2, name: "Tim Marketing Digital", docs: 12, members: 3, description: "Semua aset dan campaign untuk promosi digital." },
    { id: 3, name: "Pengembangan Internal", docs: 25, members: 8, description: "Workspace khusus untuk tim developer internal." },
  ]);

  const handleCreateGroup = (newGroup) => {
    const newGroupWithId = { ...newGroup, id: groups.length + 1, docs: 0, members: 1 };
    setGroups([newGroupWithId, ...groups]);
  };

  return (
    <>
      <div id="tab-workspaces">
        {/* 2. Menyeragamkan tampilan Header seperti di halaman Dokumen */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Workspace Anda</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Berkolaborasi dengan tim dalam grup kerja.</p>
            </div>
<button 
  onClick={() => setIsModalOpen(true)} 
  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-2 px-4 rounded-full hover:opacity-90 transition-opacity transform hover:scale-[1.02] duration-300 w-full sm:w-auto"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
  <span>Buat Grup Baru</span>
</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            // 3. Memperbarui desain "Workspace Card"
            <a
              key={group.id}
              href="#"
              className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700/50 
                         flex flex-col justify-between min-h-[220px] group transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* 4. Bagian Atas Kartu: Judul & Deskripsi */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{group.name}</h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 h-10">{group.description}</p>
              </div>

              {/* 5. Bagian Bawah Kartu (BARU): Statistik & Avatar */}
              <div className="mt-4">
                {/* Menampilkan jumlah dokumen & anggota */}
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <span>{group.docs} Dokumen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{group.members} Anggota</span>
                    </div>
                </div>

                {/* Menampilkan avatar anggota (contoh) */}
                <div className="flex items-center">
                    <img className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800" src="https://i.pravatar.cc/40?img=1" alt="Member 1" />
                    <img className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 -ml-3" src="https://i.pravatar.cc/40?img=2" alt="Member 2" />
                    <img className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 -ml-3" src="https://i.pravatar.cc/40?img=3" alt="Member 3" />
                    {group.members > 3 && (
                        <div className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 -ml-3 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                            +{group.members - 3}
                        </div>
                    )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGroupCreate={handleCreateGroup} theme={theme} />
    </>
  );
};

export default DashboardWorkspaces;