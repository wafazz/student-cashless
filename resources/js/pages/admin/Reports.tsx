import { router } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { useState } from 'react';

interface Props {
    schoolSales: { id: number; name: string; total_students: number; sales: number; topups: number; transactions: number }[];
    canteenSales: { id: number; name: string; type: string; school: string; operator: string; sales: number; transactions: number }[];
    topSpenders: { name: string; school: string; class: string; spent: number; balance: number }[];
    totals: { sales: number; topups: number; refunds: number };
    filters: { date_from: string; date_to: string };
}

export default function Reports({ schoolSales, canteenSales, topSpenders, totals, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const applyFilter = () => {
        router.get('/admin/reports', { date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    };

    return (
        <AdminLayout title="Reports">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

            {/* Date Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-end gap-3 flex-wrap">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                    </div>
                    <button onClick={applyFilter} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                        Apply
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">RM {totals.sales.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Top Ups</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">RM {totals.topups.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Refunds</p>
                    <p className="text-3xl font-bold text-orange-500 mt-1">RM {totals.refunds.toFixed(2)}</p>
                </div>
            </div>

            {/* Sales by School */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by School</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Students</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Sales</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Top Ups</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Transactions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schoolSales.map(school => (
                            <tr key={school.id}>
                                <td className="px-6 py-3 font-medium text-gray-800">{school.name}</td>
                                <td className="px-6 py-3 text-center">{school.total_students}</td>
                                <td className="px-6 py-3 text-right text-green-600 font-semibold">RM {school.sales.toFixed(2)}</td>
                                <td className="px-6 py-3 text-right text-blue-600">RM {school.topups.toFixed(2)}</td>
                                <td className="px-6 py-3 text-center">{school.transactions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {schoolSales.length === 0 && <p className="p-6 text-gray-500 text-center">No data.</p>}
            </div>

            {/* Sales by Store */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Store</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Store</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Type</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Operator</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Sales</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Transactions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {canteenSales.map(canteen => (
                            <tr key={canteen.id}>
                                <td className="px-6 py-3 font-medium text-gray-800">{canteen.name}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        canteen.type === 'koperasi' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
                                    }`}>
                                        {canteen.type === 'koperasi' ? 'Koperasi' : 'Kantin'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-gray-600">{canteen.school}</td>
                                <td className="px-6 py-3 text-gray-600">{canteen.operator}</td>
                                <td className="px-6 py-3 text-right text-green-600 font-semibold">RM {canteen.sales.toFixed(2)}</td>
                                <td className="px-6 py-3 text-center">{canteen.transactions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Top Spenders */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Spenders</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Student</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Class</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Spent</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {topSpenders.map((s, i) => (
                            <tr key={i}>
                                <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                                <td className="px-6 py-3 font-medium text-gray-800">{s.name}</td>
                                <td className="px-6 py-3 text-gray-600">{s.school}</td>
                                <td className="px-6 py-3 text-gray-600">{s.class || '-'}</td>
                                <td className="px-6 py-3 text-right text-red-500 font-semibold">RM {s.spent.toFixed(2)}</td>
                                <td className="px-6 py-3 text-right text-blue-600">RM {Number(s.balance).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {topSpenders.length === 0 && <p className="p-6 text-gray-500 text-center">No data.</p>}
            </div>
        </AdminLayout>
    );
}
