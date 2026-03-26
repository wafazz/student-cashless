import { useForm } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { SubscriptionPackage } from 'types/models';
import { useState } from 'react';

interface Props {
    packages: SubscriptionPackage[];
}

export default function Packages({ packages }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({
        name: '', slug: '', description: '', price: '', duration_days: '30',
        billing_cycle: 'monthly' as 'trial' | 'monthly' | 'yearly', features: '',
    });

    const editForm = useForm({
        name: '', description: '', price: '', duration_days: '',
        billing_cycle: 'monthly' as 'trial' | 'monthly' | 'yearly', features: '', is_active: true,
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/packages', { onSuccess: () => { form.reset(); setShowForm(false); } });
    };

    const startEdit = (p: SubscriptionPackage) => {
        setEditingId(p.id);
        editForm.setData({
            name: p.name,
            description: p.description || '',
            price: String(p.price),
            duration_days: String(p.duration_days),
            billing_cycle: p.billing_cycle,
            features: (p.features || []).join('\n'),
            is_active: p.is_active,
        });
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/admin/packages/${id}`, { onSuccess: () => setEditingId(null) });
    };

    const cycleColor = (c: string) => {
        if (c === 'trial') return 'bg-amber-50 text-amber-700';
        if (c === 'monthly') return 'bg-blue-50 text-blue-700';
        return 'bg-indigo-50 text-indigo-700';
    };

    return (
        <AdminLayout title="Subscription Packages">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Subscription Packages</h1>
                <button onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                    {showForm ? 'Cancel' : '+ Add Package'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">New Package</h3>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input type="text" value={form.data.slug} onChange={e => form.setData('slug', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. premium" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                                <select value={form.data.billing_cycle} onChange={e => form.setData('billing_cycle', e.target.value as any)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none">
                                    <option value="trial">Trial</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (RM)</label>
                                <input type="number" step="0.50" min="0" value={form.data.price} onChange={e => form.setData('price', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                                <input type="number" min="1" value={form.data.duration_days} onChange={e => form.setData('duration_days', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={form.data.description} onChange={e => form.setData('description', e.target.value)}
                                    rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                                <textarea value={form.data.features} onChange={e => form.setData('features', e.target.value)}
                                    rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none"
                                    placeholder="Unlimited students&#10;Priority support&#10;Custom branding" />
                            </div>
                        </div>
                        <button type="submit" disabled={form.processing}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Create Package</button>
                    </form>
                </div>
            )}

            {/* Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(pkg => (
                    <div key={pkg.id} className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${pkg.is_active ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                        {editingId === pkg.id ? (
                            <form onSubmit={(e) => handleEdit(e, pkg.id)} className="space-y-3">
                                <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none font-semibold" required />
                                <select value={editForm.data.billing_cycle} onChange={e => editForm.setData('billing_cycle', e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none">
                                    <option value="trial">Trial</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" step="0.50" min="0" value={editForm.data.price} onChange={e => editForm.setData('price', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" placeholder="Price" />
                                    <input type="number" min="1" value={editForm.data.duration_days} onChange={e => editForm.setData('duration_days', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none" placeholder="Days" />
                                </div>
                                <textarea value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)}
                                    rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none resize-none" placeholder="Description" />
                                <textarea value={editForm.data.features} onChange={e => editForm.setData('features', e.target.value)}
                                    rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none resize-none" placeholder="Features (one per line)" />
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={editForm.data.is_active}
                                        onChange={e => editForm.setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300" />
                                    Active
                                </label>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="border border-gray-300 px-4 py-2 rounded-xl text-sm">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cycleColor(pkg.billing_cycle)}`}>
                                        {pkg.billing_cycle}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {pkg.price > 0 ? `RM ${Number(pkg.price).toFixed(0)}` : 'FREE'}
                                    </span>
                                    {pkg.price > 0 && (
                                        <span className="text-sm text-gray-500 ml-1">
                                            /{pkg.billing_cycle === 'yearly' ? 'year' : 'month'}
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
                                <p className="text-xs text-gray-400 mb-3">{pkg.duration_days} days &middot; {pkg.schools_count || 0} schools subscribed</p>

                                {pkg.features && pkg.features.length > 0 && (
                                    <ul className="space-y-1.5 mb-4">
                                        {pkg.features.map((f, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">&#10003;</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <button onClick={() => startEdit(pkg)}
                                    className="w-full text-center bg-gray-50 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-100 mt-2">
                                    Edit Package
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
