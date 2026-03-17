import { useForm, Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Student, School } from 'types/models';
import { useState } from 'react';

interface Props {
    students: Student[];
    schools: School[];
}

export default function Children({ students, schools }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({
        name: '',
        school_id: '',
        ic_number: '',
        class_name: '',
        daily_limit: '',
    });

    const editForm = useForm({
        name: '',
        school_id: '',
        ic_number: '',
        class_name: '',
        daily_limit: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/parent/children', {
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    };

    const startEdit = (student: Student) => {
        setEditingId(student.id);
        editForm.setData({
            name: student.name,
            school_id: String(student.school_id),
            ic_number: student.ic_number || '',
            class_name: student.class_name || '',
            daily_limit: student.daily_limit ? String(student.daily_limit) : '',
        });
    };

    const handleEdit = (e: React.FormEvent, studentId: number) => {
        e.preventDefault();
        editForm.put(`/parent/children/${studentId}`, {
            onSuccess: () => setEditingId(null),
        });
    };

    return (
        <ParentLayout title="My Children">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Children</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    {showForm ? 'Cancel' : '+ Add Child'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Add New Child</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={e => form.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                            {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                            <select
                                value={form.data.school_id}
                                onChange={e => form.setData('school_id', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="">Select School</option>
                                {schools.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">IC Number (Optional)</label>
                            <input
                                type="text"
                                value={form.data.ic_number}
                                onChange={e => form.setData('ic_number', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <input
                                type="text"
                                value={form.data.class_name}
                                onChange={e => form.setData('class_name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 3 Bestari"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit (RM)</label>
                            <input
                                type="number"
                                step="0.50"
                                min="0"
                                value={form.data.daily_limit}
                                onChange={e => form.setData('daily_limit', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Leave empty for no limit"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {form.processing ? 'Adding...' : 'Add Child'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Children List */}
            {students.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <p className="text-gray-500">No children added yet. Click "Add Child" to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {students.map((student) => (
                        <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            {editingId === student.id ? (
                                <form onSubmit={(e) => handleEdit(e, student.id)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editForm.data.name}
                                            onChange={e => editForm.setData('name', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                                        <select
                                            value={editForm.data.school_id}
                                            onChange={e => editForm.setData('school_id', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                            required
                                        >
                                            {schools.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IC Number</label>
                                        <input
                                            type="text"
                                            value={editForm.data.ic_number}
                                            onChange={e => editForm.setData('ic_number', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                        <input
                                            type="text"
                                            value={editForm.data.class_name}
                                            onChange={e => editForm.setData('class_name', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit (RM)</label>
                                        <input
                                            type="number"
                                            step="0.50"
                                            min="0"
                                            value={editForm.data.daily_limit}
                                            onChange={e => editForm.setData('daily_limit', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button type="submit" disabled={editForm.processing} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm disabled:opacity-50">Save</button>
                                        <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-4 py-2.5 rounded-xl text-sm">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{student.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {student.school?.name} &middot; {student.class_name || 'No class'}
                                        </p>
                                        <p className="text-lg font-bold text-blue-600 mt-1">
                                            RM {Number(student.wallet_balance).toFixed(2)}
                                        </p>
                                        {student.daily_limit && (
                                            <p className="text-xs text-gray-500">
                                                Daily limit: RM {Number(student.daily_limit).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/parent/children/${student.id}/qr`}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700"
                                        >
                                            QR Code
                                        </Link>
                                        <button
                                            onClick={() => startEdit(student)}
                                            className="border border-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </ParentLayout>
    );
}
