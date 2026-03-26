import { Link, router } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';

interface Notification {
    id: string;
    data: { title: string; message: string };
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: {
        data: Notification[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Notifications({ notifications }: Props) {
    const markAllRead = () => {
        router.post('/parent/notifications/mark-read');
    };

    const hasUnread = notifications.data.some(n => !n.read_at);

    return (
        <ParentLayout title="Notifications">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                {hasUnread && (
                    <button
                        onClick={markAllRead}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {notifications.data.length === 0 ? (
                    <p className="p-6 text-gray-500 text-center">No notifications yet.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-6 py-4 ${!notification.read_at ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {!notification.read_at && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                )}
                                                <p className="text-sm font-medium text-gray-800">
                                                    {notification.data.title}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.data.message}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                                            {new Date(notification.created_at).toLocaleDateString('ms-MY', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-1">
                            {notifications.links.map((link, i) => (
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
