import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function AuthLayout({ children, title }: { children: ReactNode; title: string }) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Student Cashless" className="max-w-[200px] mx-auto" />
                        <p className="text-gray-500 mt-2">Cashless School Payment System</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
