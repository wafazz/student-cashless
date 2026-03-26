import AdminLayout from 'layouts/AdminLayout';
import { Transaction } from 'types/models';
import { useState, useEffect } from 'react';

interface Props {
    stats: {
        totalSchools: number;
        totalStudents: number;
        totalParents: number;
        totalOperators: number;
        totalCanteens: number;
        totalKoperasi: number;
        todaySales: number;
        todayCanteenSales: number;
        todayKoperasiSales: number;
        todayTopups: number;
        todayTransactions: number;
        totalWalletBalance: number;
        totalServiceFees: number;
        todayServiceFees: number;
        monthlySubscriptionRevenue: number;
    };
    monthlyData: { month: string; sales: number; topups: number }[];
    recentTransactions: Transaction[];
}

export default function Dashboard({ stats, monthlyData, recentTransactions }: Props) {
    const [Chart, setChart] = useState<any>(null);

    useEffect(() => {
        import('react-apexcharts').then(mod => setChart(() => mod.default));
    }, []);

    const chartOptions = {
        chart: { type: 'bar' as const, toolbar: { show: false } },
        xaxis: { categories: monthlyData.map(d => d.month) },
        colors: ['#16a34a', '#2563eb'],
        plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        legend: { position: 'top' as const },
    };

    const chartSeries = [
        { name: 'Sales', data: monthlyData.map(d => d.sales) },
        { name: 'Top Ups', data: monthlyData.map(d => d.topups) },
    ];

    return (
        <AdminLayout title="Dashboard">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard label="Schools" value={stats.totalSchools} color="indigo" />
                <StatCard label="Students" value={stats.totalStudents} color="blue" />
                <StatCard label="Parents" value={stats.totalParents} color="green" />
                <StatCard label="Operators" value={stats.totalOperators} color="orange" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Kantin" value={stats.totalCanteens} color="green" />
                <StatCard label="Koperasi" value={stats.totalKoperasi} color="indigo" />
                <StatCard label="Today's Transactions" value={stats.todayTransactions} color="blue" />
                <StatCard label="Total Wallet Balance" value={`RM ${Number(stats.totalWalletBalance).toFixed(2)}`} color="orange" />
            </div>

            {/* Today's Sales Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Today's Total Sales" value={`RM ${Number(stats.todaySales).toFixed(2)}`} color="green" />
                <StatCard label="Kantin Sales" value={`RM ${Number(stats.todayCanteenSales).toFixed(2)}`} color="green" />
                <StatCard label="Koperasi Sales" value={`RM ${Number(stats.todayKoperasiSales).toFixed(2)}`} color="indigo" />
                <StatCard label="Today's Top Ups" value={`RM ${Number(stats.todayTopups).toFixed(2)}`} color="blue" />
            </div>

            {/* Revenue Stats */}
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Platform Revenue</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                    <p className="text-sm text-emerald-100">Total Service Fees Earned</p>
                    <p className="text-2xl font-bold mt-1">RM {Number(stats.totalServiceFees).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                    <p className="text-sm text-blue-100">Today's Service Fees</p>
                    <p className="text-2xl font-bold mt-1">RM {Number(stats.todayServiceFees).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
                    <p className="text-sm text-purple-100">Monthly Subscription Revenue</p>
                    <p className="text-2xl font-bold mt-1">RM {Number(stats.monthlySubscriptionRevenue).toFixed(2)}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Overview (Last 6 Months)</h2>
                {Chart && (
                    <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />
                )}
            </div>

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
        </AdminLayout>
    );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    const colors: Record<string, string> = {
        indigo: 'text-indigo-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
        orange: 'text-orange-500',
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${colors[color] || 'text-gray-800'}`}>{value}</p>
        </div>
    );
}
