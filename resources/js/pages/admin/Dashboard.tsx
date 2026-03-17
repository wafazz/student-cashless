import AdminLayout from 'layouts/AdminLayout';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-6xl mb-4">🚧</p>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h2>
                <p className="text-gray-500">Admin panel features will be built in Phase 5.</p>
            </div>
        </AdminLayout>
    );
}
