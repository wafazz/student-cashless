import { Link, router } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { SubscriptionPayment, School, SubscriptionPackage } from 'types/models';
import { useState } from 'react';

interface Payment extends SubscriptionPayment {
    school: School;
    package: SubscriptionPackage;
}

interface Props {
    payments: {
        data: Payment[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    pendingCount: number;
    filters: { status?: string };
}

export default function SubscriptionPayments({ payments, pendingCount, filters }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => router.get('/admin/subscription-payments', localFilters as any, { preserveState: true });

    const handleApprove = (id: number) => {
        if (confirm('Approve this payment and activate the school subscription?')) {
            router.post(`/admin/subscription-payments/${id}/approve`);
        }
    };

    const handleReject = (id: number) => {
        const reason = prompt('Reason for rejection:');
        if (reason !== null) {
            router.post(`/admin/subscription-payments/${id}/reject`, { admin_notes: reason });
        }
    };

    const statusColor = (s: string) => {
        if (s === 'approved') return 'bg-green-50 text-green-700';
        if (s === 'rejected') return 'bg-red-50 text-red-700';
        return 'bg-amber-50 text-amber-700';
    };

    return (
        <AdminLayout title="Subscription Payments">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Subscription Payments</h1>
                {pendingCount > 0 && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {pendingCount} pending
                    </span>
                )}
            </div>

            <div className="flex gap-3 mb-6">
                <select value={localFilters.status || ''} onChange={e => setLocalFilters({ ...localFilters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={applyFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Filter</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Package</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Receipt</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.data.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 font-medium text-gray-800">{p.school?.name}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {p.package?.name}
                                    <span className="text-xs text-gray-400 ml-1">({p.package?.billing_cycle})</span>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-teal-600">RM {Number(p.amount).toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <a href={`/storage/${p.receipt_path}`} target="_blank" className="text-blue-600 hover:underline text-xs">View</a>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                                    {p.admin_notes && <p className="text-xs text-red-400 mt-1">{p.admin_notes}</p>}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(p.created_at).toLocaleString('ms-MY')}</td>
                                <td className="px-6 py-4 text-right">
                                    {p.status === 'pending' && (
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => handleApprove(p.id)} className="text-green-600 hover:underline text-xs font-medium">Approve</button>
                                            <button onClick={() => handleReject(p.id)} className="text-red-500 hover:underline text-xs">Reject</button>
                                        </div>
                                    )}
                                    {p.status === 'approved' && p.approved_at && (
                                        <span className="text-xs text-gray-400">Approved {new Date(p.approved_at).toLocaleDateString('ms-MY')}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.data.length === 0 && <p className="p-6 text-gray-500 text-center">No subscription payments found.</p>}

                {payments.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                        {payments.links.map((link, i) => (
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
