import { router, Link } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, Transaction } from 'types/models';
import { useState } from 'react';

interface Props {
    canteen: Canteen | null;
    transactions: {
        data: Transaction[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    summary: { total: number; count: number };
    date: string;
}

export default function Sales({ canteen, transactions, summary, date }: Props) {
    const [selectedDate, setSelectedDate] = useState(date);

    const changeDate = (newDate: string) => {
        setSelectedDate(newDate);
        router.get('/operator/sales', { date: newDate }, { preserveState: true });
    };

    if (!canteen) {
        return (
            <OperatorLayout title="Sales">
                <div className="text-center py-12">
                    <p className="text-gray-500">No store assigned.</p>
                </div>
            </OperatorLayout>
        );
    }

    return (
        <OperatorLayout title="Daily Sales">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Daily Sales Report</h1>

            {/* Date Picker */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => changeDate(new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split('T')[0])}
                    className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                    &larr;
                </button>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => changeDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl outline-none"
                />
                <button
                    onClick={() => changeDate(new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0])}
                    className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                    &rarr;
                </button>
                <button
                    onClick={() => changeDate(new Date().toISOString().split('T')[0])}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
                >
                    Today
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">RM {Number(summary.total).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{summary.count}</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {transactions.data.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No sales on this date.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {transactions.data.map((tx) => (
                                <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{tx.student?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {tx.description || 'Purchase'} &middot; {new Date(tx.created_at).toLocaleTimeString('ms-MY')}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">
                                        RM {Number(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                            {transactions.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        link.active ? 'bg-green-600 text-white' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </OperatorLayout>
    );
}
