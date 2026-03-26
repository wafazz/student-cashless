import { useForm } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, User } from 'types/models';
import { useState } from 'react';

interface StaffMember {
    id: number;
    canteen_id: number;
    user_id: number;
    position: 'cashier' | 'manager';
    status: 'active' | 'inactive';
    user: User;
    created_at: string;
}

interface Props {
    canteen: Canteen | null;
    staff: StaffMember[];
}

export default function Staff({ canteen, staff }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({ name: '', email: '', phone: '', password: '', position: 'cashier' });
    const editForm = useForm({ name: '', email: '', phone: '', position: 'cashier', status: 'active' });

    if (!canteen) {
        return (
            <OperatorLayout title="Staff">
                <p className="text-gray-500">No store assigned.</p>
            </OperatorLayout>
        );
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/operator/staff', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (s: StaffMember) => {
        setEditingId(s.id);
        editForm.setData({
            name: s.user.name,
            email: s.user.email,
            phone: s.user.phone || '',
            position: s.position,
            status: s.status,
        });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/operator/staff/${id}`, { onSuccess: () => setEditingId(null) });
    };

    return (
        <OperatorLayout title="Staff">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Staff</h1>
                    <p className="text-sm text-gray-500">{canteen.name}</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
                    {showForm ? 'Cancel' : '+ Add Staff'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">New Staff Member</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            {form.errors.email && <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="text" value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <select value={form.data.position} onChange={e => form.setData('position', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none">
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={form.processing}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
                                Add Staff
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Phone</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Position</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staff.map((s, i) => (
                            <tr key={s.id}>
                                {editingId === s.id ? (
                                    <td colSpan={7} className="px-6 py-4">
                                        <form onSubmit={(e) => handleEdit(e, s.id)} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                                            <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <input type="text" value={editForm.data.phone} onChange={e => editForm.setData('phone', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
                                            <select value={editForm.data.position} onChange={e => editForm.setData('position', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                <option value="cashier">Cashier</option>
                                                <option value="manager">Manager</option>
                                            </select>
                                            <select value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm">Save</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-3 py-2 rounded-xl text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{s.user.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{s.user.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{s.user.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${s.position === 'manager' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {s.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => startEdit(s)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {staff.length === 0 && <p className="p-6 text-gray-500 text-center">No staff yet. Add cashiers to help manage your store.</p>}
            </div>
        </OperatorLayout>
    );
}
