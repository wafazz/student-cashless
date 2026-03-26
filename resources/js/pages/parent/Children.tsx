import { useForm, Link, router } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Student, School } from 'types/models';
import { useState, useRef } from 'react';

interface Props {
    students: Student[];
    schools: School[];
}

export default function Children({ students, schools }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        name: '',
        school_id: '',
        ic_number: '',
        class_name: '',
        daily_limit: '',
        photo: null as File | null,
    });

    const editForm = useForm({
        name: '',
        school_id: '',
        ic_number: '',
        class_name: '',
        daily_limit: '',
        photo: null as File | null,
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/parent/children', {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setShowForm(false);
                setPhotoPreview(null);
            },
        });
    };

    const startEdit = (student: Student) => {
        setEditingId(student.id);
        setEditPhotoPreview(null);
        editForm.setData({
            name: student.name,
            school_id: String(student.school_id),
            ic_number: student.ic_number || '',
            class_name: student.class_name || '',
            daily_limit: student.daily_limit ? String(student.daily_limit) : '',
            photo: null,
        });
    };

    const handleEdit = (e: React.FormEvent, studentId: number) => {
        e.preventDefault();
        router.post(`/parent/children/${studentId}`, {
            _method: 'PUT',
            ...editForm.data,
        }, {
            forceFormData: true,
            onSuccess: () => { setEditingId(null); setEditPhotoPreview(null); },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isEdit) {
            editForm.setData('photo', file);
            setEditPhotoPreview(URL.createObjectURL(file));
        } else {
            form.setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
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
                    <form onSubmit={handleAdd} className="space-y-4">
                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Child's Photo *</label>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                                <p className="text-sm text-blue-800 font-medium">Photo Requirements:</p>
                                <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                                    <li>Must be from <strong>head to waist</strong> (half-body shot)</li>
                                    <li>Must be wearing <strong>school uniform</strong></li>
                                    <li>Clear face, no sunglasses or mask</li>
                                    <li>JPG or PNG, max 5MB</li>
                                </ul>
                            </div>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img src={photoPreview} alt="Preview" className="w-24 h-32 object-cover rounded-xl border border-gray-200" />
                                        <button type="button" onClick={() => { setPhotoPreview(null); form.setData('photo', null); if (fileRef.current) fileRef.current.value = ''; }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">x</button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                                        onClick={() => fileRef.current?.click()}>
                                        <span className="text-2xl text-gray-400">📷</span>
                                        <span className="text-xs text-gray-400 mt-1">Upload</span>
                                    </div>
                                )}
                                <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden"
                                    onChange={e => handlePhotoChange(e, false)} />
                                {!photoPreview && (
                                    <button type="button" onClick={() => fileRef.current?.click()}
                                        className="text-sm text-blue-600 hover:underline">Choose photo</button>
                                )}
                            </div>
                            {form.errors.photo && <p className="text-red-500 text-xs mt-2">{form.errors.photo}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                                <select value={form.data.school_id} onChange={e => form.setData('school_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required>
                                    <option value="">Select School</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IC Number</label>
                                <input type="text" value={form.data.ic_number} onChange={e => form.setData('ic_number', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <input type="text" value={form.data.class_name} onChange={e => form.setData('class_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 3 Bestari" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit (RM)</label>
                                <input type="number" step="0.50" min="0" value={form.data.daily_limit} onChange={e => form.setData('daily_limit', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Leave empty for no limit" />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" disabled={form.processing}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {form.processing ? 'Adding...' : 'Add Child'}
                                </button>
                            </div>
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
                                <form onSubmit={(e) => handleEdit(e, student.id)} className="space-y-4">
                                    {/* Edit Photo */}
                                    <div className="flex items-center gap-4">
                                        {editPhotoPreview || student.photo ? (
                                            <img src={editPhotoPreview || `/storage/${student.photo}`} alt={student.name}
                                                className="w-20 h-28 object-cover rounded-xl border border-gray-200" />
                                        ) : (
                                            <div className="w-20 h-28 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <span className="text-2xl">👤</span>
                                            </div>
                                        )}
                                        <div>
                                            <input ref={editFileRef} type="file" accept="image/jpeg,image/png" className="hidden"
                                                onChange={e => handlePhotoChange(e, true)} />
                                            <button type="button" onClick={() => editFileRef.current?.click()}
                                                className="text-sm text-blue-600 hover:underline">Change Photo</button>
                                            <p className="text-xs text-gray-400 mt-1">Head to waist, school uniform</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                                            <select value={editForm.data.school_id} onChange={e => editForm.setData('school_id', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required>
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">IC Number</label>
                                            <input type="text" value={editForm.data.ic_number} onChange={e => editForm.setData('ic_number', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                            <input type="text" value={editForm.data.class_name} onChange={e => editForm.setData('class_name', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit (RM)</label>
                                            <input type="number" step="0.50" min="0" value={editForm.data.daily_limit} onChange={e => editForm.setData('daily_limit', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <button type="submit" disabled={editForm.processing} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm disabled:opacity-50">Save</button>
                                            <button type="button" onClick={() => { setEditingId(null); setEditPhotoPreview(null); }} className="border border-gray-300 px-4 py-2.5 rounded-xl text-sm">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center gap-4">
                                    {/* Photo */}
                                    {student.photo ? (
                                        <img src={`/storage/${student.photo}`} alt={student.name}
                                            className="w-16 h-22 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
                                    ) : (
                                        <div className="w-16 h-22 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">👤</span>
                                        </div>
                                    )}

                                    <div className="flex-1">
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
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Link href={`/parent/children/${student.id}/qr`}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700">QR Code</Link>
                                        <button onClick={() => startEdit(student)}
                                            className="border border-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Edit</button>
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
