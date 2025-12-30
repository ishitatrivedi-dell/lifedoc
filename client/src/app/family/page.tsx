'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaUser, FaHeartbeat, FaChevronRight, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import HealthSparkline from '@/components/HealthSparkline';

export default function FamilyDashboard() {
    const [members, setMembers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dependent'); // 'dependent' | 'invite'
    const router = useRouter();

    // Form state
    const [newMember, setNewMember] = useState({
        name: '',
        relation: '',
        age: '',
        gender: 'male',
        chronicConditions: '',
        accessLevel: 'child'
    });

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRelation, setInviteRelation] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [membersRes, requestsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/family/members', { headers }),
                axios.get('http://localhost:5000/api/family/requests', { headers }).catch(() => ({ data: { requests: [] } })) // Fallback if route fails
            ]);

            if (membersRes.data.success) {
                setMembers(membersRes.data.members);
            }
            if (requestsRes.data && requestsRes.data.success) {
                setRequests(requestsRes.data.requests);
            }
        } catch (error) {
            console.error("Error fetching family data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const conditionsArray = newMember.chronicConditions.split(',').map(c => c.trim()).filter(Boolean);

            await axios.post('http://localhost:5000/api/family/add-member', {
                ...newMember,
                chronicConditions: conditionsArray
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowAddModal(false);
            setNewMember({ name: '', relation: '', age: '', gender: 'male', chronicConditions: '' });
            fetchData();
        } catch (error) {
            console.error("Error adding member", error);
            alert("Failed to add member");
        }
    };

    const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });

    const handleInviteWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteStatus({ type: 'loading', message: 'Sending invitation...' });

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/family/invite', {
                email: inviteEmail,
                relation: inviteRelation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInviteStatus({ type: 'success', message: 'Invitation sent! Waiting for acceptance.' });
            setTimeout(() => {
                setShowAddModal(false);
                setInviteEmail('');
                setInviteRelation('');
                setInviteStatus({ type: '', message: '' });
            }, 2000);

        } catch (error: any) {
            console.error("Error sending invite", error);
            const msg = error.response?.data?.message || "Failed to invite user.";
            setInviteStatus({ type: 'error', message: msg });
        }
    }

    // ... (keep default)



    const handleRespond = async (familyId: string, action: 'accept' | 'reject') => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/family/respond', { familyId, action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refresh to see changes
        } catch (error) {
            console.error("Error responding", error);
            alert("Failed to respond");
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Family Health</h1>
                    <p className="text-gray-500 mt-1">Manage health records for your loved ones</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-md"
                >
                    <FaUserPlus />
                    <span>Add Member</span>
                </button>
            </div>

            {/* Incoming Requests */}
            {requests.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center space-x-2">
                        <FaEnvelope />
                        <span>Incoming Family Requests</span>
                    </h2>
                    <div className="space-y-3">
                        {requests.map((req: any) => (
                            <div key={req.familyId} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="font-bold text-gray-900">{req.adminName} ({req.adminEmail})</p>
                                    <p className="text-sm text-gray-500">Wants to add you as <span className="font-medium text-gray-700">{req.relationshipToAdmin}</span></p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleRespond(req.familyId, 'reject')}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleRespond(req.familyId, 'accept')}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Members</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{members.filter((m: any) => m.status !== 'pending').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
                        <FaUser />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">High Risk Alerts</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-xl">
                        <FaHeartbeat />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Pending Invites</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{members.filter((m: any) => m.status === 'pending').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center text-xl">
                        <FaEnvelope />
                    </div>
                </div>

            </div>

            {/* Members Grid */}
            <h2 className="text-xl font-bold text-gray-900">Your Family</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {loading ? <div className="col-span-3 text-center py-10">Loading...</div> : members.map((member: any) => {
                    // Prepare data for charts. 
                    // Note: BP is complex (object), sparkline expects simple number usually.
                    // For BP sparkline, let's plot Systolic for simplicity or just average.
                    const bpData = member.healthData?.bp?.map((d: any) => ({ value: d.value.systolic })) || [];
                    const weightData = member.healthData?.weight?.map((d: any) => ({ value: d.value })) || [];
                    const glucoseData = member.healthData?.glucose?.map((d: any) => ({ value: d.value })) || [];

                    const latestBp = member.healthData?.bp?.length ? `${member.healthData.bp[member.healthData.bp.length - 1].value.systolic}/${member.healthData.bp[member.healthData.bp.length - 1].value.diastolic}` : 'N/A';
                    const latestWeight = member.healthData?.weight?.length ? member.healthData.weight[member.healthData.weight.length - 1].value : 'N/A';
                    const latestGlucose = member.healthData?.glucose?.length ? member.healthData.glucose[member.healthData.glucose.length - 1].value : 'N/A';

                    return (
                        <div key={member._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative">
                            {member.status === 'pending' && (
                                <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl-lg font-bold z-10">
                                    Pending
                                </div>
                            )}
                            <div className="p-6 pb-4">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-sm ${member.status === 'pending' ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-100">
                                                {member.relationship}
                                            </span>
                                            {member.accessLevel && member.accessLevel !== 'member' && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${member.accessLevel === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                        member.accessLevel === 'caregiver' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    {member.accessLevel.charAt(0).toUpperCase() + member.accessLevel.slice(1)}
                                                </span>
                                            )}
                                            <span className="text-sm text-gray-500">• {member.userId?.age || member.age || '?'} yrs</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Graphical Health Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <HealthSparkline
                                        data={bpData}
                                        dataKey="value"
                                        color="#ef4444"
                                        label="BP"
                                        unit="mmHg"
                                        latestValue={latestBp}
                                    />
                                    <HealthSparkline
                                        data={weightData}
                                        dataKey="value"
                                        color="#3b82f6"
                                        label="Weight"
                                        unit="kg"
                                        latestValue={latestWeight}
                                    />
                                    <HealthSparkline
                                        data={glucoseData}
                                        dataKey="value"
                                        color="#10b981"
                                        label="Glucose"
                                        unit="mg/dL"
                                        latestValue={latestGlucose}
                                    />
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {/* Placeholder for future shared tags or mini icons */}
                                    </div>
                                    {member.status === 'active' && (
                                        <Link href={`/family/${member.userId?._id}`} className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 py-2 rounded-full font-medium transition-colors flex items-center space-x-1">
                                            <span>View Full Details</span>
                                            <FaChevronRight className="text-[10px]" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {members.length === 0 && !loading && (
                    <div className="col-span-3 text-center py-10 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-500">No family members yet. Add one to get started!</p>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Family Member</h2>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setActiveTab('dependent')}
                                className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'dependent' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Create Dependent
                            </button>
                            <button
                                onClick={() => setActiveTab('invite')}
                                className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'invite' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Invite by Email
                            </button>
                        </div>

                        {activeTab === 'dependent' ? (
                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                                        <select
                                            value={newMember.relation}
                                            onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        >
                                            <option value="">Select...</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Spouse">Spouse</option>
                                            <option value="Child">Child</option>
                                            <option value="Grandparent">Grandparent</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                        <input
                                            type="number"
                                            value={newMember.age}
                                            onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <div className="flex space-x-4 mt-1">
                                        {['male', 'female', 'other'].map(g => (
                                            <label key={g} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={g}
                                                    checked={newMember.gender === g}
                                                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="capitalize text-gray-700">{g}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions (Optional)</label>
                                    <input
                                        type="text"
                                        value={newMember.chronicConditions}
                                        onChange={(e) => setNewMember({ ...newMember, chronicConditions: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Diabetes, Hypertension (comma separated)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
                                >
                                    Create Dependent Profile
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    For dependents who don't have their own account.
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleInviteWrapper} className="space-y-4">
                                {inviteStatus.message && (
                                    <div className={`text-sm p-3 rounded-lg ${inviteStatus.type === 'error' ? 'bg-red-50 text-red-600' : inviteStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {inviteStatus.message}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                                    <select
                                        value={inviteRelation}
                                        onChange={(e) => setInviteRelation(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">Select...</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Child">Child</option>
                                        <option value="Friend">Friend</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={inviteStatus.type === 'loading'}
                                    className={`w-full font-medium py-2.5 rounded-lg transition-colors mt-2 text-white ${inviteStatus.type === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {inviteStatus.type === 'loading' ? 'Sending...' : 'Send Invitation'}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    They will receive a request in their Family section.
                                </p>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
