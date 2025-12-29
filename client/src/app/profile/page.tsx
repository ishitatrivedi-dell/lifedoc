'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserProfile, uploadProfilePhoto } from '@/store/slices/authSlice';
import { FaUser, FaEnvelope, FaBirthdayCake, FaIdCard, FaEdit, FaTimes, FaSave, FaCamera } from 'react-icons/fa';

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editing State (Modal)
    const [editSection, setEditSection] = useState<'personal' | 'health' | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        bloodGroup: '',
        chronicConditions: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                age: user.age?.toString() || '',
                gender: user.profile?.gender || '',
                height: user.profile?.height?.toString() || '',
                weight: user.profile?.weight?.toString() || '',
                bloodGroup: user.profile?.bloodGroup || '',
                chronicConditions: user.profile?.chronicConditions?.join(', ') || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await dispatch(uploadProfilePhoto(e.target.files[0]));
        }
    };

    const handleSave = async () => {
        const payload: any = {};

        if (editSection === 'personal') {
            if (formData.name) payload.name = formData.name;
        }

        if (editSection === 'health') {
            if (formData.age) payload.age = formData.age; // API expects Age on root
            if (formData.gender) payload.gender = formData.gender;
            if (formData.height) payload.height = parseFloat(formData.height);
            if (formData.weight) payload.weight = parseFloat(formData.weight);
            if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;
            if (formData.chronicConditions) {
                payload.chronicConditions = formData.chronicConditions.split(',').map((c: string) => c.trim()).filter(Boolean);
            }
        }

        await dispatch(updateUserProfile(payload));
        setEditSection(null);
    };

    const handleCloseModal = () => {
        setEditSection(null);
        // Reset form to current user state when closing without saving
        if (user) {
            setFormData({
                name: user.name || '',
                age: user.age?.toString() || '',
                gender: user.profile?.gender || '',
                height: user.profile?.height?.toString() || '',
                weight: user.profile?.weight?.toString() || '',
                bloodGroup: user.profile?.bloodGroup || '',
                chronicConditions: user.profile?.chronicConditions?.join(', ') || ''
            });
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col min-h-screen bg-white">
                    <header className="mb-8 flex justify-between items-end">
                        <div>
                            <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">My Account</p>
                            <h1 className="text-4xl font-extrabold text-gray-900">
                                Profile
                            </h1>
                        </div>
                    </header>

                    <div className="max-w-4xl">
                        {/* Profile Header Card */}
                        <div className="bg-gradient-primary rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-[#7A8E6B] shadow-md border-4 border-white/20 overflow-hidden">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : user?.profile?.photoUrl ? (
                                            <img src={user.profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-[#7A8E6B] transition-colors"
                                    >
                                        <FaCamera className="text-sm" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="text-center md:text-left text-white">
                                    <h2 className="text-3xl font-bold mb-2">{user?.name || 'User Name'}</h2>
                                    <p className="text-white/80 text-lg flex items-center justify-center md:justify-start gap-2">
                                        <FaEnvelope className="text-sm" />
                                        {user?.email || 'email@example.com'}
                                    </p>
                                    <div className="mt-4 flex gap-3 justify-center md:justify-start">
                                        <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                                            Patient
                                        </span>
                                        {user?.age && (
                                            <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2">
                                                <FaBirthdayCake className="text-xs" />
                                                {user.age} Years
                                            </span>
                                        )}
                                        {user?.profile?.bloodGroup && (
                                            <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                                                {user.profile.bloodGroup}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <FaIdCard className="text-[#7A8E6B]" />
                                        Personal Information
                                    </h3>
                                    <button
                                        onClick={() => setEditSection('personal')}
                                        className="text-gray-400 hover:text-[#7A8E6B] transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="text-gray-900 font-medium">{user?.name || '--'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="text-gray-900 font-medium">{user?.email || '--'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Account ID</p>
                                        <p className="text-gray-900 font-medium font-mono text-sm">{user?.id || '--'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Health Profile Summary */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <FaUser className="text-[#7A8E6B]" />
                                        Health Profile
                                    </h3>
                                    <button
                                        onClick={() => setEditSection('health')}
                                        className="text-gray-400 hover:text-[#7A8E6B] transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Age</p>
                                            <p className="text-gray-900 font-medium">{user?.age ? `${user.age} Years` : 'Not Set'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Gender</p>
                                            <p className="text-gray-900 font-medium capitalize">{user?.profile?.gender || '--'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Blood Type</p>
                                            <p className="text-gray-900 font-medium">{user?.profile?.bloodGroup || '--'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Height</p>
                                            <p className="text-gray-900 font-medium">{user?.profile?.height ? `${user.profile.height} cm` : '--'}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Weight</p>
                                            <p className="text-gray-900 font-medium">{user?.profile?.weight ? `${user.profile.weight} kg` : '--'}</p>
                                        </div>
                                        <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Chronic Conditions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user?.profile?.chronicConditions && user.profile.chronicConditions.length > 0 ? (
                                                    user.profile.chronicConditions.map((condition: string, idx: number) => (
                                                        <span key={idx} className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-sm font-medium">
                                                            {condition}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">None listed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {editSection && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Edit {editSection === 'personal' ? 'Personal Information' : 'Health Profile'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    {editSection === 'personal' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                            />
                                        </div>
                                    )}

                                    {editSection === 'health' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                                                <input
                                                    type="number"
                                                    name="age"
                                                    value={formData.age}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Height (cm)</label>
                                                <input
                                                    type="number"
                                                    name="height"
                                                    value={formData.height}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    value={formData.weight}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Type</label>
                                                <select
                                                    name="bloodGroup"
                                                    value={formData.bloodGroup}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Chronic Conditions (comma separated)</label>
                                                <input
                                                    type="text"
                                                    name="chronicConditions"
                                                    value={formData.chronicConditions}
                                                    onChange={handleInputChange}
                                                    placeholder="Diabetes, Hypertension"
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl bg-gray-50">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-5 py-2.5 rounded-xl font-semibold bg-[#7A8E6B] text-white hover:bg-[#6a7d5d] shadow-md shadow-[#7A8E6B]/20 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
