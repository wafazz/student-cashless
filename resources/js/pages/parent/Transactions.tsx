import { Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Student, Transaction } from 'types/models';
import { formatDateTime } from 'utils/date';

interface Props {
    student: Student;
    transactions: {
        data: Transaction[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Transactions({ student, transactions }: Props) {
    return (
        <ParentLayout title={`Transactions - ${student.name}`}>
            <Link href="/parent/children" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
                &larr; Back to Children
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
                    <p className="text-sm text-gray-500">{student.school?.name} &middot; {student.class_name}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-xl font-bold text-blue-600">RM {Number(student.wallet_balance).toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {transactions.data.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No transactions yet.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {transactions.data.map((tx) => (
                                <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {tx.description || tx.type}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {tx.canteen?.name || 'Wallet'} &middot; {formatDateTime(tx.created_at)}
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

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                            {transactions.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
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
