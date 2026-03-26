import { Head, Link } from '@inertiajs/react';

export default function Landing() {
    return (
        <>
            <Head title="Student Cashless - Cashless School Payment System" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
                    <img src="/logo.png" alt="Student Cashless" className="max-w-[200px]" />
                    <div className="flex gap-3">
                        <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                            Log In
                        </Link>
                        <Link href="/register" className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                            Register
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <section className="px-6 py-20 max-w-6xl mx-auto text-center">
                    <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                        Cashless School Payment
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        No Cash, No Worry.<br />
                        <span className="text-blue-600">Just Scan & Pay.</span>
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
                        Student Cashless is a cashless payment system for school canteens and koperasi. Parents top up wallets,
                        students show QR codes, and store operators scan to charge. Simple, safe, and transparent.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            Get Started Free
                        </Link>
                        <Link href="/school-register" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            Register Your School
                        </Link>
                        <Link href="/login" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:border-blue-300 transition-colors">
                            Log In
                        </Link>
                    </div>
                </section>

                {/* How it Works */}
                <section className="px-6 py-16 max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-12">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StepCard
                            step="1"
                            title="Parent Tops Up"
                            description="Register, add your children, and top up their digital wallet via FPX or manual transfer."
                            icon="💰"
                        />
                        <StepCard
                            step="2"
                            title="Student Shows QR"
                            description="Each child gets a unique QR code. Print it on a card or lanyard — no phone needed."
                            icon="📱"
                        />
                        <StepCard
                            step="3"
                            title="Store Scans & Charges"
                            description="Operator scans the QR, selects items from the menu, and the wallet is instantly debited."
                            icon="✅"
                        />
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 py-16 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-800 text-center mb-12">Features</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureCard icon="🔒" title="Secure QR" description="UUID-based QR codes with no sensitive data exposed" />
                            <FeatureCard icon="📊" title="Real-Time Tracking" description="Parents see every purchase instantly with full history" />
                            <FeatureCard icon="⏰" title="Daily Limits" description="Set spending limits per child to control daily expenses" />
                            <FeatureCard icon="🔔" title="Low Balance Alerts" description="Get notified when your child's balance runs low" />
                            <FeatureCard icon="🏫" title="Multi-School" description="One platform serves multiple schools and canteens" />
                            <FeatureCard icon="💳" title="FPX Payment" description="Top up instantly via online banking (FPX)" />
                            <FeatureCard icon="📱" title="Mobile Ready" description="Works on any phone — PWA enabled for quick access" />
                            <FeatureCard icon="📄" title="Receipt PDF" description="Download transaction receipts anytime" />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-6 py-8 text-center text-sm text-gray-400 border-t border-gray-100">
                    <p>&copy; {new Date().getFullYear()} Student Cashless. Cashless School Payment System.</p>
                </footer>
            </div>
        </>
    );
}

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: string }) {
    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                {icon}
            </div>
            <div className="text-xs font-bold text-blue-600 mb-2">STEP {step}</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-6">
            <span className="text-2xl">{icon}</span>
            <h4 className="font-semibold text-gray-800 mt-3 mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}
