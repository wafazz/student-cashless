import { useForm } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { User, Canteen, School } from 'types/models';
import { useState } from 'react';

interface OperatorUser extends User {
    canteen: (Canteen & { school: School }) | null;
}

interface Props {
    operators: OperatorUser[];
    schools: (School & { canteens: Canteen[] })[];
}

export default function Operators({ operators, schools }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [filterType, setFilterType] = useState<string>('all');

    const form = useForm({
        name: '', email: '', phone: '', password: '',
        school_id: '', canteen_name: '', canteen_type: 'canteen' as 'canteen' | 'koperasi',
        contract_fee: '', contract_start: '', contract_end: '', contract_notes: '',
    });
    const editForm = useForm({ name: '', email: '', phone: '', status: 'active' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/operators', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (op: OperatorUser) => {
        setEditingId(op.id);
        editForm.setData({ name: op.name, email: op.email, phone: op.phone || '', status: op.status });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/admin/operators/${id}`, { onSuccess: () => setEditingId(null) });
    };

    const contractColor = (status: string) => {
        if (status === 'active') return 'bg-green-50 text-green-700';
        if (status === 'expired') return 'bg-yellow-50 text-yellow-700';
        return 'bg-red-50 text-red-700';
    };

    return (
        <AdminLayout title="Store Operators">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Store Operators</h1>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                    {showForm ? 'Cancel' : '+ Add Store Operator'}
                </button>
            </div>

            {/* Filter by type */}
            <div className="flex gap-2 mb-4">
                {['all', 'canteen', 'koperasi'].map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            filterType === t ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        {t === 'all' ? 'All' : t === 'canteen' ? 'Kantin' : 'Koperasi'}
                    </button>
                ))}
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">New Store Operator</h3>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Type</label>
                                <select value={form.data.canteen_type} onChange={e => form.setData('canteen_type', e.target.value as 'canteen' | 'koperasi')}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required>
                                    <option value="canteen">Kantin</option>
                                    <option value="koperasi">Koperasi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                <input type="text" value={form.data.canteen_name} onChange={e => form.setData('canteen_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                    placeholder={form.data.canteen_type === 'koperasi' ? 'e.g. Koperasi Sekolah' : 'e.g. Kantin Utama'} required />
                            </div>
                        </div>

                        <h4 className="font-medium text-gray-700 text-sm mb-3">Contract Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Fee (RM/month)</label>
                                <input type="number" step="0.01" min="0" value={form.data.contract_fee}
                                    onChange={e => form.setData('contract_fee', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" value={form.data.contract_start}
                                    onChange={e => form.setData('contract_start', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input type="date" value={form.data.contract_end}
                                    onChange={e => form.setData('contract_end', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Notes</label>
                            <textarea value={form.data.contract_notes} onChange={e => form.setData('contract_notes', e.target.value)}
                                rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none"
                                placeholder="Terms, conditions, remarks..." />
                        </div>

                        <button type="submit" disabled={form.processing}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Create Store Operator</button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Owner</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">Store</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Type</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Contract</th>
                            <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {operators.filter(op => filterType === 'all' || op.canteen?.type === filterType).map(op => (
                            <tr key={op.id}>
                                {editingId === op.id ? (
                                    <td colSpan={8} className="px-6 py-4">
                                        <form onSubmit={(e) => handleEdit(e, op.id)} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                                            <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                            <input type="text" value={editForm.data.phone} onChange={e => editForm.setData('phone', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" />
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
                                        <td className="px-6 py-4 font-medium text-gray-800">{op.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{op.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{op.canteen?.name || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            {op.canteen && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    op.canteen.type === 'koperasi' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
                                                }`}>
                                                    {op.canteen.type === 'koperasi' ? 'Koperasi' : 'Kantin'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{op.canteen?.school?.name || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            {op.canteen && (
                                                <>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${contractColor(op.canteen.contract_status || 'active')}`}>
                                                        {op.canteen.contract_status || 'active'}
                                                    </span>
                                                    {Number(op.canteen.contract_fee) > 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">RM {Number(op.canteen.contract_fee).toFixed(2)}/mo</p>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${op.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {op.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => startEdit(op)} className="text-blue-600 hover:underline text-sm">Edit</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {operators.filter(op => filterType === 'all' || op.canteen?.type === filterType).length === 0 && <p className="p-6 text-gray-500 text-center">No store operators found.</p>}
            </div>
        </AdminLayout>
    );
}
