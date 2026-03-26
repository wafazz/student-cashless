import { useForm } from '@inertiajs/react';
import SchoolLayout from 'layouts/SchoolLayout';
import { Canteen, User } from 'types/models';
import { useState } from 'react';

interface StoreWithDetails extends Omit<Canteen, 'operator'> {
    operator: User | null;
    menu_items_count: number;
    transactions_count: number;
}

interface Props {
    stores: StoreWithDetails[];
}

export default function Stores({ stores }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({
        name: '', type: 'canteen' as 'canteen' | 'koperasi',
        operator_name: '', operator_email: '', operator_phone: '', operator_password: '',
        contract_fee: '', contract_start: '', contract_end: '', contract_notes: '',
    });

    const editForm = useForm({
        name: '', type: 'canteen' as 'canteen' | 'koperasi', status: 'active',
        contract_fee: '', contract_start: '', contract_end: '', contract_notes: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/school/stores', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (s: StoreWithDetails) => {
        setEditingId(s.id);
        editForm.setData({
            name: s.name, type: s.type, status: s.status,
            contract_fee: s.contract_fee ? String(s.contract_fee) : '',
            contract_start: s.contract_start ? String(s.contract_start).split('T')[0] : '',
            contract_end: s.contract_end ? String(s.contract_end).split('T')[0] : '',
            contract_notes: s.contract_notes || '',
        });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/school/stores/${id}`, { onSuccess: () => setEditingId(null) });
    };

    return (
        <SchoolLayout title="Stores">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Store Management</h1>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
                    {showForm ? 'Cancel' : '+ Register Store'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Register New Store</h3>
                    <form onSubmit={handleAdd}>
                        <h4 className="font-medium text-gray-700 text-sm mb-3">Store Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                    placeholder={form.data.type === 'koperasi' ? 'e.g. Koperasi Sekolah' : 'e.g. Kantin Utama'} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Type</label>
                                <select value={form.data.type} onChange={e => form.setData('type', e.target.value as 'canteen' | 'koperasi')}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none">
                                    <option value="canteen">Kantin</option>
                                    <option value="koperasi">Koperasi</option>
                                </select>
                            </div>
                        </div>

                        <h4 className="font-medium text-gray-700 text-sm mb-3">Operator Account</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Operator Name</label>
                                <input type="text" value={form.data.operator_name} onChange={e => form.setData('operator_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                                {form.errors.operator_name && <p className="text-red-500 text-xs mt-1">{form.errors.operator_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={form.data.operator_email} onChange={e => form.setData('operator_email', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                                {form.errors.operator_email && <p className="text-red-500 text-xs mt-1">{form.errors.operator_email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" value={form.data.operator_phone} onChange={e => form.setData('operator_phone', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input type="password" value={form.data.operator_password} onChange={e => form.setData('operator_password', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>
                        </div>

                        <h4 className="font-medium text-gray-700 text-sm mb-3">Contract (Optional)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fee (RM/month)</label>
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
                                rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none" />
                        </div>

                        <button type="submit" disabled={form.processing}
                            className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Register Store</button>
                    </form>
                </div>
            )}

            {/* Store Cards */}
            {stores.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <p className="text-4xl mb-3">🏪</p>
                    <p className="text-gray-500">No stores registered yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Register a canteen or koperasi for your school.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map(store => (
                        <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            {editingId === store.id ? (
                                <form onSubmit={(e) => handleEdit(e, store.id)} className="space-y-3">
                                    <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" required />
                                    <select value={editForm.data.type} onChange={e => editForm.setData('type', e.target.value as 'canteen' | 'koperasi')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                        <option value="canteen">Kantin</option>
                                        <option value="koperasi">Koperasi</option>
                                    </select>
                                    <select value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-teal-600 text-white px-3 py-2 rounded-xl text-sm">Save</button>
                                        <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-3 py-2 rounded-xl text-sm">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-800">{store.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            store.type === 'koperasi' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
                                        }`}>
                                            {store.type === 'koperasi' ? 'Koperasi' : 'Kantin'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Operator</span>
                                            <span className="text-gray-800 font-medium">{store.operator?.name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Items</span>
                                            <span className="text-gray-800">{store.menu_items_count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Transactions</span>
                                            <span className="text-gray-800">{store.transactions_count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${store.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {store.status}
                                            </span>
                                        </div>
                                        {Number(store.contract_fee) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Contract Fee</span>
                                                <span className="text-gray-800">RM {Number(store.contract_fee).toFixed(2)}/mo</span>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={() => startEdit(store)}
                                        className="w-full text-center bg-gray-50 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-100">
                                        Edit
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </SchoolLayout>
    );
}
