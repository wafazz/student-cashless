import { Link, router } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Student, Transaction } from 'types/models';
import { useState } from 'react';
import { formatDateTime } from 'utils/date';

interface Props {
    transactions: {
        data: Transaction[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    students: { id: number; name: string }[];
    filters: {
        student_id?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function AllTransactions({ transactions, students, filters }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        router.get('/parent/transactions', localFilters as any, { preserveState: true });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get('/parent/transactions');
    };

    return (
        <ParentLayout title="All Transactions">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Transactions</h1>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <select
                        value={localFilters.student_id || ''}
                        onChange={e => setLocalFilters({ ...localFilters, student_id: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                    >
                        <option value="">All (Children + Wallet)</option>
                        <option value="wallet">My Wallet</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

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

                    <input
                        type="date"
                        value={localFilters.date_from || ''}
                        onChange={e => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                    />

                    <input
                        type="date"
                        value={localFilters.date_to || ''}
                        onChange={e => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                    />
                </div>
                <div className="flex gap-2 mt-3">
                    <button onClick={applyFilters} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                        Filter
                    </button>
                    <button onClick={clearFilters} className="border border-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">
                        Clear
                    </button>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {transactions.data.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No transactions found.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {transactions.data.map((tx) => (
                                <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {tx.student?.name || 'My Wallet'} — {tx.description || tx.type}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {tx.canteen?.name || 'Wallet'}
                                            {tx.canteen?.type === 'koperasi' && <span className="ml-1 text-purple-600">(Koperasi)</span>}
                                            {' '}&middot; {formatDateTime(tx.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-semibold ${tx.type === 'topup' || tx.type === 'refund' ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type === 'topup' || tx.type === 'refund' ? '+' : '-'}RM {Number(tx.amount).toFixed(2)}
                                        </span>
                                        <p className="text-xs text-gray-400">Bal: RM {Number(tx.balance_after).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                            {transactions.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        link.active ? 'bg-blue-600 text-white' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </ParentLayout>
    );
}
