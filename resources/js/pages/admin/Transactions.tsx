import { Link, router } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { Transaction } from 'types/models';
import { useState } from 'react';
import { formatDateTime } from 'utils/date';

interface Props {
    transactions: {
        data: Transaction[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        type?: string;
        store_type?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function Transactions({ transactions, filters }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        router.get('/admin/transactions', localFilters as any, { preserveState: true });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get('/admin/transactions');
    };

    return (
        <AdminLayout title="Transactions">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Transactions</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <input
                        type="text"
                        value={localFilters.search || ''}
                        onChange={e => setLocalFilters({ ...localFilters, search: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                        placeholder="Search student..."
                    />
                    <select
                        value={localFilters.type || ''}
                        onChange={e => setLocalFilters({ ...localFilters, type: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="purchase">Purchase</option>
                        <option value="topup">Top Up</option>
                        <option value="refund">Refund</option>
                    </select>
                    <select
                        value={localFilters.store_type || ''}
                        onChange={e => setLocalFilters({ ...localFilters, store_type: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                    >
                        <option value="">All Stores</option>
                        <option value="canteen">Kantin</option>
                        <option value="koperasi">Koperasi</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    <input type="date" value={localFilters.date_from || ''}
                        onChange={e => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                    <input type="date" value={localFilters.date_to || ''}
                        onChange={e => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                </div>
                <div className="flex gap-2 mt-3">
                    <button onClick={applyFilters} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">Filter</button>
                    <button onClick={clearFilters} className="border border-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Clear</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {transactions.data.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No transactions found.</p>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Student</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Description</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Store</th>
                                    <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.data.map(tx => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-3 text-gray-500">{tx.id}</td>
                                        <td className="px-6 py-3 font-medium text-gray-800">{tx.student?.name}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                tx.type === 'topup' ? 'bg-green-50 text-green-700' :
                                                tx.type === 'purchase' ? 'bg-blue-50 text-blue-700' :
                                                'bg-orange-50 text-orange-700'
                                            }`}>{tx.type}</span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{tx.description || '-'}</td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {tx.canteen?.name || '-'}
                                            {tx.canteen?.type === 'koperasi' && <span className="ml-1 text-purple-600 text-xs">(Koperasi)</span>}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-semibold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type === 'topup' ? '+' : '-'}RM {Number(tx.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 text-xs">{formatDateTime(tx.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                            {transactions.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'}
                                    className={`px-3 py-1 rounded-lg text-sm ${link.active ? 'bg-indigo-600 text-white' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
