import { router } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, MenuItem } from 'types/models';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface StudentInfo {
    id: number;
    name: string;
    class_name: string;
    school: string;
    wallet_balance: number;
    daily_limit: number | null;
    daily_spent: number;
    photo: string | null;
}

interface Props {
    canteen: (Canteen & { menuItems: MenuItem[] }) | null;
}

export default function Scan({ canteen }: Props) {
    const [step, setStep] = useState<'scan' | 'charge' | 'success'>('scan');
    const [student, setStudent] = useState<StudentInfo | null>(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (step === 'scan' && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner('qr-reader', {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            }, false);

            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    scannerRef.current = null;
                    handleLookup(decodedText);
                },
                () => {}
            );

            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, [step]);

    const handleLookup = async (uuid: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/operator/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ wallet_uuid: uuid }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Student not found');
            }

            const data = await response.json();
            setStudent(data);
            setStep('charge');
        } catch (err: any) {
            setError(err.message || 'Failed to find student');
            setStep('scan');
        } finally {
            setLoading(false);
        }
    };

    const handleCharge = () => {
        if (!student || !amount) return;

        setLoading(true);
        router.post('/operator/charge', {
            student_id: student.id,
            amount: parseFloat(amount),
            description: description,
        }, {
            onSuccess: () => {
                setStep('success');
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    const handleQuickSelect = (item: MenuItem) => {
        setAmount(String(item.price));
        setDescription(item.name);
    };

    const resetScan = () => {
        setStep('scan');
        setStudent(null);
        setAmount('');
        setDescription('');
        setError('');
    };

    if (!canteen) {
        return (
            <OperatorLayout title="Scan">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-6xl mb-4">🏪</p>
                        <p className="text-gray-500">No canteen assigned to your account.</p>
                        <p className="text-sm text-gray-400 mt-2">Contact admin to set up your canteen.</p>
                    </div>
                </div>
            </OperatorLayout>
        );
    }

    return (
        <OperatorLayout title="Scan & Charge">
            <div className="max-w-lg mx-auto">
                {/* Step: Scan */}
                {step === 'scan' && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Scan Student QR</h1>
                        <p className="text-sm text-gray-500 text-center mb-6">Point camera at student's QR code</p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Looking up student...</p>
                            </div>
                        )}

                        <div id="qr-reader" className="rounded-2xl overflow-hidden border border-gray-200"></div>
                    </div>
                )}

                {/* Step: Charge */}
                {step === 'charge' && student && (
                    <div>
                        <button onClick={resetScan} className="text-sm text-green-600 hover:underline mb-4">
                            &larr; Scan another
                        </button>

                        {/* Student Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">👤</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                            <p className="text-sm text-gray-500">{student.class_name} &middot; {student.school}</p>
                            <div className="mt-4 bg-green-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600">Balance</p>
                                <p className="text-3xl font-bold text-green-600">RM {Number(student.wallet_balance).toFixed(2)}</p>
                                {student.daily_limit && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Daily: RM {Number(student.daily_spent).toFixed(2)} / RM {Number(student.daily_limit).toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Select Menu */}
                        {canteen.menuItems && canteen.menuItems.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {canteen.menuItems.filter(i => i.is_available).map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleQuickSelect(item)}
                                            className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                                                description === item.name
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <span className="block text-xs text-gray-500">RM {Number(item.price).toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amount Input */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RM)</label>
                                <input
                                    type="number"
                                    step="0.10"
                                    min="0.10"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-2xl font-bold text-center focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="e.g. Nasi Lemak + Milo"
                                />
                            </div>

                            <button
                                onClick={handleCharge}
                                disabled={!amount || parseFloat(amount) < 0.10 || loading}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : `Charge RM ${amount ? parseFloat(amount).toFixed(2) : '0.00'}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 mb-8">Transaction recorded successfully.</p>
                        <button
                            onClick={resetScan}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                        >
                            Scan Next Student
                        </button>
                    </div>
                )}
            </div>
        </OperatorLayout>
    );
}
