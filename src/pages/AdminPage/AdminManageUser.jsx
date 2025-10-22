import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import { HiPencil, HiTrash, HiPlus } from "react-icons/hi";

// Komponen Modal untuk Tambah/Edit Pengguna
const UserModal = ({ isOpen, onClose, onSave, user, theme }) => {
  const [formData, setFormData] = useState({});
  const isEditMode = !!user;

  useEffect(() => {
    // Reset form setiap kali user atau mode berubah
    if (isEditMode) {
      setFormData({ name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin });
    } else {
      setFormData({ name: "", email: "", password: "", isSuperAdmin: false });
    }
  }, [user, isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md ${theme} transition-all`}>
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">{isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Nama</label>
            <input type="text" name="name" value={formData.name || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimal 8 karakter"
                value={formData.password || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>
          )}
          <div className="flex items-center">
            <input type="checkbox" id="isSuperAdmin" name="isSuperAdmin" checked={formData.isSuperAdmin || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="isSuperAdmin" className="ml-3 block text-sm text-slate-900 dark:text-gray-200">
              Jadikan Super Admin
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminManageUser = ({ theme }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, user: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await adminService.getAllUsers();
      setUsers(fetchedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error(error.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (formData) => {
    const promise = modalState.user ? adminService.updateUser(modalState.user.id, formData) : adminService.createUser(formData);

    toast.promise(promise, {
      loading: "Menyimpan data...",
      success: (res) => {
        fetchUsers();
        setModalState({ isOpen: false, user: null });
        return res.message || "Data berhasil disimpan!";
      },
      error: (err) => err.message || "Gagal menyimpan data.",
    });
  };

  const handleDeleteUser = (userId) => {
    const promise = adminService.deleteUser(userId);
    toast.promise(promise, {
      loading: "Menghapus pengguna...",
      success: () => {
        fetchUsers();
        setDeleteConfirm({ isOpen: false, userId: null });
        return "Pengguna berhasil dihapus!";
      },
      error: (err) => err.message || "Gagal menghapus pengguna.",
    });
  };

  return (
    <div className="mx-auto max-w-screen-xl space-y-6">
      <UserModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, user: null })} onSave={handleSaveUser} user={modalState.user} theme={theme} />

      {/* Confirmation Modal for Delete */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-sm ${theme}`}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setDeleteConfirm({ isOpen: false, userId: null })} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">
                Batal
              </button>
              <button onClick={() => handleDeleteUser(deleteConfirm.userId)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Pengguna</h1>
        <button onClick={() => setModalState({ isOpen: true, user: null })} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
          <HiPlus className="h-5 w-5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50/70 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Peran</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img src={user.profilePictureUrl || `https://i.pravatar.cc/40?u=${user.email}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isSuperAdmin ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                        }`}
                      >
                        {user.isSuperAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setModalState({ isOpen: true, user: user })}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, userId: user.id })}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 ml-2"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUser;
