'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { FaArrowLeft, FaFilePrescription, FaNotesMedical, FaVial, FaMicrophone, FaHeartbeat } from 'react-icons/fa';

import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MemberHealthPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [data, setData] = useState<any>({ prescriptions: [], labReports: [], doctorReports: [], analysis: null, healthTrends: { bp: [], weight: [], glucose: [] } });
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const generateAnalysis = async () => {
        setAnalyzing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/family/member/${id}/analyze`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setData((prev: any) => ({ ...prev, analysis: res.data.analysis }));
            }
        } catch (error) {
            console.error("AI Analysis failed", error);
            alert("Failed to analyze health data.");
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        if (id) fetchHealthData();
    }, [id]);

    const fetchHealthData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/family/member/${id}/health`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching health data", error);
        } finally {
            setLoading(false);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newVital, setNewVital] = useState({ type: 'glucose', value: '', systolic: '', diastolic: '', date: new Date().toISOString().split('T')[0] });

    const handleAddVital = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Construct payload based on type
            let payload: any = { type: newVital.type, date: newVital.date };
            if (newVital.type === 'bloodPressure') {
                payload.readings = [{ type: 'bloodPressure', value: { systolic: Number(newVital.systolic), diastolic: Number(newVital.diastolic) } }];
            } else {
                payload.readings = [{ type: newVital.type, value: Number(newVital.value) }];
            }

            // Note: The /api/measurements endpoint likely infers user from token. 
            // TO SUPPORT MANAGED MEMBERS: We need an endpoint that accepts userId target.
            // OR we use a new family controller endpoint.
            // Let's try sending `targetUserId` in body if the backend supports it, 
            // or use a new route I'll create: /api/family/member/:id/measurement

            await axios.post(`http://localhost:5000/api/family/member/${id}/measurement`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowAddModal(false);
            setNewVital({ type: 'glucose', value: '', systolic: '', diastolic: '', date: new Date().toISOString().split('T')[0] });
            fetchHealthData(); // Refresh graphs
            alert("Health record added successfully!");
        } catch (error) {
            console.error("Error adding vital", error);
            alert("Failed to add record.");
        }
    };

    const speakSummary = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <FaArrowLeft />
                    <span>Back to Family</span>
                </button>

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Member Health Profile</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium shadow-sm transition-all"
                    >
                        <FaHeartbeat />
                        <span>Add Vitals</span>
                    </button>
                </div>

                {/* Add Vitals Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative animate-in zoom-in duration-200">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                            <h3 className="text-xl font-bold mb-4">Add Health Record</h3>
                            <form onSubmit={handleAddVital} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={newVital.type}
                                        onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="glucose">Glucose</option>
                                        <option value="weight">Weight</option>
                                        <option value="bloodPressure">Blood Pressure</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newVital.date}
                                        onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                {newVital.type === 'bloodPressure' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Systolic</label>
                                            <input type="number" required value={newVital.systolic} onChange={e => setNewVital({ ...newVital, systolic: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="120" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic</label>
                                            <input type="number" required value={newVital.diastolic} onChange={e => setNewVital({ ...newVital, diastolic: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="80" />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Value ({newVital.type === 'weight' ? 'kg' : 'mg/dL'})</label>
                                        <input type="number" step="0.1" required value={newVital.value} onChange={e => setNewVital({ ...newVital, value: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter value" />
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
                                    Save Record
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Health Guardian Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <span className="text-3xl">🧠</span> AI Health Guardian
                                </h2>
                                <p className="text-indigo-100 mt-1 opacity-90">Instant analysis of recent health trends & risks.</p>
                            </div>
                            {!data.analysis ? (
                                <button
                                    onClick={generateAnalysis}
                                    disabled={analyzing}
                                    className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-50 transition-transform active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <span>✨ Scan Now</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className={`px-4 py-1 rounded-full font-bold text-sm uppercase tracking-wide bg-white/20 backdrop-blur-md border border-white/30 ${data.analysis.riskLevel === 'High' ? 'text-red-100 bg-red-500/20' : 'text-green-100'}`}>
                                    Risk: {data.analysis.riskLevel}
                                </div>
                            )}
                        </div>

                        {data.analysis && (
                            <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <p className="text-lg leading-relaxed font-medium">"{data.analysis.summary}"</p>

                                <div className="mt-4 grid md:grid-cols-2 gap-4">
                                    <div className="bg-black/20 rounded-xl p-4">
                                        <h3 className="font-bold text-indigo-200 mb-2 uppercase text-xs tracking-wider">Recommended Actions</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {data.analysis.actionItems?.map((action: string, i: number) => (
                                                <li key={i}>{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-black/20 rounded-xl p-4">
                                        <h3 className="font-bold text-indigo-200 mb-2 uppercase text-xs tracking-wider">Ask the Doctor</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {data.analysis.doctorQuestions?.map((q: string, i: number) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>

                {/* Health Trends Graphs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Health Trends</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Weight Graph */}
                        <div className="h-64">
                            <h3 className="text-sm font-medium text-gray-500 mb-2 text-center">Weight History (kg)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.healthTrends?.weight || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} fontSize={10} />
                                    <YAxis domain={['auto', 'auto']} fontSize={10} />
                                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Glucose Graph */}
                        <div className="h-64">
                            <h3 className="text-sm font-medium text-gray-500 mb-2 text-center">Glucose Levels (mg/dL)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.healthTrends?.glucose || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} fontSize={10} />
                                    <YAxis domain={['auto', 'auto']} fontSize={10} />
                                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* BP Graph */}
                        <div className="h-64">
                            <h3 className="text-sm font-medium text-gray-500 mb-2 text-center">Blood Pressure</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.healthTrends?.bp || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} fontSize={10} />
                                    <YAxis domain={['auto', 'auto']} fontSize={10} />
                                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                                    <Line type="monotone" dataKey="value.systolic" name="Systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="value.diastolic" name="Diastolic" stroke="#fca5a5" strokeWidth={2} dot={{ r: 3 }} />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {loading ? <div>Loading health records...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Doctor Reports */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <FaNotesMedical />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Doctor Visits</h2>
                            </div>
                            {data.doctorReports.length === 0 ? <p className="text-gray-400 italic">No doctor reports found.</p> : (
                                <div className="space-y-4">
                                    {data.doctorReports.map((report: any) => (
                                        <div key={report._id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{report.doctorName}</h3>
                                                    <p className="text-sm text-gray-500">{new Date(report.visitDate).toLocaleDateString()}</p>
                                                </div>
                                                <button onClick={() => speakSummary(`Doctor visit with ${report.doctorName}. Diagnosis: ${report.diagnosis}`)} className="text-blue-500 hover:text-blue-700">
                                                    <FaMicrophone />
                                                </button>
                                            </div>
                                            <p className="mt-2 text-gray-700 text-sm">{report.diagnosis}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Prescriptions */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <FaFilePrescription />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Prescriptions</h2>
                            </div>
                            {data.prescriptions.length === 0 ? <p className="text-gray-400 italic">No prescriptions found.</p> : (
                                <div className="space-y-4">
                                    {data.prescriptions.map((script: any) => (
                                        <div key={script._id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <h3 className="font-bold text-gray-900">{script.doctorName || 'Unknown Doctor'}</h3>
                                            <p className="text-sm text-gray-500">{new Date(script.date).toLocaleDateString()}</p>
                                            <div className="mt-2 text-sm text-gray-700">
                                                {script.medicines?.map((m: any, i: number) => (
                                                    <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">{typeof m === 'string' ? m : m.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lab Reports */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                    <FaVial />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Lab Reports</h2>
                            </div>
                            {data.labReports.length === 0 ? <p className="text-gray-400 italic">No lab reports found.</p> : (
                                <div className="space-y-4">
                                    {data.labReports.map((report: any) => (
                                        <div key={report._id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <h3 className="font-bold text-gray-900">{report.testName || 'Lab Test'}</h3>
                                            <p className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                                            <p className="mt-1 text-sm text-gray-700">Result: {report.result || 'Pending'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
