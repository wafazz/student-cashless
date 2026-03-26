import { Link, router } from '@inertiajs/react';
import SchoolLayout from 'layouts/SchoolLayout';
import { PibgFee, PibgFeeParent, User } from 'types/models';
import { useState } from 'react';

interface Props {
    fee: PibgFee;
    assignments: (PibgFeeParent & { parent: User })[];
}

export default function PibgFeeDetail({ fee, assignments }: Props) {
    const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

    const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);
    const paidCount = assignments.filter(a => a.status === 'paid').length;
    const unpaidCount = assignments.filter(a => a.status === 'unpaid').length;

    const handleReassign = () => {
        router.post(`/school/pibg-fees/${fee.id}/reassign`);
    };

    const handleDelete = () => {
        if (confirm('Delete this fee? This cannot be undone.')) {
            router.delete(`/school/pibg-fees/${fee.id}`);
        }
    };

    return (
        <SchoolLayout title={fee.name}>
            <div className="flex items-center gap-3 mb-6">
                <Link href="/school/pibg-fees" className="text-teal-600 hover:underline text-sm">&larr; Back</Link>
            </div>

            {/* Fee Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{fee.name}</h1>
                        <p className="text-sm text-gray-500">{fee.academic_year} &middot; Due: {new Date(fee.due_date).toLocaleDateString('ms-MY')}</p>
                    </div>
                    <p className="text-3xl font-bold text-teal-600">RM {Number(fee.amount).toFixed(2)}</p>
                </div>
                {fee.description && <p className="text-sm text-gray-600 mb-4">{fee.description}</p>}
                <div className="flex gap-3 flex-wrap">
                    <div className="bg-green-50 px-4 py-2 rounded-xl text-sm"><span className="font-bold text-green-700">{paidCount}</span> <span className="text-green-600">Paid</span></div>
                    <div className="bg-amber-50 px-4 py-2 rounded-xl text-sm"><span className="font-bold text-amber-700">{unpaidCount}</span> <span className="text-amber-600">Unpaid</span></div>
                    <div className="bg-gray-50 px-4 py-2 rounded-xl text-sm"><span className="font-bold text-gray-700">{assignments.length}</span> <span className="text-gray-600">Total Families</span></div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleReassign} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
                        Reassign New Families
                    </button>
                    {paidCount === 0 && (
                        <button onClick={handleDelete} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100">
                            Delete Fee
                        </button>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                {(['all', 'paid', 'unpaid'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === f ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {f === 'all' ? `All (${assignments.length})` : f === 'paid' ? `Paid (${paidCount})` : `Unpaid (${unpaidCount})`}
                    </button>
                ))}
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Parent Name</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Phone</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Paid At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((a, i) => (
                            <tr key={a.id}>
                                <td className="px-6 py-3 text-gray-500">{i + 1}</td>
                                <td className="px-6 py-3 font-medium text-gray-800">{a.parent?.name}</td>
                                <td className="px-6 py-3 text-gray-600">{a.parent?.email}</td>
                                <td className="px-6 py-3 text-gray-600">{a.parent?.phone || '-'}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs ${a.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {a.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-gray-500 text-xs">{a.paid_at ? new Date(a.paid_at).toLocaleString('ms-MY') : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <p className="p-6 text-gray-500 text-center">No records found.</p>}
            </div>
        </SchoolLayout>
    );
}
