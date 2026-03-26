import { useForm, Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Student } from 'types/models';

interface Props {
    students: Student[];
    gateways: {
        bayarcash: boolean;
        toyyibpay: boolean;
    };
    minTopup: number;
    maxTopup: number;
    serviceFee: number;
    feeWaiverMin: number;
}

const quickAmounts = [5, 10, 20, 50, 100];

export default function Topup({ students, gateways, minTopup, maxTopup, serviceFee, feeWaiverMin }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: students.length === 1 ? String(students[0].id) : '',
        amount: '',
        payment_method: 'manual',
    });

    const selectedStudent = students.find(s => String(s.id) === data.student_id);
    const amount = Number(data.amount) || 0;
    const isWaived = feeWaiverMin > 0 && amount >= feeWaiverMin;
    const effectiveFee = isWaived ? 0 : serviceFee;
    const totalCharge = amount + effectiveFee;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/parent/topup');
    };

    return (
        <ParentLayout title="Top Up">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Top Up Wallet</h1>
                <Link href="/parent/topup/history" className="text-sm text-blue-600 hover:underline">
                    View History
                </Link>
            </div>

            <div className="max-w-md mx-auto">
                <form onSubmit={submit}>
                    {/* Select Child */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
                        {students.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                No children added yet. <Link href="/parent/children" className="text-blue-600 hover:underline">Add a child first</Link>.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {students.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setData('student_id', String(s.id))}
                                        className={`w-full p-4 rounded-xl border text-left transition-colors ${
                                            String(s.id) === data.student_id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="font-medium text-gray-800">{s.name}</span>
                                        <span className="block text-sm text-gray-500">
                                            {s.school?.name} &middot; Balance: RM {Number(s.wallet_balance).toFixed(2)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
                    </div>

                    {/* Amount */}
                    {data.student_id && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RM)</label>

                            <div className="flex gap-2 mb-4 flex-wrap">
                                {quickAmounts.map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setData('amount', String(amt))}
                                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                                            data.amount === String(amt)
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        RM {amt}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="number"
                                step="1"
                                min={minTopup}
                                max={maxTopup}
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-2xl font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            <p className="text-xs text-gray-400 mt-1 text-center">
                                Min RM {minTopup.toFixed(2)} &middot; Max RM {maxTopup.toFixed(2)}
                            </p>

                            {selectedStudent && amount > 0 && (
                                <div className="mt-4 space-y-3">
                                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                                        <p className="text-sm text-gray-600">New balance after top up</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            RM {(Number(selectedStudent.wallet_balance) + amount).toFixed(2)}
                                        </p>
                                    </div>

                                    {serviceFee > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Top up amount</span>
                                                <span>RM {amount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                                <span>Service fee</span>
                                                {isWaived ? (
                                                    <span className="text-green-600 font-medium">
                                                        <s className="text-gray-400 mr-1">RM {serviceFee.toFixed(2)}</s> FREE
                                                    </span>
                                                ) : (
                                                    <span>RM {serviceFee.toFixed(2)}</span>
                                                )}
                                            </div>
                                            {!isWaived && feeWaiverMin > 0 && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Top up RM {feeWaiverMin.toFixed(2)} or more to waive service fee
                                                </p>
                                            )}
                                            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-semibold text-gray-800">
                                                <span>Total charge</span>
                                                <span>RM {totalCharge.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Method */}
                    {data.student_id && data.amount && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                            <div className="space-y-2">
                                {gateways.bayarcash && (
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'bayarcash')}
                                        className={`w-full p-4 rounded-xl border text-left transition-colors ${
                                            data.payment_method === 'bayarcash'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="font-medium text-gray-800">Online Banking (FPX)</span>
                                        <span className="block text-xs text-gray-500">via Bayarcash — instant transfer</span>
                                    </button>
                                )}

                                {gateways.toyyibpay && (
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'toyyibpay')}
                                        className={`w-full p-4 rounded-xl border text-left transition-colors ${
                                            data.payment_method === 'toyyibpay'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="font-medium text-gray-800">Online Banking (FPX)</span>
                                        <span className="block text-xs text-gray-500">via ToyyibPay — instant transfer</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setData('payment_method', 'manual')}
                                    className={`w-full p-4 rounded-xl border text-left transition-colors ${
                                        data.payment_method === 'manual'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="font-medium text-gray-800">Manual Top Up</span>
                                    <span className="block text-xs text-gray-500">Instant credit — for testing/demo</span>
                                </button>
                            </div>
                            {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>}
                        </div>
                    )}

                    {/* Submit */}
                    {data.student_id && data.amount && (
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : data.payment_method === 'manual'
                                ? `Top Up RM ${amount.toFixed(2)}${effectiveFee > 0 ? ` (+ RM ${effectiveFee.toFixed(2)} fee)` : ' (fee waived)'}`
                                : `Pay RM ${totalCharge.toFixed(2)} via FPX`
                            }
                        </button>
                    )}
                </form>
            </div>
        </ParentLayout>
    );
}
