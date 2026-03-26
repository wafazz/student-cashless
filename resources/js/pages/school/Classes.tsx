import { useForm, router } from '@inertiajs/react';
import SchoolLayout from 'layouts/SchoolLayout';
import { SchoolClass } from 'types/models';
import { useState } from 'react';

interface Props {
    classes: (SchoolClass & { students_count: number })[];
}

export default function Classes({ classes }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({ name: '', level: '' });
    const editForm = useForm({ name: '', level: '', status: 'active' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/school/classes', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (c: SchoolClass) => {
        setEditingId(c.id);
        editForm.setData({ name: c.name, level: c.level || '', status: c.status });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/school/classes/${id}`, { onSuccess: () => setEditingId(null) });
    };

    const handleDelete = (c: SchoolClass) => {
        if (confirm(`Delete class "${c.name}"?`)) {
            router.delete(`/school/classes/${c.id}`);
        }
    };

    return (
        <SchoolLayout title="Classes">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
                    {showForm ? 'Cancel' : '+ Add Class'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. 3 Bestari" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level (Optional)</label>
                            <input type="text" value={form.data.level} onChange={e => form.setData('level', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. Tahun 3" />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={form.processing}
                                className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Add</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Class Name</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Level</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Students</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {classes.map((c, i) => (
                            <tr key={c.id}>
                                {editingId === c.id ? (
                                    <td colSpan={6} className="px-6 py-4">
                                        <form onSubmit={(e) => handleEdit(e, c.id)} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                            <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <input type="text" value={editForm.data.level} onChange={e => editForm.setData('level', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" placeholder="Level" />
                                            <select value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-teal-600 text-white px-3 py-2 rounded-xl text-sm">Save</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-3 py-2 rounded-xl text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{c.level || '-'}</td>
                                        <td className="px-6 py-4 text-center">{c.students_count}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline text-sm mr-3">Edit</button>
                                            {c.students_count === 0 && (
                                                <button onClick={() => handleDelete(c)} className="text-red-500 hover:underline text-sm">Delete</button>
                                            )}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {classes.length === 0 && <p className="p-6 text-gray-500 text-center">No classes registered yet.</p>}
            </div>
        </SchoolLayout>
    );
}
