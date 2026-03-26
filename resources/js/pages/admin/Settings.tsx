import { useForm } from '@inertiajs/react';
import AdminLayout from 'layouts/AdminLayout';

interface Props {
    settings: Record<string, string>;
}

export default function Settings({ settings }: Props) {
    const { data, setData, put, processing } = useForm(settings);

    const handleSave = () => {
        put('/admin/settings');
    };

    return (
        <AdminLayout title="Settings">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Platform Settings</h1>

            {/* General */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">General</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Top Up (RM)</label>
                        <input type="number" step="1" min="1" value={data.min_topup}
                            onChange={e => setData('min_topup', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Top Up (RM)</label>
                        <input type="number" step="1" min="1" value={data.max_topup}
                            onChange={e => setData('max_topup', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Daily Limit (RM)</label>
                        <input type="number" step="1" min="0" value={data.default_daily_limit}
                            onChange={e => setData('default_daily_limit', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Top Up Service Fee (RM)</label>
                        <input type="number" step="0.10" min="0" value={data.topup_service_fee}
                            onChange={e => setData('topup_service_fee', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        <p className="text-xs text-gray-400 mt-1">Charged on top of gateway fee per top up</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Waiver Min (RM)</label>
                        <input type="number" step="1" min="0" value={data.topup_fee_waiver_min}
                            onChange={e => setData('topup_fee_waiver_min', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                        <p className="text-xs text-gray-400 mt-1">Top up this amount or more = no service fee. Set 0 to disable.</p>
                    </div>
                </div>
            </div>

            {/* Bayarcash */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Bayarcash (FPX)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Portal Key</label>
                        <input type="text" value={data.bayarcash_portal_key}
                            onChange={e => setData('bayarcash_portal_key', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token</label>
                        <input type="text" value={data.bayarcash_token}
                            onChange={e => setData('bayarcash_token', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Secret Key</label>
                        <input type="password" value={data.bayarcash_secret}
                            onChange={e => setData('bayarcash_secret', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={data.bayarcash_sandbox === '1'}
                                onChange={e => setData('bayarcash_sandbox', e.target.checked ? '1' : '0')}
                                className="rounded border-gray-300 text-indigo-600" />
                            Sandbox Mode
                        </label>
                    </div>
                </div>
            </div>

            {/* ToyyibPay */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">ToyyibPay (FPX)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                        <input type="password" value={data.toyyibpay_key}
                            onChange={e => setData('toyyibpay_key', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Code</label>
                        <input type="text" value={data.toyyibpay_category}
                            onChange={e => setData('toyyibpay_category', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={data.toyyibpay_sandbox === '1'}
                                onChange={e => setData('toyyibpay_sandbox', e.target.checked ? '1' : '0')}
                                className="rounded border-gray-300 text-indigo-600" />
                            Sandbox Mode
                        </label>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={processing}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
                {processing ? 'Saving...' : 'Save Settings'}
            </button>
        </AdminLayout>
    );
}
