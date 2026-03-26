import { useForm, Link } from '@inertiajs/react';
import SchoolLayout from 'layouts/SchoolLayout';
import { PibgFee } from 'types/models';
import { useState } from 'react';

interface Props {
    fees: PibgFee[];
}

export default function PibgFees({ fees }: Props) {
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        name: '', amount: '', academic_year: '', due_date: '', description: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/school/pibg-fees', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    return (
        <SchoolLayout title="PIBG Fees">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">PIBG Fees</h1>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
                    {showForm ? 'Cancel' : '+ Create Fee'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">New PIBG Fee</h3>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Name</label>
                                <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. Yuran PIBG 2026" required />
                                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RM)</label>
                                <input type="number" step="0.50" min="1" value={form.data.amount} onChange={e => form.setData('amount', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                <input type="text" value={form.data.academic_year} onChange={e => form.setData('academic_year', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. 2026/2027" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input type="date" value={form.data.due_date} onChange={e => form.setData('due_date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea value={form.data.description} onChange={e => form.setData('description', e.target.value)}
                                rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none"
                                placeholder="Additional notes about this fee..." />
                        </div>
                        <button type="submit" disabled={form.processing}
                            className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Create & Assign to Families</button>
                    </form>
                </div>
            )}

            {fees.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <p className="text-gray-500">No fees created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fees.map(fee => {
                        const total = (fee.paid_count || 0) + (fee.unpaid_count || 0);
                        const progress = total > 0 ? Math.round(((fee.paid_count || 0) / total) * 100) : 0;
                        return (
                            <Link key={fee.id} href={`/school/pibg-fees/${fee.id}`}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">{fee.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs ${fee.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {fee.status}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-teal-600 mb-1">RM {Number(fee.amount).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{fee.academic_year} &middot; Due: {new Date(fee.due_date).toLocaleDateString('ms-MY')}</p>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>{fee.paid_count || 0} paid</span>
                                        <span>{fee.unpaid_count || 0} unpaid</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 text-right">{progress}% collected</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </SchoolLayout>
    );
}
