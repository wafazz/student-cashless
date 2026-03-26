import { Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { QRCodeSVG } from 'qrcode.react';
import { User } from 'types/models';

interface Props {
    user: User & { wallet_uuid: string; wallet_balance: number };
}

export default function WalletQr({ user }: Props) {
    return (
        <ParentLayout title="My QR Code">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My QR Code</h1>
                <Link href="/parent/wallet" className="text-sm text-blue-600 hover:underline">← Back to Wallet</Link>
            </div>

            <div className="max-w-sm mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="bg-blue-50 rounded-xl p-6 inline-block mb-4">
                        <QRCodeSVG
                            value={user.wallet_uuid}
                            size={220}
                            level="H"
                            includeMargin
                        />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Parent — General Wallet</p>
                    <div className="bg-blue-50 rounded-xl p-4 mt-4">
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="text-2xl font-bold text-blue-600">RM {Number(user.wallet_balance).toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        Show this QR code at the canteen to pay from your wallet
                    </p>
                </div>
            </div>
        </ParentLayout>
    );
}
