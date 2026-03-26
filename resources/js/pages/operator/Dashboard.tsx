import { Link } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, Transaction } from 'types/models';

interface Props {
    canteen: Canteen | null;
    todaySales: number;
    todayTransactions: number;
    recentTransactions: Transaction[];
}

export default function Dashboard({ canteen, todaySales, todayTransactions, recentTransactions }: Props) {
    if (!canteen) {
        return (
            <OperatorLayout title="Dashboard">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-6xl mb-4">🏪</p>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Store Assigned</h2>
                        <p className="text-gray-500">Contact admin to assign a store to your account.</p>
                    </div>
                </div>
            </OperatorLayout>
        );
    }

    return (
        <OperatorLayout title="Dashboard">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-800">{canteen.name}</h1>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            canteen.type === 'koperasi' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
                        }`}>
                            {canteen.type === 'koperasi' ? 'Koperasi' : 'Kantin'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{canteen.school?.name}</p>
                </div>
                <Link
                    href="/operator/scan"
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors text-lg"
                >
                    Scan & Charge
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Today's Sales</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">RM {Number(todaySales).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Transactions Today</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{todayTransactions}</p>
                </div>
            </div>

            {/* Recent */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {recentTransactions.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No transactions today. Start scanning!</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{tx.student?.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {tx.description || tx.type} &middot; {new Date(tx.created_at).toLocaleTimeString('ms-MY')}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">
                                    RM {Number(tx.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </OperatorLayout>
    );
}
