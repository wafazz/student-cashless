import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { PageProps } from 'types/models';

const navItems = [
    { label: 'Dashboard', href: '/operator/dashboard', icon: '🏠' },
    { label: 'Scan & Charge', href: '/operator/scan', icon: '📷' },
    { label: 'Sales', href: '/operator/sales', icon: '📊' },
    { label: 'Menu', href: '/operator/menu', icon: '🍽️' },
];

export default function OperatorLayout({ children, title }: { children: ReactNode; title: string }) {
    const { auth, flash } = usePage().props as unknown as PageProps;
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
                <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-bold text-green-600">e-Kantin</span>
                    <Link href="/operator/scan" className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                        Scan
                    </Link>
                </header>

                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-green-600">e-Kantin</h1>
                        <p className="text-xs text-gray-500 mt-1">Canteen Operator</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                    window.location.pathname.startsWith(item.href)
                                        ? 'bg-green-50 text-green-700'
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
