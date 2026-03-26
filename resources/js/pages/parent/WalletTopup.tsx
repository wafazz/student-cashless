import { useForm, Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';

interface Props {
    walletBalance: number;
    gateways: { bayarcash: boolean; toyyibpay: boolean };
    minTopup: number;
    maxTopup: number;
    serviceFee: number;
    feeWaiverMin: number;
}

const quickAmounts = [10, 20, 50, 100, 200];

export default function WalletTopup({ walletBalance, gateways, minTopup, maxTopup, serviceFee, feeWaiverMin }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        payment_method: 'manual',
    });

    const amount = Number(data.amount) || 0;
    const isWaived = feeWaiverMin > 0 && amount >= feeWaiverMin;
    const effectiveFee = isWaived ? 0 : serviceFee;
    const totalCharge = amount + effectiveFee;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/parent/wallet/topup');
    };

    return (
        <ParentLayout title="Wallet Top Up">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Top Up My Wallet</h1>
                <Link href="/parent/wallet" className="text-sm text-blue-600 hover:underline">← Back to Wallet</Link>
            </div>

            <div className="max-w-md mx-auto">
                <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-600">RM {walletBalance.toFixed(2)}</p>
                </div>

                <form onSubmit={submit}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RM)</label>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {quickAmounts.map(amt => (
                                <button key={amt} type="button" onClick={() => setData('amount', String(amt))}
                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                                        data.amount === String(amt) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    RM {amt}
                                </button>
                            ))}
                        </div>
                        <input type="number" step="1" min={minTopup} max={maxTopup} value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-2xl font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.00" />
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}

                        {amount > 0 && serviceFee > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 mt-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Top up</span><span>RM {amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mt-1">
                                    <span>Service fee</span>
                                    {isWaived ? (
                                        <span className="text-green-600 font-medium"><s className="text-gray-400 mr-1">RM {serviceFee.toFixed(2)}</s> FREE</span>
                                    ) : (
                                        <span>RM {serviceFee.toFixed(2)}</span>
                                    )}
                                </div>
                                {!isWaived && feeWaiverMin > 0 && (
                                    <p className="text-xs text-green-600 mt-1">Top up RM {feeWaiverMin.toFixed(0)}+ to waive fee</p>
                                )}
                                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-semibold text-gray-800">
                                    <span>Total</span><span>RM {totalCharge.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    New balance: RM {(walletBalance + amount).toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>

                    {data.amount && (
                        <>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                                <div className="space-y-2">
                                    {gateways.bayarcash && (
                                        <button type="button" onClick={() => setData('payment_method', 'bayarcash')}
                                            className={`w-full p-4 rounded-xl border text-left ${data.payment_method === 'bayarcash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                            <span className="font-medium text-gray-800">FPX (Bayarcash)</span>
                                        </button>
                                    )}
                                    {gateways.toyyibpay && (
                                        <button type="button" onClick={() => setData('payment_method', 'toyyibpay')}
                                            className={`w-full p-4 rounded-xl border text-left ${data.payment_method === 'toyyibpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                            <span className="font-medium text-gray-800">FPX (ToyyibPay)</span>
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setData('payment_method', 'manual')}
                                        className={`w-full p-4 rounded-xl border text-left ${data.payment_method === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                        <span className="font-medium text-gray-800">Manual (Demo)</span>
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={processing}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50">
                                {processing ? 'Processing...' : `Top Up RM ${amount.toFixed(2)}`}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </ParentLayout>
    );
}
