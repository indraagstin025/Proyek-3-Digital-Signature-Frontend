import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { HiSearch, HiFilter, HiRefresh } from 'react-icons/hi';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllReports();
            setReports(data || []);
        } catch (error) {
            toast.error("Gagal load laporan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await adminService.updateReportStatus(reportId, newStatus);
            toast.success(`Status diubah menjadi ${newStatus}`);
            fetchReports(); // Refresh data
        } catch (error) {
            toast.error("Gagal update status");
        }
    };

    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    // Filter Logic
    const filteredReports = reports.filter(report => {
        const matchStatus = filterStatus === 'ALL' || report.status === filterStatus;
        const matchSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Laporan & Masukan Pengguna</h1>
                <button
                    onClick={fetchReports}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <HiRefresh className={loading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari laporan..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <HiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">Semua Status</option>
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pelapor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Laporan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        Tidak ada laporan ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={report.user?.profilePictureUrl || 'https://i.pravatar.cc/150'}
                                                    className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
                                                    alt="avatar"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{report.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{report.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{report.title}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{report.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[report.status] || "bg-gray-100"}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                className="text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                                <option value="RESOLVED">RESOLVED</option>
                                                <option value="REJECTED">REJECTED</option>
                                            </select>
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

export default AdminReports;
