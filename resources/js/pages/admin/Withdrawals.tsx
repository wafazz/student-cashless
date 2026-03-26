import { Link, router } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { Withdrawal } from 'types/models';
import { useState } from 'react';
import { formatDateTime } from 'utils/date';

interface Props {
    withdrawals: {
        data: Withdrawal[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: { pending: number; pendingAmount: number; totalPaid: number; totalFees: number };
    filters: { status?: string; entity_type?: string };
}

export default function Withdrawals({ withdrawals, stats, filters }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [payRef, setPayRef] = useState('');
    const [payingId, setPayingId] = useState<number | null>(null);

    const applyFilters = () => {
        router.get('/admin/withdrawals', localFilters as any, { preserveState: true });
    };

    const handleApprove = (id: number) => {
        if (confirm('Approve this withdrawal?')) router.post(`/admin/withdrawals/${id}/approve`);
    };

    const handleReject = (id: number) => {
        const reason = prompt('Reason for rejection (optional):');
        router.post(`/admin/withdrawals/${id}/reject`, { admin_notes: reason || '' });
    };

    const handleMarkPaid = (id: number) => {
        if (!payRef.trim()) { alert('Enter payment reference'); return; }
        router.post(`/admin/withdrawals/${id}/paid`, { payment_reference: payRef }, {
            onSuccess: () => { setPayingId(null); setPayRef(''); },
        });
    };

    const statusColor = (s: string) => {
        if (s === 'paid') return 'bg-green-50 text-green-700';
        if (s === 'approved') return 'bg-blue-50 text-blue-700';
        if (s === 'rejected') return 'bg-red-50 text-red-700';
        return 'bg-amber-50 text-amber-700';
    };

    return (
        <AdminLayout title="Withdrawals">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Withdrawal Management</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                    <p className="text-sm text-amber-700">Pending</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                    <p className="text-xs text-amber-500">RM {Number(stats.pendingAmount).toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
                    <p className="text-sm text-green-700">Total Paid Out</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">RM {Number(stats.totalPaid).toFixed(2)}</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
                    <p className="text-sm text-indigo-700">Platform Fees Earned</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">RM {Number(stats.totalFees).toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <select value={localFilters.status || ''} onChange={e => setLocalFilters({ ...localFilters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select value={localFilters.entity_type || ''} onChange={e => setLocalFilters({ ...localFilters, entity_type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                    <option value="">All Types</option>
                    <option value="store">Stores</option>
                    <option value="school">Schools</option>
                </select>
                <button onClick={applyFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Filter</button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Entity</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Type</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Fee</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Net</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Bank</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {withdrawals.data.map(w => (
                            <tr key={w.id}>
                                <td className="px-6 py-3 font-medium text-gray-800">{w.entity_name}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${w.entity_type === 'school' ? 'bg-teal-50 text-teal-700' : 'bg-green-50 text-green-700'}`}>
                                        {w.entity_type}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">RM {Number(w.amount).toFixed(2)}</td>
                                <td className="px-6 py-3 text-right text-indigo-600">RM {Number(w.platform_fee).toFixed(2)}</td>
                                <td className="px-6 py-3 text-right font-semibold">RM {Number(w.net_amount).toFixed(2)}</td>
                                <td className="px-6 py-3 text-gray-600 text-xs">{w.bank_name}<br />{w.bank_account}<br />{w.bank_holder}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(w.status)}`}>{w.status}</span>
                                    {w.payment_reference && <p className="text-xs text-green-600 mt-1">Ref: {w.payment_reference}</p>}
                                </td>
                                <td className="px-6 py-3 text-gray-500 text-xs">{formatDateTime(w.requested_at)}</td>
                                <td className="px-6 py-3 text-right">
                                    {w.status === 'pending' && (
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleApprove(w.id)} className="text-blue-600 hover:underline text-xs">Approve</button>
                                            <button onClick={() => handleReject(w.id)} className="text-red-500 hover:underline text-xs">Reject</button>
                                        </div>
                                    )}
                                    {w.status === 'approved' && (
                                        payingId === w.id ? (
                                            <div className="flex gap-1">
                                                <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs w-28 outline-none" placeholder="Bank ref" />
                                                <button onClick={() => handleMarkPaid(w.id)} className="text-green-600 hover:underline text-xs">Confirm</button>
                                                <button onClick={() => setPayingId(null)} className="text-gray-400 text-xs">X</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setPayingId(w.id)} className="text-green-600 hover:underline text-xs">Mark Paid</button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {withdrawals.data.length === 0 && <p className="p-6 text-gray-500 text-center">No withdrawals found.</p>}

                {withdrawals.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                        {withdrawals.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'}
                                className={`px-3 py-1 rounded-lg text-sm ${link.active ? 'bg-indigo-600 text-white' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
