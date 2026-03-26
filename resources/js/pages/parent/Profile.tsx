import { useForm } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { User } from 'types/models';

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/parent/profile');
    };

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/parent/profile/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <ParentLayout title="Profile">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                <form onSubmit={updateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profileForm.data.name}
                            onChange={e => profileForm.setData('name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {profileForm.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={profileForm.data.email}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={profileForm.data.phone}
                            onChange={e => profileForm.setData('phone', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="012-3456789"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={profileForm.processing}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {profileForm.processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
                <form onSubmit={updatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwordForm.data.current_password}
                            onChange={e => passwordForm.setData('current_password', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {passwordForm.errors.current_password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.current_password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwordForm.data.password}
                            onChange={e => passwordForm.setData('password', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {passwordForm.errors.password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={passwordForm.processing}
                        className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-900 disabled:opacity-50"
                    >
                        {passwordForm.processing ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </ParentLayout>
    );
}
