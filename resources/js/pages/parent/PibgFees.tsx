import { router } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { PibgFeeParent, PibgFee, School } from 'types/models';

interface Assignment extends PibgFeeParent {
    fee: PibgFee & { school: School };
}

interface Props {
    assignments: Assignment[];
    walletBalance: number;
}

export default function PibgFees({ assignments, walletBalance }: Props) {
    const unpaid = assignments.filter(a => a.status === 'unpaid');
    const paid = assignments.filter(a => a.status === 'paid');

    const handlePay = (assignment: Assignment) => {
        const amount = assignment.fee.amount;

        if (walletBalance < amount) {
            alert(`Insufficient wallet balance. You need RM ${Number(amount).toFixed(2)} but have RM ${Number(walletBalance).toFixed(2)}. Please top up first.`);
            return;
        }

        if (!confirm(`Pay RM ${Number(amount).toFixed(2)} for ${assignment.fee.name} (${assignment.fee.school?.name})?\n\nThis will be deducted from your wallet.`)) {
            return;
        }

        router.post(`/parent/pibg-fees/${assignment.id}/pay`, {
            payment_method: 'wallet',
        });
    };

    return (
        <ParentLayout title="PIBG Fees">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">PIBG Fees</h1>
            <p className="text-sm text-gray-500 mb-6">Wallet Balance: <span className="font-semibold text-blue-600">RM {Number(walletBalance).toFixed(2)}</span></p>

            {/* Unpaid */}
            {unpaid.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Outstanding ({unpaid.length})</h2>
                    <div className="space-y-3 mb-8">
                        {unpaid.map(a => (
                            <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">{a.fee.name}</p>
                                    <p className="text-xs text-gray-500">{a.fee.school?.name} &middot; {a.fee.academic_year}</p>
                                    <p className="text-xs text-amber-600 mt-1">Due: {new Date(a.fee.due_date).toLocaleDateString('ms-MY')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-amber-600 mb-2">RM {Number(a.fee.amount).toFixed(2)}</p>
                                    <button onClick={() => handlePay(a)}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {unpaid.length === 0 && (
                <div className="bg-green-50 rounded-2xl p-6 text-center mb-8">
                    <p className="text-green-700 font-medium">All PIBG fees are paid!</p>
                </div>
            )}

            {/* Paid */}
            {paid.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Paid ({paid.length})</h2>
                    <div className="space-y-3">
                        {paid.map(a => (
                            <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">{a.fee.name}</p>
                                    <p className="text-xs text-gray-500">{a.fee.school?.name} &middot; {a.fee.academic_year}</p>
                                    <p className="text-xs text-green-600 mt-1">Paid: {a.paid_at ? new Date(a.paid_at).toLocaleString('ms-MY') : ''}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">RM {Number(a.amount_paid).toFixed(2)}</p>
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Paid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </ParentLayout>
    );
}
