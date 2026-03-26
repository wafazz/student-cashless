import { Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Student, Transaction } from 'types/models';

interface Props {
    students: Student[];
    totalBalance: number;
    todaySpent: number;
    walletBalance: number;
    recentTransactions: Transaction[];
}

export default function Dashboard({ students, totalBalance, todaySpent, walletBalance, recentTransactions }: Props) {
    return (
        <ParentLayout title="Dashboard">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* General Wallet */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white flex items-center justify-between">
                <div>
                    <p className="text-sm text-blue-200">My General Wallet</p>
                    <p className="text-3xl font-bold mt-1">RM {Number(walletBalance).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/parent/wallet/topup" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                        + Top Up
                    </Link>
                    <Link href="/parent/wallet/qr" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                        My QR
                    </Link>
                    <Link href="/parent/wallet" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                        Transfer
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Children's Total Balance</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">RM {Number(totalBalance).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Today's Spending</p>
                    <p className="text-3xl font-bold text-orange-500 mt-1">RM {Number(todaySpent).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Children</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{students.length}</p>
                </div>
            </div>

            {/* Children Cards */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">My Children</h2>
            {students.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 mb-4">No children added yet.</p>
                    <Link href="/parent/children" className="text-blue-600 font-medium hover:underline">
                        Add your first child
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {students.map((student) => (
                        <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800">{student.name}</h3>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                    {student.class_name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{student.school?.name}</p>
                            <p className="text-2xl font-bold text-blue-600 mb-1">
                                RM {Number(student.wallet_balance).toFixed(2)}
                            </p>
                            {student.daily_limit && (
                                <p className="text-xs text-gray-500">
                                    Spent today: RM {Number(student.daily_spent).toFixed(2)} / RM {Number(student.daily_limit).toFixed(2)}
                                </p>
                            )}
                            <div className="flex gap-2 mt-4">
                                <Link
                                    href={`/parent/children/${student.id}/qr`}
                                    className="flex-1 text-center bg-blue-600 text-white text-sm py-2 rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    View QR
                                </Link>
                                <Link
                                    href={`/parent/children/${student.id}/transactions`}
                                    className="flex-1 text-center border border-gray-300 text-gray-700 text-sm py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    History
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Transactions */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {recentTransactions.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No transactions yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {tx.student?.name} — {tx.description || tx.type}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {tx.canteen?.name || 'Wallet'}
                                        {tx.canteen?.type === 'koperasi' && <span className="ml-1 text-purple-600">(Koperasi)</span>}
                                        {' '}&middot; {new Date(tx.created_at).toLocaleString('ms-MY')}
                                    </p>
                                </div>
                                <span className={`text-sm font-semibold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-500'}`}>
                                    {tx.type === 'topup' ? '+' : '-'}RM {Number(tx.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ParentLayout>
    );
}
