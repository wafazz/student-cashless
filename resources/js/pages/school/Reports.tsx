import SchoolLayout from 'layouts/SchoolLayout';
import { PibgFee, PibgFeeParent, User } from 'types/models';
import { formatDate } from 'utils/date';

interface FeeWithStats extends PibgFee {
    total_collected: number;
    total_expected: number;
}

interface Props {
    fees: FeeWithStats[];
    outstanding: (PibgFeeParent & { fee: PibgFee; parent: User })[];
}

export default function Reports({ fees, outstanding }: Props) {
    return (
        <SchoolLayout title="Reports">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">PIBG Reports</h1>

            {/* Collection Summary */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Collection Summary</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Fee Name</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Year</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Paid</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Unpaid</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Collected</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Expected</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {fees.map(fee => {
                            const progress = fee.total_expected > 0 ? Math.round((fee.total_collected / fee.total_expected) * 100) : 0;
                            return (
                                <tr key={fee.id}>
                                    <td className="px-6 py-3 font-medium text-gray-800">{fee.name}</td>
                                    <td className="px-6 py-3 text-gray-600">{fee.academic_year}</td>
                                    <td className="px-6 py-3 text-center text-green-600 font-semibold">{fee.paid_count}</td>
                                    <td className="px-6 py-3 text-center text-amber-600 font-semibold">{fee.unpaid_count}</td>
                                    <td className="px-6 py-3 text-right text-green-600 font-semibold">RM {Number(fee.total_collected).toFixed(2)}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">RM {Number(fee.total_expected).toFixed(2)}</td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-500">{progress}%</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {fees.length === 0 && <p className="p-6 text-gray-500 text-center">No fees created yet.</p>}
            </div>

            {/* Outstanding List */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Outstanding Fees ({outstanding.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Parent</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Phone</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Fee</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {outstanding.map(o => (
                            <tr key={o.id}>
                                <td className="px-6 py-3 font-medium text-gray-800">{o.parent?.name}</td>
                                <td className="px-6 py-3 text-gray-600">{o.parent?.phone || '-'}</td>
                                <td className="px-6 py-3 text-gray-600">{o.fee?.name}</td>
                                <td className="px-6 py-3 text-right text-amber-600 font-semibold">RM {Number(o.fee?.amount || 0).toFixed(2)}</td>
                                <td className="px-6 py-3 text-gray-500 text-xs">{o.fee?.due_date ? formatDate(o.fee.due_date) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {outstanding.length === 0 && <p className="p-6 text-gray-500 text-center">All fees collected!</p>}
            </div>
        </SchoolLayout>
    );
}
