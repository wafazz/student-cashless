import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from 'types/models';
import { useState, useEffect } from 'react';

export default function SchoolRegister() {
    const { flash } = usePage().props as unknown as PageProps;
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        school_name: '',
        address: '',
        school_phone: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        estimated_students: '',
        notes: '',
    });

    useEffect(() => {
        if (flash.success) {
            setShowFlash(true);
            reset();
            const timer = setTimeout(() => setShowFlash(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/school-register');
    };

    return (
        <>
            <Head title="Register Your School" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <header className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
                    <Link href="/"><img src="/logo.png" alt="Student Cashless" className="max-w-[200px]" /></Link>
                    <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                        Log In
                    </Link>
                </header>

                <div className="max-w-2xl mx-auto px-6 py-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Register Your School</h1>
                        <p className="text-gray-500 mt-2">Get started with Student Cashless system. Fill in your details and we'll get in touch.</p>
                    </div>

                    {showFlash && flash.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* School Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">School Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                                    <input type="text" value={data.school_name} onChange={e => setData('school_name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                                    {errors.school_name && <p className="text-red-500 text-xs mt-1">{errors.school_name}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" value={data.address} onChange={e => setData('address', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School Phone</label>
                                    <input type="text" value={data.school_phone} onChange={e => setData('school_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Students</label>
                                    <input type="number" min="1" value={data.estimated_students} onChange={e => setData('estimated_students', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Contact Person */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Person</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input type="text" value={data.contact_name} onChange={e => setData('contact_name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                                    {errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input type="email" value={data.contact_email} onChange={e => setData('contact_email', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                                    {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Any questions or special requirements..." />
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {processing ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        We'll review your registration and contact you within 1-2 business days.
                    </p>
                </div>
            </div>
        </>
    );
}
