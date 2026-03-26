import { useForm, router } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, MenuItem } from 'types/models';
import { useState } from 'react';

interface Props {
    canteen: Canteen | null;
    menuItems: MenuItem[];
}

const isKoperasi = (canteen: Canteen | null) => canteen?.type === 'koperasi';
const itemLabel = (canteen: Canteen | null) => isKoperasi(canteen) ? 'Product' : 'Menu Item';
const categoryHint = (canteen: Canteen | null) => isKoperasi(canteen) ? 'Buku Teks / Alat Tulis / Pakaian' : 'Nasi / Kuih / Minuman';

export default function Menu({ canteen, menuItems }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({ name: '', price: '', category: '' });
    const editForm = useForm({ name: '', price: '', category: '', is_available: true });

    if (!canteen) {
        return (
            <OperatorLayout title="Products">
                <div className="text-center py-12">
                    <p className="text-gray-500">No store assigned.</p>
                </div>
            </OperatorLayout>
        );
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/operator/menu', {
            onSuccess: () => { form.reset(); setShowForm(false); },
        });
    };

    const startEdit = (item: MenuItem) => {
        setEditingId(item.id);
        editForm.setData({
            name: item.name,
            price: String(item.price),
            category: item.category || '',
            is_available: item.is_available,
        });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/operator/menu/${id}`, {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this menu item?')) {
            router.delete(`/operator/menu/${id}`);
        }
    };

    // Group by category
    const grouped: Record<string, MenuItem[]> = {};
    menuItems.forEach(item => {
        const cat = item.category || 'Lain-lain';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    return (
        <OperatorLayout title={isKoperasi(canteen) ? 'Product Management' : 'Menu Management'}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{isKoperasi(canteen) ? 'Product' : 'Menu'} Management</h1>
                    <p className="text-sm text-gray-500">{canteen.name}</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700"
                >
                    {showForm ? 'Cancel' : `+ Add ${itemLabel(canteen)}`}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={e => form.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                placeholder={isKoperasi(canteen) ? 'Buku Teks Sains T1' : 'Nasi Lemak'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (RM)</label>
                            <input
                                type="number"
                                step="0.10"
                                min="0.10"
                                value={form.data.price}
                                onChange={e => form.setData('price', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={form.data.category}
                                onChange={e => form.setData('category', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                placeholder={categoryHint(canteen)}
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={form.processing} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Menu Items grouped by category */}
            {Object.keys(grouped).length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <p className="text-gray-500">No {isKoperasi(canteen) ? 'products' : 'menu items'} yet.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                            {items.map(item => (
                                <div key={item.id} className="px-6 py-4">
                                    {editingId === item.id ? (
                                        <form onSubmit={(e) => handleEdit(e, item.id)} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={e => editForm.setData('name', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                                                required
                                            />
                                            <input
                                                type="number"
                                                step="0.10"
                                                value={editForm.data.price}
                                                onChange={e => editForm.setData('price', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={editForm.data.category}
                                                onChange={e => editForm.setData('category', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none"
                                            />
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.data.is_available}
                                                    onChange={e => editForm.setData('is_available', e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                Available
                                            </label>
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm">Save</button>
                                                <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-3 py-2 rounded-xl text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                <div>
                                                    <span className={`font-medium ${!item.is_available ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                        {item.name}
                                                    </span>
                                                    <span className="text-sm text-green-600 ml-3">RM {Number(item.price).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(item)} className="text-sm text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(item.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </OperatorLayout>
    );
}
