import { useForm } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';
import { useState } from 'react';

interface Registration {
    id: number;
    school_name: string;
    address: string | null;
    school_phone: string | null;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    estimated_students: number | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

interface Props {
    registrations: Registration[];
}

export default function Registrations({ registrations }: Props) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const form = useForm({ status: '', admin_notes: '' });

    const startAction = (reg: Registration, status: string) => {
        setActiveId(reg.id);
        form.setData({ status, admin_notes: '' });
    };

    const handleSubmit = (id: number) => {
        form.put(`/admin/registrations/${id}`, { onSuccess: () => setActiveId(null) });
    };

    const statusColor = (status: string) => {
        if (status === 'approved') return 'bg-green-50 text-green-700';
        if (status === 'rejected') return 'bg-red-50 text-red-700';
        return 'bg-yellow-50 text-yellow-700';
    };

    const pending = registrations.filter(r => r.status === 'pending');
    const processed = registrations.filter(r => r.status !== 'pending');

    return (
        <AdminLayout title="School Registrations">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">School Registrations</h1>

            {/* Pending */}
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Pending ({pending.length})</h2>
            {pending.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-center text-gray-500">
                    No pending registrations.
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                    {pending.map(reg => (
                        <div key={reg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{reg.school_name}</h3>
                                    {reg.address && <p className="text-sm text-gray-500">{reg.address}</p>}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${statusColor(reg.status)}`}>{reg.status}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-4">
                                <div>
                                    <span className="text-gray-500">Contact:</span>
                                    <span className="ml-1 text-gray-800">{reg.contact_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Email:</span>
                                    <span className="ml-1 text-gray-800">{reg.contact_email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="ml-1 text-gray-800">{reg.contact_phone || '-'}</span>
                                </div>
                                {reg.school_phone && (
                                    <div>
                                        <span className="text-gray-500">School Phone:</span>
                                        <span className="ml-1 text-gray-800">{reg.school_phone}</span>
                                    </div>
                                )}
                                {reg.estimated_students && (
                                    <div>
                                        <span className="text-gray-500">Est. Students:</span>
                                        <span className="ml-1 text-gray-800">{reg.estimated_students}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">Submitted:</span>
                                    <span className="ml-1 text-gray-800">{new Date(reg.created_at).toLocaleDateString('ms-MY')}</span>
                                </div>
                            </div>
                            {reg.notes && (
                                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">{reg.notes}</p>
                            )}

                            {activeId === reg.id ? (
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        {form.data.status === 'approved' ? 'Approve & create school (30-day trial)' : 'Reject this registration'}
                                    </p>
                                    <textarea
                                        value={form.data.admin_notes}
                                        onChange={e => form.setData('admin_notes', e.target.value)}
                                        placeholder="Admin notes (optional)..."
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none resize-none mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSubmit(reg.id)}
                                            disabled={form.processing}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium text-white ${
                                                form.data.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                            } disabled:opacity-50`}
                                        >
                                            {form.data.status === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
                                        </button>
                                        <button onClick={() => setActiveId(null)} className="px-4 py-2 rounded-xl text-sm border border-gray-300">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 border-t border-gray-100 pt-4">
                                    <button onClick={() => startAction(reg, 'approved')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
                                        Approve
                                    </button>
                                    <button onClick={() => startAction(reg, 'rejected')}
                                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Processed */}
            {processed.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Processed ({processed.length})</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">School</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Contact</th>
                                    <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                                    <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processed.map(reg => (
                                    <tr key={reg.id}>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{reg.school_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{reg.contact_name} ({reg.contact_email})</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusColor(reg.status)}`}>{reg.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(reg.created_at).toLocaleDateString('ms-MY')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
