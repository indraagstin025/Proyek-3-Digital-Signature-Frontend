import React, { useState } from 'react';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCreate = () => {
    onGroupCreate({ name: groupName, description: groupDescription });
    setGroupName('');
    setGroupDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Buat Grup Baru</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-400 mb-1">Nama Grup</label>
            <input type="text" id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
            <textarea id="groupDescription" value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">Batal</button>
          <button onClick={handleCreate} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Buat</button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;