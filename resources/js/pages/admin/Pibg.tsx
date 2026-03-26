import AdminLayout from 'layouts/AdminLayout';
import { School } from 'types/models';

interface SchoolWithPibg extends School {
    pibg_fees_count: number;
    total_collected: number;
    total_outstanding: number;
}

interface Props {
    schools: SchoolWithPibg[];
}

export default function Pibg({ schools }: Props) {
    return (
        <AdminLayout title="PIBG Overview">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">PIBG Overview</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Fees</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Collected</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schools.map(school => (
                            <tr key={school.id}>
                                <td className="px-6 py-4 font-medium text-gray-800">{school.name}</td>
                                <td className="px-6 py-4 text-center">{school.pibg_fees_count}</td>
                                <td className="px-6 py-4 text-right text-green-600 font-semibold">RM {Number(school.total_collected).toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    {school.total_outstanding > 0 ? (
                                        <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">{school.total_outstanding} unpaid</span>
                                    ) : (
                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">All paid</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {schools.length === 0 && <p className="p-6 text-gray-500 text-center">No schools found.</p>}
            </div>
        </AdminLayout>
    );
}
