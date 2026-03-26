import { Link, useForm } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { User, Student } from 'types/models';

interface Props {
    user: User & { wallet_balance: number; wallet_uuid: string };
    students: Student[];
}

export default function Wallet({ user, students }: Props) {
    const form = useForm({ student_id: '', amount: '' });

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/parent/wallet/transfer', { onSuccess: () => form.reset() });
    };

    return (
        <ParentLayout title="My Wallet">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">General Wallet</h1>

            <div className="max-w-lg mx-auto space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg">
                    <p className="text-sm text-blue-200">My Wallet Balance</p>
                    <p className="text-4xl font-black mt-2">RM {Number(user.wallet_balance).toFixed(2)}</p>
                    <div className="flex gap-3 justify-center mt-6">
                        <Link href="/parent/wallet/topup"
                            className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            + Top Up
                        </Link>
                        <Link href="/parent/wallet/qr"
                            className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            My QR Code
                        </Link>
                    </div>
                </div>

                {/* Transfer to Child */}
                {students.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Transfer to Child</h2>
                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
                                <div className="space-y-2">
                                    {students.map(s => (
                                        <button key={s.id} type="button"
                                            onClick={() => form.setData('student_id', String(s.id))}
                                            className={`w-full p-4 rounded-xl border text-left transition-colors ${
                                                form.data.student_id === String(s.id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <span className="font-medium text-gray-800">{s.name}</span>
                                            <span className="block text-sm text-gray-500">
                                                Balance: RM {Number(s.wallet_balance).toFixed(2)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.data.student_id && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RM)</label>
                                        <input type="number" step="1" min="1" max={user.wallet_balance}
                                            value={form.data.amount} onChange={e => form.setData('amount', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00" />
                                        {form.errors.amount && <p className="text-red-500 text-xs mt-1">{form.errors.amount}</p>}
                                    </div>

                                    <button type="submit" disabled={form.processing || !form.data.amount}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50">
                                        {form.processing ? 'Transferring...' : `Transfer RM ${Number(form.data.amount || 0).toFixed(2)}`}
                                    </button>
                                </>
                            )}
                        </form>
                        {form.errors.student_id && <p className="text-red-500 text-xs mt-2">{form.errors.student_id}</p>}
                    </div>
                )}

                <p className="text-center text-xs text-gray-400">
                    Transfer is one-way only: your wallet → child's wallet. No fees charged.
                </p>
            </div>
        </ParentLayout>
    );
}
