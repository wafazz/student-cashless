import { useForm, Link } from '@inertiajs/react';
import AuthLayout from 'layouts/AuthLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthLayout title="Log In">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Log In</h2>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="email@example.com"
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter password"
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={data.remember}
                        onChange={e => setData('remember', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
            </p>
        </AuthLayout>
    );
}
