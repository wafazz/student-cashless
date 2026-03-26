import { useForm, router } from '@inertiajs/react';
import SchoolLayout from 'layouts/SchoolLayout';
import { School } from 'types/models';
import { useState, useRef } from 'react';

interface Props {
    school: School;
}

export default function Settings({ school }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        name: school.name,
        address: school.address || '',
        phone: school.phone || '',
        email: (school as any).email || '',
        logo: null as File | null,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/school/settings', {
            _method: 'PUT',
            ...form.data,
        }, {
            forceFormData: true,
            onSuccess: () => setLogoPreview(null),
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        if (confirm('Remove school logo?')) {
            router.delete('/school/settings/logo');
        }
    };

    return (
        <SchoolLayout title="Settings">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">School Settings</h1>

            <form onSubmit={handleSave}>
                {/* Logo Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">School Logo</h2>
                    <p className="text-sm text-gray-500 mb-4">This logo will appear on fee receipts for parents.</p>

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                            {logoPreview ? (
                                <img src={logoPreview} className="w-full h-full object-contain" />
                            ) : school.logo ? (
                                <img src={`/storage/${school.logo}`} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-3xl text-gray-300">🏫</span>
                            )}
                        </div>
                        <div>
                            <input type="file" ref={fileRef} accept="image/jpeg,image/png" onChange={handleLogoChange} className="hidden" />
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700">
                                {school.logo ? 'Change Logo' : 'Upload Logo'}
                            </button>
                            {school.logo && (
                                <button type="button" onClick={handleRemoveLogo}
                                    className="ml-2 text-red-500 text-sm hover:underline">
                                    Remove
                                </button>
                            )}
                            <p className="text-xs text-gray-400 mt-2">JPG or PNG, max 2MB. Recommended: square logo.</p>
                        </div>
                    </div>
                </div>

                {/* School Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">School Information</h2>
                    <p className="text-sm text-gray-500 mb-4">This information will appear on receipts.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. pibg@school.edu.my" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="text" value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. 03-41234567" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea value={form.data.address} onChange={e => form.setData('address', e.target.value)}
                                rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none resize-none"
                                placeholder="Full school address" />
                        </div>
                    </div>
                </div>

                {/* Receipt Preview Info */}
                <div className="bg-teal-50 rounded-2xl border border-teal-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-teal-800 mb-2">Receipt Preview</h2>
                    <p className="text-sm text-teal-700">Your receipts will include:</p>
                    <ul className="text-sm text-teal-600 mt-2 space-y-1">
                        <li>&#10003; School logo (if uploaded)</li>
                        <li>&#10003; School name, address, phone, email</li>
                        <li>&#10003; Fee name, academic year, amount</li>
                        <li>&#10003; Payer name, student name, payment date</li>
                        <li>&#10003; "PAID" watermark</li>
                    </ul>
                </div>

                <button type="submit" disabled={form.processing}
                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50">
                    {form.processing ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </SchoolLayout>
    );
}
