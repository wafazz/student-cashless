import { router } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, Transaction } from 'types/models';
import { useState } from 'react';

interface Props {
    canteen: Canteen | null;
    recentCharges: (Transaction & { display_name?: string })[];
}

export default function Refund({ canteen, recentCharges }: Props) {
    const [processing, setProcessing] = useState<number | null>(null);

    if (!canteen) {
        return (
            <OperatorLayout title="Refund">
                <div className="text-center py-12">
                    <p className="text-gray-500">No store assigned.</p>
                </div>
            </OperatorLayout>
        );
    }

    const handleRefund = (txId: number) => {
        if (!confirm('Are you sure you want to refund this transaction? This will credit the amount back to the student\'s wallet.')) {
            return;
        }

        setProcessing(txId);
        router.post('/operator/refund', {
            transaction_id: txId,
        }, {
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <OperatorLayout title="Refund">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Refund</h1>
            <p className="text-sm text-gray-500 mb-6">Refund today's transactions. Only same-day refunds are allowed.</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {recentCharges.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No charges today to refund.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentCharges.map((tx) => (
                            <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{tx.display_name || tx.student?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">
                                        {tx.description || 'Purchase'} &middot; {new Date(tx.created_at).toLocaleTimeString('ms-MY')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-700">
                                        RM {Number(tx.amount).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => handleRefund(tx.id)}
                                        disabled={processing === tx.id}
                                        className="bg-orange-500 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {processing === tx.id ? 'Processing...' : 'Refund'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </OperatorLayout>
    );
}
