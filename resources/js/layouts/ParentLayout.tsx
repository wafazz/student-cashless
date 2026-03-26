import { Head, Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { PageProps } from 'types/models';

const navItems = [
    { label: 'Dashboard', href: '/parent/dashboard', icon: '🏠' },
    { label: 'Children', href: '/parent/children', icon: '👧' },
    { label: 'My Wallet', href: '/parent/wallet', icon: '💳' },
    { label: 'Top Up', href: '/parent/topup', icon: '💰' },
    { label: 'History', href: '/parent/transactions', icon: '📋' },
    { label: 'Notifications', href: '/parent/notifications', icon: '🔔' },
    { label: 'Profile', href: '/parent/profile', icon: '👤' },
];

export default function ParentLayout({ children, title }: { children: ReactNode; title: string }) {
    const { auth, flash, unreadNotifications } = usePage().props as unknown as PageProps;
    const [showFlash, setShowFlash] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (flash.success || flash.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), flash.error ? 5000 : 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-bold text-blue-600">e-Kantin</span>
                    <div className="flex items-center gap-2">
                        {unreadNotifications > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifications}</span>
                        )}
                        <span className="text-sm text-gray-500">{auth.user?.name}</span>
                    </div>
                </header>

                {/* Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-blue-600">e-Kantin</h1>
                        <p className="text-xs text-gray-500 mt-1">Parent Portal</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                    window.location.pathname.startsWith(item.href)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                        <div className="text-sm text-gray-700 mb-3 px-4">{auth.user?.name}</div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            Log Out
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:ml-64 p-4 lg:p-8">
                    {showFlash && flash.success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                            {flash.success}
                        </div>
                    )}
                    {showFlash && flash.error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </>
    );
}
