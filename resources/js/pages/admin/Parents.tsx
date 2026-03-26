import AdminLayout from 'layouts/AdminLayout';
import { User, Student } from 'types/models';

interface ParentUser extends User {
    students_count: number;
    students: { id: number; name: string; wallet_balance: number }[];
    total_balance: number;
}

interface Props {
    parents: ParentUser[];
}

export default function Parents({ parents }: Props) {
    return (
        <AdminLayout title="Parents">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Parents & Students</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Parent</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Phone</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Children</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Total Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {parents.map((parent, i) => (
                            <tr key={parent.id}>
                                <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{parent.name}</td>
                                <td className="px-6 py-4 text-gray-600">{parent.email}</td>
                                <td className="px-6 py-4 text-gray-600">{parent.phone || '-'}</td>
                                <td className="px-6 py-4">
                                    {parent.students.length === 0 ? (
                                        <span className="text-gray-400">None</span>
                                    ) : (
                                        <div className="space-y-1">
                                            {parent.students.map(s => (
                                                <div key={s.id} className="flex items-center justify-between">
                                                    <span className="text-gray-700">{s.name}</span>
                                                    <span className="text-xs text-blue-600 ml-2">RM {Number(s.wallet_balance).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-blue-600">
                                    RM {Number(parent.total_balance).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {parents.length === 0 && <p className="p-6 text-gray-500 text-center">No parents registered yet.</p>}
            </div>
        </AdminLayout>
    );
}
