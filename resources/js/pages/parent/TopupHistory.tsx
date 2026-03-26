import { Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { Topup } from 'types/models';

interface Props {
    topups: {
        data: Topup[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function TopupHistory({ topups }: Props) {
    const statusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-50 text-green-700';
            case 'pending': return 'bg-yellow-50 text-yellow-700';
            case 'failed': return 'bg-red-50 text-red-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    return (
        <ParentLayout title="Top Up History">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Top Up History</h1>
                <Link href="/parent/topup" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                    + Top Up
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {topups.data.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No top ups yet.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {topups.data.map((topup) => (
                                <div key={topup.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{topup.student?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {topup.payment_method === 'fpx' ? 'FPX' : 'Manual'} &middot; {new Date(topup.created_at).toLocaleString('ms-MY')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-green-600">+RM {Number(topup.amount).toFixed(2)}</span>
                                        <span className={`block text-xs px-2 py-0.5 rounded-full mt-1 ${statusColor(topup.status)}`}>
                                            {topup.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                            {topups.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-lg text-sm ${
                                        link.active ? 'bg-blue-600 text-white' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </ParentLayout>
    );
}
