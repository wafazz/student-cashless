import { router, usePage } from '@inertiajs/react';
import OperatorLayout from 'layouts/OperatorLayout';
import { Canteen, MenuItem, PageProps } from 'types/models';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import Swal from 'sweetalert2';

interface StudentInfo {
    type?: 'student' | 'parent';
    id: number;
    name: string;
    class_name: string;
    school: string;
    wallet_balance: number;
    daily_limit: number | null;
    daily_spent: number;
    photo: string | null;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    qty: number;
}

interface Props {
    canteen: (Canteen & { menuItems: MenuItem[]; school?: { name: string } }) | null;
}

const storeLabel = (type?: string) => type === 'koperasi' ? 'Koperasi' : 'Kantin';

export default function Scan({ canteen }: Props) {
    const { flash } = usePage().props as unknown as PageProps;
    const [step, setStep] = useState<'scan' | 'charge' | 'success'>('scan');
    const [student, setStudent] = useState<StudentInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
    const cartDescription = cart.map(c => c.qty > 1 ? `${c.name} x${c.qty}` : c.name).join(', ');

    const availableItems = useMemo(() => {
        if (!canteen?.menuItems) return [];
        const items = canteen.menuItems.filter(i => i.is_available);
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter(i => i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q));
    }, [canteen?.menuItems, search]);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
            return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === id);
            if (existing && existing.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
            return prev.filter(c => c.id !== id);
        });
    };

    const clearCart = () => setCart([]);

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

    // Show SweetAlert for flash errors (e.g. daily limit, insufficient balance)
    useEffect(() => {
        if (flash.error) {
            const isDailyLimit = flash.error.toLowerCase().includes('daily limit');
            const isLowBalance = flash.error.toLowerCase().includes('insufficient');

            Swal.fire({
                icon: isDailyLimit ? 'warning' : isLowBalance ? 'error' : 'error',
                title: isDailyLimit ? 'Daily Limit Reached' : isLowBalance ? 'Insufficient Balance' : 'Transaction Failed',
                text: flash.error,
                confirmButtonColor: '#16a34a',
                confirmButtonText: 'OK',
            });
        }
        if (flash.success && step === 'charge') {
            setStep('success');
        }
    }, [flash]);

    const handleLookup = async (uuid: string) => {
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/operator/lookup', { wallet_uuid: uuid });

            // Check daily limit warning on lookup
            if (data.daily_limit !== null) {
                const remaining = data.daily_limit - data.daily_spent;

                if (remaining <= 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Daily Limit Reached',
                        html: `<b>${data.name}</b> has reached the daily spending limit.<br><br>` +
                            `<span style="color:#666">Spent: RM ${Number(data.daily_spent).toFixed(2)} / RM ${Number(data.daily_limit).toFixed(2)}</span>`,
                        confirmButtonColor: '#16a34a',
                        confirmButtonText: 'OK',
                    });
                    setStep('scan');
                    setLoading(false);
                    return;
                }

                if (remaining < 3) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Almost at Daily Limit',
                        html: `<b>${data.name}</b> has only <b>RM ${remaining.toFixed(2)}</b> left for today.<br><br>` +
                            `<span style="color:#666">Spent: RM ${Number(data.daily_spent).toFixed(2)} / RM ${Number(data.daily_limit).toFixed(2)}</span>`,
                        confirmButtonColor: '#16a34a',
                        confirmButtonText: 'Continue',
                    });
                }
            }

            setStudent(data);
            setStep('charge');
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to find student';
            setError(msg);
            setStep('scan');
        } finally {
            setLoading(false);
        }
    };

    const handleCharge = () => {
        if (!student || cart.length === 0) return;

        const chargeAmount = cartTotal;

        if (student.daily_limit !== null) {
            const remaining = student.daily_limit - student.daily_spent;
            if (chargeAmount > remaining) {
                Swal.fire({
                    icon: 'error',
                    title: 'Daily Limit Exceeded',
                    html: `Cannot charge <b>RM ${chargeAmount.toFixed(2)}</b>.<br><br>` +
                        `<b>${student.name}</b> only has <b>RM ${remaining.toFixed(2)}</b> remaining for today.<br>` +
                        `<span style="color:#666">Spent: RM ${Number(student.daily_spent).toFixed(2)} / RM ${Number(student.daily_limit).toFixed(2)}</span>`,
                    confirmButtonColor: '#16a34a',
                    confirmButtonText: 'OK',
                });
                return;
            }
        }

        if (chargeAmount > student.wallet_balance) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Balance',
                html: `Cannot charge <b>RM ${chargeAmount.toFixed(2)}</b>.<br><br>` +
                    `<b>${student.name}</b>'s balance is only <b>RM ${Number(student.wallet_balance).toFixed(2)}</b>.`,
                confirmButtonColor: '#16a34a',
                confirmButtonText: 'OK',
            });
            return;
        }

        setLoading(true);
        router.post('/operator/charge', {
            ...(student.type === 'parent' ? { parent_id: student.id } : { student_id: student.id }),
            amount: chargeAmount,
            description: cartDescription,
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

    const resetScan = () => {
        setStep('scan');
        setStudent(null);
        setCart([]);
        setSearch('');
        setError('');
    };

    if (!canteen) {
        return (
            <OperatorLayout title="Scan">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-6xl mb-4">🏪</p>
                        <p className="text-gray-500">No store assigned to your account.</p>
                        <p className="text-sm text-gray-400 mt-2">Contact admin to set up your store.</p>
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
                        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Scan QR Code</h1>
                        <p className="text-sm text-gray-500 text-center mb-1">Point camera at customer's QR code</p>
                        <p className="text-xs text-green-600 text-center mb-6 font-medium">{canteen.name} ({storeLabel(canteen.type)})</p>

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

                        {/* Student Info with Photo Verification */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
                            {student.photo ? (
                                <div className="mb-3">
                                    <img
                                        src={student.photo}
                                        alt={student.name}
                                        className="w-52 h-68 object-cover rounded-2xl border-4 border-green-500 mx-auto shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => Swal.fire({
                                            imageUrl: student.photo!,
                                            imageAlt: student.name,
                                            title: student.name,
                                            text: `${student.class_name} · ${student.school}`,
                                            showConfirmButton: false,
                                            showCloseButton: true,
                                            customClass: { image: 'rounded-2xl' },
                                        })}
                                    />
                                    <span className="inline-block bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full mt-2">
                                        Verify Student Identity
                                    </span>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">👤</span>
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                            <p className="text-sm text-gray-500">{student.class_name} &middot; {student.school}</p>
                            <div className="mt-4 bg-green-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600">Balance</p>
                                <p className="text-3xl font-bold text-green-600">RM {Number(student.wallet_balance).toFixed(2)}</p>
                                {student.daily_limit !== null && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">
                                            Daily: RM {Number(student.daily_spent).toFixed(2)} / RM {Number(student.daily_limit).toFixed(2)}
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className={`h-1.5 rounded-full ${
                                                    student.daily_spent / student.daily_limit > 0.9 ? 'bg-red-500' :
                                                    student.daily_spent / student.daily_limit > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(100, (student.daily_spent / student.daily_limit) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Items */}
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                    placeholder={canteen.type === 'koperasi' ? 'Search products...' : 'Search menu items...'}
                                    autoFocus
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-sm">✕</button>
                                )}
                            </div>
                        </div>

                        {/* Item Grid */}
                        {availableItems.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {availableItems.map((item) => {
                                    const inCart = cart.find(c => c.id === item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => addToCart(item)}
                                            className={`p-3 rounded-xl border text-left text-sm transition-colors relative ${
                                                inCart ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <span className="block text-xs text-gray-500">RM {Number(item.price).toFixed(2)}</span>
                                            {item.category && <span className="block text-[10px] text-gray-400 mt-0.5">{item.category}</span>}
                                            {inCart && (
                                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                    {inCart.qty}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-6 text-center mb-4">
                                <p className="text-gray-400 text-sm">{search ? 'No items match your search' : 'No items available'}</p>
                            </div>
                        )}

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-gray-800">Order ({cart.reduce((s, c) => s + c.qty, 0)} items)</p>
                                    <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Clear All</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                                            <div className="flex items-center gap-2 mr-3">
                                                <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">−</button>
                                                <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                                                <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, category: null, is_available: true, canteen_id: 0, created_at: '', updated_at: '' })} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">+</button>
                                            </div>
                                            <span className="text-sm font-semibold text-green-600 w-20 text-right">RM {(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-200">
                                    <span className="font-bold text-gray-800">Total</span>
                                    <span className="text-xl font-bold text-green-600">RM {cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Charge Button */}
                        <button
                            onClick={handleCharge}
                            disabled={cart.length === 0 || loading}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Charge RM ${cartTotal.toFixed(2)}`}
                        </button>
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
