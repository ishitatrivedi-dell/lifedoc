'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserProfile, uploadProfilePhoto, fetchUserProfile } from '@/store/slices/authSlice';
import { FaUser, FaEnvelope, FaBirthdayCake, FaIdCard, FaEdit, FaTimes, FaSave, FaCamera, FaStethoscope, FaCheck, FaChevronRight } from 'react-icons/fa';

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, token } = useSelector((state: RootState) => state.auth);
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

    // Explain Yourself State
    const [showExplainModal, setShowExplainModal] = useState(false);
    const [explainStep, setExplainStep] = useState(1); // 1: Disease, 2: Questions, 3: Analysis
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const commonDiseases = ["Diabetes", "Hypertension", "Asthma", "Arthritis", "Heart Disease", "Thyroid", "None of these"];

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

    const handleDiseaseToggle = (disease: string) => {
        if (disease === "None of these") {
            setSelectedDiseases(["None of these"]);
            return;
        }

        let newSelection = [...selectedDiseases];
        if (newSelection.includes("None of these")) {
            newSelection = [];
        }

        if (newSelection.includes(disease)) {
            newSelection = newSelection.filter(d => d !== disease);
        } else {
            newSelection.push(disease);
        }
        setSelectedDiseases(newSelection);
    };

    const startQuestionnaire = async () => {
        if (selectedDiseases.length === 0) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ diseases: selectedDiseases })
            });
            const data = await response.json();
            setQuestions(data);
            setExplainStep(2);
        } catch (error) {
            console.error("Error generating questions", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnswerChange = (index: number, answer: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].ans = answer;
        setQuestions(updatedQuestions);
    };

    const handleSubmitAll = () => {
        // Transform questions to the format expected by the API
        const formattedAnswers = questions.map(q => ({
            question: q.question,
            answer: q.ans
        }));
        submitAnswers(formattedAnswers);
    };

    const submitAnswers = async (finalAnswers: any[]) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/analyze-lifestyle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: finalAnswers,
                    diseases: selectedDiseases,
                    additionalDetails: additionalDetails,
                    userProfile: {
                        age: user?.age,
                        gender: user?.profile?.gender,
                        height: user?.profile?.height,
                        weight: user?.profile?.weight,
                        bloodGroup: user?.profile?.bloodGroup
                    }
                })
            });
            const data = await response.json();
            setAnalysisResult(data.summary);
            setExplainStep(3);
            // Refresh user profile to show new storyDesc
            dispatch(fetchUserProfile());
        } catch (error) {
            console.error("Error analyzing answers", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const closeExplainModal = () => {
        setShowExplainModal(false);
        setExplainStep(1);
        setSelectedDiseases([]);
        setQuestions([]);
        setAdditionalDetails('');
        setAnalysisResult(null);
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowExplainModal(true)}
                                            className="text-[#7A8E6B] hover:text-[#6a7d5d] transition-colors flex items-center gap-1 text-sm font-semibold bg-[#7A8E6B]/10 px-3 py-1.5 rounded-lg"
                                        >
                                            <FaStethoscope />
                                            Explain Yourself
                                        </button>
                                        <button
                                            onClick={() => setEditSection('health')}
                                            className="text-gray-400 hover:text-[#7A8E6B] transition-colors"
                                        >
                                            <FaEdit />
                                        </button>
                                    </div>
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

                        {/* My Health Story Section */}
                        {user?.profile?.storyDesc && (
                            <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-[#7A8E6B]/10 rounded-full flex items-center justify-center text-[#7A8E6B]">
                                        <FaStethoscope />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">My Health Story</h3>
                                </div>
                                <div className="p-6 bg-[#7A8E6B]/5 rounded-xl border border-[#7A8E6B]/20">
                                    <p className="text-gray-800 text-base leading-relaxed italic">
                                        "{user.profile.storyDesc}"
                                    </p>
                                </div>
                            </div>
                        )}
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

                    {/* Explain Yourself Modal */}
                    {showExplainModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#7A8E6B] text-white">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <FaStethoscope />
                                        Explain Yourself
                                    </h3>
                                    <button onClick={closeExplainModal} className="text-white/80 hover:text-white">
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto flex-1">
                                    {explainStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="text-center">
                                                <h4 className="text-2xl font-bold text-gray-800 mb-2">Do you have any chronic conditions?</h4>
                                                <p className="text-gray-500">Select all that apply to you. This helps us personalize your health profile.</p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {commonDiseases.map(disease => (
                                                    <button
                                                        key={disease}
                                                        onClick={() => handleDiseaseToggle(disease)}
                                                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center text-center font-medium ${selectedDiseases.includes(disease)
                                                            ? 'border-[#7A8E6B] bg-[#7A8E6B]/10 text-[#7A8E6B]'
                                                            : 'border-gray-100 hover:border-[#7A8E6B]/50 text-gray-600'
                                                            }`}
                                                    >
                                                        {disease}
                                                        {selectedDiseases.includes(disease) && <FaCheck className="ml-2 text-xs" />}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <button
                                                    onClick={startQuestionnaire}
                                                    disabled={selectedDiseases.length === 0 || isAnalyzing}
                                                    className="bg-[#7A8E6B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6a7d5d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                                >
                                                    {isAnalyzing ? 'Generating...' : 'Next Step'}
                                                    {!isAnalyzing && <FaChevronRight />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {explainStep === 2 && questions.length > 0 && (
                                        <div className="space-y-8">
                                            <div className="text-center mb-6">
                                                <h4 className="text-2xl font-bold text-gray-800">Tell us more about yourself</h4>
                                                <p className="text-gray-500">Please answer the following questions to help us understand your lifestyle.</p>
                                            </div>

                                            <div className="space-y-6">
                                                {questions.map((q, index) => (
                                                    <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                                        <h5 className="text-lg font-bold text-gray-800 mb-4">
                                                            {index + 1}. {q.question}
                                                        </h5>

                                                        {q.type === 'mcq' && q.options ? (
                                                            <div className="space-y-3">
                                                                {q.options.map((option: string, optIdx: number) => (
                                                                    <button
                                                                        key={optIdx}
                                                                        onClick={() => handleAnswerChange(index, option)}
                                                                        className={`w-full p-4 text-left rounded-xl border-2 transition-all ${q.ans === option
                                                                            ? 'border-[#7A8E6B] bg-[#7A8E6B]/10 text-[#7A8E6B] font-semibold'
                                                                            : 'border-gray-100 hover:border-[#7A8E6B]/50 text-gray-600'
                                                                            }`}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <textarea
                                                                value={q.ans || ''}
                                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                                placeholder="Type your answer here..."
                                                                className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50 resize-none"
                                                            ></textarea>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                                <h5 className="text-lg font-bold text-gray-800 mb-4">
                                                    Anything else you'd like to share? (Optional)
                                                </h5>
                                                <textarea
                                                    value={additionalDetails}
                                                    onChange={(e) => setAdditionalDetails(e.target.value)}
                                                    placeholder="Feel free to add any other details about your health, habits, or concerns..."
                                                    className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A8E6B]/50 resize-none"
                                                ></textarea>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <button
                                                    onClick={handleSubmitAll}
                                                    disabled={questions.some(q => !q.ans)}
                                                    className="bg-[#7A8E6B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6a7d5d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-[#7A8E6B]/20"
                                                >
                                                    Submit Analysis
                                                    <FaChevronRight />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {explainStep === 3 && (
                                        <div className="text-center space-y-6 py-8">
                                            <div className="w-20 h-20 bg-[#7A8E6B]/10 rounded-full flex items-center justify-center mx-auto text-[#7A8E6B] text-4xl mb-4">
                                                <FaCheck />
                                            </div>
                                            <h4 className="text-3xl font-bold text-gray-800">Analysis Complete!</h4>
                                            <p className="text-gray-600 max-w-md mx-auto">
                                                We've analyzed your lifestyle and health profile. Here is your personalized health story:
                                            </p>

                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left shadow-inner">
                                                <p className="text-gray-800 leading-relaxed italic">
                                                    "{analysisResult}"
                                                </p>
                                            </div>

                                            <button
                                                onClick={closeExplainModal}
                                                className="bg-[#7A8E6B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6a7d5d] shadow-lg shadow-[#7A8E6B]/20 transition-all"
                                            >
                                                Go to Profile
                                            </button>
                                        </div>
                                    )}

                                    {isAnalyzing && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                            <div className="w-16 h-16 border-4 border-[#7A8E6B]/30 border-t-[#7A8E6B] rounded-full animate-spin mb-4"></div>
                                            <p className="text-[#7A8E6B] font-bold animate-pulse">
                                                {explainStep === 1 ? 'Generating personalized questions...' : 'Analyzing your health profile...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
