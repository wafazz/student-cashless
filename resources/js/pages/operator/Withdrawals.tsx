import { useForm } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, Withdrawal } from 'types/models';
import { useState } from 'react';

interface Props {
    canteen: Canteen | null;
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
    withdrawals: Withdrawal[];
}

export default function Withdrawals({ canteen, balance, totalEarned, totalWithdrawn, withdrawals }: Props) {
    const [showBank, setShowBank] = useState(false);
    const [showRequest, setShowRequest] = useState(false);

    const bankForm = useForm({
        bank_name: canteen?.bank_name || '',
        bank_account: canteen?.bank_account || '',
        bank_holder: canteen?.bank_holder || '',
    });

    const requestForm = useForm({ amount: '' });

    const handleBank = (e: React.FormEvent) => {
        e.preventDefault();
        bankForm.post('/operator/withdrawals/bank', { onSuccess: () => setShowBank(false) });
    };

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        requestForm.post('/operator/withdrawals/request', { onSuccess: () => { requestForm.reset(); setShowRequest(false); } });
    };

    if (!canteen) {
        return <OperatorLayout title="Withdrawals"><div className="text-center py-12"><p className="text-gray-500">No store assigned.</p></div></OperatorLayout>;
    }

    const statusColor = (s: string) => {
        if (s === 'paid') return 'bg-green-50 text-green-700';
        if (s === 'approved') return 'bg-blue-50 text-blue-700';
        if (s === 'rejected') return 'bg-red-50 text-red-700';
        return 'bg-amber-50 text-amber-700';
    };

    return (
        <OperatorLayout title="Withdrawals">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Withdrawals</h1>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <p className="text-sm text-green-100">Available Balance</p>
                    <p className="text-3xl font-bold mt-1">RM {Number(balance).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Earned</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">RM {Number(totalEarned).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">RM {Number(totalWithdrawn).toFixed(2)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
                <button onClick={() => setShowBank(!showBank)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
                    {canteen.bank_name ? 'Update Bank Details' : 'Set Up Bank Details'}
                </button>
                {canteen.bank_name && balance >= 10 && (
                    <button onClick={() => setShowRequest(!showRequest)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
                        Request Withdrawal
                    </button>
                )}
            </div>

            {/* Bank Details Form */}
            {showBank && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Bank Details</h3>
                    <form onSubmit={handleBank} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input type="text" value={bankForm.data.bank_name} onChange={e => bankForm.setData('bank_name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" placeholder="e.g. Maybank" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input type="text" value={bankForm.data.bank_account} onChange={e => bankForm.setData('bank_account', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                            <input type="text" value={bankForm.data.bank_holder} onChange={e => bankForm.setData('bank_holder', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={bankForm.processing} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Withdrawal Request Form */}
            {showRequest && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Request Withdrawal</h3>
                    <p className="text-xs text-gray-500 mb-4">3% platform fee will be deducted. Min RM10. To: {canteen.bank_name} - {canteen.bank_account}</p>
                    <form onSubmit={handleRequest} className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RM)</label>
                            <input type="number" step="0.01" min="10" max={balance} value={requestForm.data.amount}
                                onChange={e => requestForm.setData('amount', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none" required />
                        </div>
                        {requestForm.data.amount && (
                            <div className="text-sm text-gray-500 pb-2">
                                Fee: RM {(parseFloat(requestForm.data.amount || '0') * 0.03).toFixed(2)} |
                                Net: <span className="font-bold text-green-600">RM {(parseFloat(requestForm.data.amount || '0') * 0.97).toFixed(2)}</span>
                            </div>
                        )}
                        <button type="submit" disabled={requestForm.processing} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">Submit</button>
                    </form>
                </div>
            )}

            {/* Withdrawal History */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Withdrawal History</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {withdrawals.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No withdrawals yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {withdrawals.map(w => (
                            <div key={w.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">RM {Number(w.amount).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Fee: RM {Number(w.platform_fee).toFixed(2)} | Net: RM {Number(w.net_amount).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(w.requested_at).toLocaleString('ms-MY')}</p>
                                    {w.payment_reference && <p className="text-xs text-green-600">Ref: {w.payment_reference}</p>}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(w.status)}`}>{w.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </OperatorLayout>
    );
}
