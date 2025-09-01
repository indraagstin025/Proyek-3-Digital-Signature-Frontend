import React, { useState } from 'react';
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal';

const DashboardWorkspaces = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState([
    { id: 1, name: "Proyek Peluncuran Q3", status: "Active", docs: 8, members: 5, description: "Grup untuk koordinasi peluncuran produk kuartal ketiga." },
    // Tambahkan data grup lain jika ada
  ]);

  const handleCreateGroup = (newGroup) => {
    const newGroupWithId = { ...newGroup, id: groups.length + 1, docs: 0, members: 1, status: 'Active' };
    setGroups([newGroupWithId, ...groups]);
  };

  return (
    <>
      <div id="tab-workspaces">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Grup Saya</h3>
          <button onClick={() => setIsModalOpen(true)} className="text-sm bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span>Buat Grup Baru</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <a key={group.id} href="#" className="relative bento-card bg-gray-900 p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:bg-gray-800/80 hover:border-blue-500/30 border border-transparent">
              {/* ... sisa JSX untuk card grup ... */}
              <h4 className="text-xl font-bold text-white">{group.name}</h4>
              <p className="mt-2 text-sm text-gray-400 h-10">{group.description}</p>
            </a>
          ))}
        </div>
      </div>
      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGroupCreate={handleCreateGroup} />
    </>
  );
};

export default DashboardWorkspaces;