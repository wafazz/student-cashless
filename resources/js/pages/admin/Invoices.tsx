import { useForm, router } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { School } from 'types/models';
import { useState } from 'react';

interface Invoice {
    id: number;
    school_id: number;
    invoice_number: string;
    amount: number;
    period_start: string;
    period_end: string;
    due_date: string;
    status: 'unpaid' | 'paid' | 'overdue';
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    school?: School;
}

interface Props {
    invoices: {
        data: Invoice[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: {
        total_unpaid: number;
        total_overdue: number;
        total_paid: number;
    };
    filters: Record<string, string>;
}

export default function Invoices({ invoices, stats, filters }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm({ status: '', notes: '' });

    const startEdit = (invoice: Invoice) => {
        setEditingId(invoice.id);
        form.setData({ status: invoice.status, notes: invoice.notes || '' });
    };

    const handleUpdate = (id: number) => {
        form.put(`/admin/invoices/${id}`, { onSuccess: () => setEditingId(null) });
    };

    const filterByStatus = (status: string) => {
        router.get('/admin/invoices', status ? { status } : {}, { preserveState: true });
    };

    const statusColor = (status: string) => {
        if (status === 'paid') return 'bg-green-50 text-green-700';
        if (status === 'overdue') return 'bg-red-50 text-red-700';
        return 'bg-yellow-50 text-yellow-700';
    };

    return (
        <AdminLayout title="Invoices">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Invoices</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100 cursor-pointer hover:shadow-sm" onClick={() => filterByStatus('unpaid')}>
                    <p className="text-sm text-yellow-700">Unpaid</p>
                    <p className="text-2xl font-bold text-yellow-800 mt-1">RM {Number(stats.total_unpaid).toFixed(2)}</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 cursor-pointer hover:shadow-sm" onClick={() => filterByStatus('overdue')}>
                    <p className="text-sm text-red-700">Overdue</p>
                    <p className="text-2xl font-bold text-red-800 mt-1">RM {Number(stats.total_overdue).toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100 cursor-pointer hover:shadow-sm" onClick={() => filterByStatus('paid')}>
                    <p className="text-sm text-green-700">Paid</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">RM {Number(stats.total_paid).toFixed(2)}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                {['', 'unpaid', 'overdue', 'paid'].map(s => (
                    <button key={s} onClick={() => filterByStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${(filters.status || '') === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Invoice #</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Period</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Due Date</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoices.data.map(inv => (
                            <tr key={inv.id}>
                                {editingId === inv.id ? (
                                    <td colSpan={7} className="px-6 py-4">
                                        <div className="flex items-end gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 mb-1">{inv.invoice_number} — {inv.school?.name}</p>
                                                <p className="text-xs text-gray-500">RM {Number(inv.amount).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                                <select value={form.data.status} onChange={e => form.setData('status', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                    <option value="unpaid">Unpaid</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="overdue">Overdue</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                                                <input type="text" value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" placeholder="Payment ref..." />
                                            </div>
                                            <button onClick={() => handleUpdate(inv.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">Save</button>
                                            <button onClick={() => setEditingId(null)} className="border border-gray-300 px-4 py-2 rounded-xl text-sm">Cancel</button>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-mono text-gray-700">{inv.invoice_number}</td>
                                        <td className="px-6 py-4 text-gray-800">{inv.school?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right font-semibold">RM {Number(inv.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center text-gray-500 text-xs">
                                            {new Date(inv.period_start).toLocaleDateString('ms-MY')} - {new Date(inv.period_end).toLocaleDateString('ms-MY')}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {new Date(inv.due_date).toLocaleDateString('ms-MY')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusColor(inv.status)}`}>{inv.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => startEdit(inv)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.data.length === 0 && (
                    <p className="p-6 text-gray-500 text-center">No invoices yet. Invoices are auto-generated on the 1st of each month.</p>
                )}
            </div>

            {/* Pagination */}
            {invoices.last_page > 1 && (
                <div className="flex justify-center gap-1 mt-4">
                    {invoices.links.map((link: any, i: number) => (
                        <button key={i} disabled={!link.url || link.active}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`px-3 py-1.5 rounded-lg text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} disabled:opacity-50`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
