import { useForm } from '@inertiajs/react';
import SchoolLayout from 'layouts/SchoolLayout';
import { School, SubscriptionPackage, SubscriptionPayment } from 'types/models';
import { useState, useRef } from 'react';

interface Props {
    school: School & { package?: SubscriptionPackage };
    packages: SubscriptionPackage[];
    payments: (SubscriptionPayment & { package: SubscriptionPackage })[];
}

export default function Subscription({ school, packages, payments }: Props) {
    const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        package_id: '',
        receipt: null as File | null,
        notes: '',
    });

    const hasPending = payments.some(p => p.status === 'pending');
    const isActive = school.subscription_status === 'active' || school.subscription_status === 'trial';
    const trialUsed = payments.some(p => p.package?.billing_cycle === 'trial' && (p.status === 'approved' || p.status === 'pending'));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/school/subscription', {
            forceFormData: true,
            onSuccess: () => { form.reset(); setSelectedPkg(null); },
        });
    };

    const canSelect = (pkg: SubscriptionPackage) => {
        if (hasPending) return false;
        if (pkg.billing_cycle === 'trial' && trialUsed) return false;
        return true;
    };

    const selectPackage = (pkg: SubscriptionPackage) => {
        if (!canSelect(pkg)) return;
        setSelectedPkg(pkg.id);
        form.setData('package_id', String(pkg.id));
    };

    const statusColor = (s: string) => {
        if (s === 'approved') return 'bg-green-50 text-green-700';
        if (s === 'rejected') return 'bg-red-50 text-red-700';
        return 'bg-amber-50 text-amber-700';
    };

    return (
        <SchoolLayout title="Subscription">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Subscription</h1>

            {/* Current Plan */}
            <div className={`rounded-2xl p-6 mb-6 ${isActive ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white' : 'bg-white border border-gray-200'}`}>
                <p className={`text-sm ${isActive ? 'text-teal-100' : 'text-gray-500'}`}>Current Plan</p>
                <p className={`text-2xl font-bold mt-1 ${isActive ? '' : 'text-gray-800'}`}>
                    {school.package?.name || school.subscription_status === 'trial' ? 'Trial' : 'No Active Plan'}
                </p>
                {school.subscription_end && (
                    <p className={`text-sm mt-2 ${isActive ? 'text-teal-200' : 'text-gray-500'}`}>
                        {isActive ? 'Active' : 'Expired'} until {new Date(school.subscription_end).toLocaleDateString('ms-MY')}
                    </p>
                )}
                {!isActive && !hasPending && (
                    <p className="text-sm text-amber-600 mt-2 font-medium">Subscribe to a plan below to activate your school.</p>
                )}
            </div>

            {/* Packages */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {packages.map(pkg => (
                    <div key={pkg.id}
                        onClick={() => canSelect(pkg) && selectPackage(pkg)}
                        className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                            selectedPkg === pkg.id ? 'border-teal-500 shadow-md' :
                            !canSelect(pkg) ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-teal-300 cursor-pointer'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                            {selectedPkg === pkg.id && <span className="text-teal-600 text-lg">&#10003;</span>}
                        </div>
                        <p className="text-3xl font-bold text-teal-600 mb-1">
                            {pkg.price > 0 ? `RM ${Number(pkg.price).toFixed(0)}` : 'FREE'}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                            {pkg.duration_days} days &middot; {pkg.billing_cycle}
                            {pkg.billing_cycle === 'trial' && trialUsed && <span className="ml-2 text-red-500 font-medium">(Already used)</span>}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
                        {pkg.features && (
                            <ul className="space-y-1">
                                {pkg.features.map((f, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-green-500">&#10003;</span>{f}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Subscribe Form */}
            {selectedPkg && !hasPending && (() => {
                const selectedPackage = packages.find(p => p.id === selectedPkg);
                const isTrialPkg = selectedPackage?.billing_cycle === 'trial';

                return isTrialPkg ? (
                    /* Trial — instant activation, no receipt */
                    <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-6 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Activate Free Trial</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Start your <span className="font-bold text-teal-600">{selectedPackage?.duration_days}-day</span> free trial with full access to all features. No payment required.
                        </p>
                        <div className="flex gap-3">
                            <form onSubmit={handleSubmit}>
                                <button type="submit" disabled={form.processing}
                                    className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
                                    {form.processing ? 'Activating...' : 'Activate Trial Now'}
                                </button>
                            </form>
                            <button onClick={() => setSelectedPkg(null)}
                                className="border border-gray-300 px-6 py-2.5 rounded-xl text-sm">Cancel</button>
                        </div>
                    </div>
                ) : (
                    /* Paid — upload receipt */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Upload Payment Receipt</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Make payment of <span className="font-bold text-teal-600">RM {Number(selectedPackage?.price || 0).toFixed(2)}</span> to our company account, then upload the receipt below.
                        </p>

                        <div className="bg-teal-50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-medium text-teal-800">Company Bank Details:</p>
                            <p className="text-sm text-teal-700">Bank: <span className="font-semibold">Maybank</span></p>
                            <p className="text-sm text-teal-700">Account: <span className="font-semibold">1234-5678-9012</span></p>
                            <p className="text-sm text-teal-700">Name: <span className="font-semibold">Student Cashless Sdn Bhd</span></p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (JPG, PNG, or PDF)</label>
                                <input
                                    type="file"
                                    ref={fileRef}
                                    accept="image/*,.pdf"
                                    onChange={e => form.setData('receipt', e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none text-sm"
                                />
                                {form.errors.receipt && <p className="text-red-500 text-xs mt-1">{form.errors.receipt}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <input type="text" value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none"
                                    placeholder="e.g. Transferred from Maybank at 2:30pm" />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={!form.data.receipt || form.processing}
                                    className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
                                    {form.processing ? 'Submitting...' : 'Submit Payment'}
                                </button>
                                <button type="button" onClick={() => setSelectedPkg(null)}
                                    className="border border-gray-300 px-6 py-2.5 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                );
            })()}

            {hasPending && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                    <p className="text-amber-800 font-medium">You have a pending payment awaiting admin approval.</p>
                </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {payments.map(p => (
                                <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{p.package?.name} — RM {Number(p.amount).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString('ms-MY')}</p>
                                        {p.admin_notes && <p className="text-xs text-red-500 mt-1">{p.admin_notes}</p>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <a href={`/storage/${p.receipt_path}`} target="_blank" className="text-blue-600 text-xs hover:underline">View Receipt</a>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </SchoolLayout>
    );
}
