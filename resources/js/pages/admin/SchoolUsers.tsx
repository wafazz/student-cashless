import { useForm } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { User, School } from 'types/models';
import { useState } from 'react';

interface SchoolUser extends User {
    school: School | null;
}

interface Props {
    users: SchoolUser[];
    schools: School[];
}

export default function SchoolUsers({ users, schools }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({ name: '', email: '', phone: '', password: '', school_id: '' });
    const editForm = useForm({ name: '', email: '', phone: '', school_id: '', status: 'active' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/school-users', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (u: SchoolUser) => {
        setEditingId(u.id);
        editForm.setData({ name: u.name, email: u.email, phone: u.phone || '', school_id: String(u.school_id || ''), status: u.status });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/admin/school-users/${id}`, { onSuccess: () => setEditingId(null) });
    };

    return (
        <AdminLayout title="School Users">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">School Users</h1>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                    {showForm ? 'Cancel' : '+ Add School User'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">New School User (PIBG Admin)</h3>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                                <select value={form.data.school_id} onChange={e => form.setData('school_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required>
                                    <option value="">Select School</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" disabled={form.processing}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Create School User</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id}>
                                {editingId === u.id ? (
                                    <td colSpan={5} className="px-6 py-4">
                                        <form onSubmit={(e) => handleEdit(e, u.id)} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                                            <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <select value={editForm.data.school_id} onChange={e => editForm.setData('school_id', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <select value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm">Save</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-3 py-2 rounded-xl text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{u.school?.name || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => startEdit(u)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="p-6 text-gray-500 text-center">No school users yet.</p>}
            </div>
        </AdminLayout>
    );
}
