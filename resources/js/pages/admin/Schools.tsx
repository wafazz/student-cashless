import { useForm } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { School } from 'types/models';
import { useState } from 'react';

interface Props {
    schools: (School & { students_count: number; canteens_count: number })[];
}

export default function Schools({ schools }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({ name: '', address: '', phone: '' });
    const editForm = useForm({
        name: '', address: '', phone: '', status: 'active',
        subscription_fee: '0', subscription_status: 'trial',
        subscription_start: '', subscription_end: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/schools', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (school: School) => {
        setEditingId(school.id);
        editForm.setData({
            name: school.name,
            address: school.address || '',
            phone: school.phone || '',
            status: school.status,
            subscription_fee: String(school.subscription_fee || 0),
            subscription_status: school.subscription_status || 'trial',
            subscription_start: school.subscription_start ? school.subscription_start.split('T')[0] : '',
            subscription_end: school.subscription_end ? school.subscription_end.split('T')[0] : '',
        });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/admin/schools/${id}`, { onSuccess: () => setEditingId(null) });
    };

    const subStatusColor = (status: string) => {
        if (status === 'active') return 'bg-green-50 text-green-700';
        if (status === 'trial') return 'bg-yellow-50 text-yellow-700';
        return 'bg-red-50 text-red-700';
    };

    return (
        <AdminLayout title="Schools">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Schools</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700"
                >
                    {showForm ? 'Cancel' : '+ Add School'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input type="text" value={form.data.address} onChange={e => form.setData('address', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Add</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Phone</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Students</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Stores</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Subscription</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schools.map((school, i) => (
                            <tr key={school.id}>
                                {editingId === school.id ? (
                                    <td colSpan={8} className="px-6 py-4">
                                        <form onSubmit={(e) => handleEdit(e, school.id)}>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                                                    <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Address</label>
                                                    <input type="text" value={editForm.data.address} onChange={e => editForm.setData('address', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                                    <input type="text" value={editForm.data.phone} onChange={e => editForm.setData('phone', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                                                    <select value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Subscription Fee (RM/month)</label>
                                                    <input type="number" step="0.01" min="0" value={editForm.data.subscription_fee}
                                                        onChange={e => editForm.setData('subscription_fee', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Subscription Status</label>
                                                    <select value={editForm.data.subscription_status}
                                                        onChange={e => editForm.setData('subscription_status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                        <option value="trial">Trial</option>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                                    <input type="date" value={editForm.data.subscription_start}
                                                        onChange={e => editForm.setData('subscription_start', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                                    <input type="date" value={editForm.data.subscription_end}
                                                        onChange={e => editForm.setData('subscription_end', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">Save</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-4 py-2 rounded-xl text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{school.name}</p>
                                            {school.address && <p className="text-xs text-gray-500">{school.address}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{school.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">{school.students_count}</td>
                                        <td className="px-6 py-4 text-center">{school.canteens_count}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${school.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {school.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${subStatusColor(school.subscription_status)}`}>
                                                {school.subscription_status}
                                            </span>
                                            {Number(school.subscription_fee) > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">RM {Number(school.subscription_fee).toFixed(2)}/mo</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => startEdit(school)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {schools.length === 0 && <p className="p-6 text-gray-500 text-center">No schools yet.</p>}
            </div>
        </AdminLayout>
    );
}
