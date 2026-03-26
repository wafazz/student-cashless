import SchoolLayout from 'layouts/SchoolLayout';
import { PibgFeeParent } from 'types/models';

interface Props {
    stats: {
        totalStudents: number;
        totalParents: number;
        totalStores: number;
        activeFees: number;
        totalExpected: number;
        totalPaid: number;
        totalCollected: number;
        totalOutstanding: number;
    };
    recentPayments: (PibgFeeParent & { fee: { name: string }; parent: { name: string; email: string } })[];
}

export default function Dashboard({ stats, recentPayments }: Props) {
    const progress = stats.totalExpected > 0 ? Math.round((stats.totalPaid / stats.totalExpected) * 100) : 0;

    return (
        <SchoolLayout title="Dashboard">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">School Dashboard</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Students" value={stats.totalStudents} color="blue" />
                <StatCard label="Families" value={stats.totalParents} color="teal" />
                <StatCard label="Stores" value={stats.totalStores} color="green" />
                <StatCard label="Active Fees" value={stats.activeFees} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
                    <p className="text-sm text-teal-100">Total Collected</p>
                    <p className="text-3xl font-bold mt-1">RM {Number(stats.totalCollected).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                    <p className="text-sm text-amber-100">Outstanding</p>
                    <p className="text-3xl font-bold mt-1">RM {Number(stats.totalOutstanding).toFixed(2)}</p>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {recentPayments.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No payments yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentPayments.map((p) => (
                            <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{p.parent?.name}</p>
                                    <p className="text-xs text-gray-500">{p.fee?.name} &middot; {p.paid_at ? new Date(p.paid_at).toLocaleString('ms-MY') : ''}</p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">RM {Number(p.amount_paid).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    const colors: Record<string, string> = { blue: 'text-blue-600', teal: 'text-teal-600', green: 'text-green-600', indigo: 'text-indigo-600' };
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${colors[color] || 'text-gray-800'}`}>{value}</p>
        </div>
    );
}
