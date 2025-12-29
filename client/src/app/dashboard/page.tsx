'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMeasurements } from '@/store/slices/measurementsSlice';
import Link from 'next/link';
import { FaHeartbeat, FaTint, FaWeight, FaCalendarCheck, FaMicrophone, FaCamera, FaRobot } from 'react-icons/fa';

export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { measurements } = useSelector((state: RootState) => state.measurements);

    // Local state for AI history (since we haven't made a slice for it yet)
    const [consultations, setConsultations] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchMeasurements(user.id));
            fetchHistory();
        }
    }, [dispatch, user]);

    const fetchHistory = async () => {
        try {
            // In a real app, we'd have a slice for this. For now, fetching directly.
            // Assuming we expose a GET route for history (we actually haven't created GET routes yet, only POST save).
            // Let's create a quick "Recent Activity" UI that is ready for data.
            // For now, we will just simulate empty or mock data until GET routes are made.
        } catch (error) {
            console.error(error);
        }
    };

    const latestGlucose = measurements.flatMap(m => m.readings).filter(r => r.type === 'glucose').pop();
    const latestBP = measurements.flatMap(m => m.readings).filter(r => r.type === 'bloodPressure').pop();


    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Overview</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            Hello, <span className="text-gradient">{user?.name || 'User'}</span> 👋
                        </h1>
                    </div>
                    <div className="glass px-6 py-2 rounded-full text-sm font-semibold text-gray-500 self-start md:self-auto">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Quick Actions for Docmetry */}
                {/* Hero Section: Doctor & Scanner */}
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

                    {/* Primary Action: Voice Consultation */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-primary shadow-lg group">
                        <div className="relative z-10 p-6 md:p-8 flex flex-col items-start h-full justify-between">
                            <div>
                                <div className="flex items-center space-x-2 text-white/90 text-sm font-semibold mb-4">
                                    <FaRobot /> <span>AI Assistant</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Voice Consultation</h2>
                                <p className="text-white/90 text-base max-w-lg leading-relaxed">
                                    Describe your symptoms to get an instant AI-powered medical analysis.
                                </p>
                            </div>
                            <Link href="/consultation" className="mt-6 bg-white text-[#7A8E6B] px-6 py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <FaMicrophone /> <span>Start Session</span>
                            </Link>
                        </div>
                    </div>

                    {/* Secondary Action: Scanner */}
                    <Link href="/scan" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 md:p-8 flex flex-col justify-between hover:border-[#7A8E6B]/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 bg-teal-50 text-[#7A8E6B] rounded-lg">
                                <FaCamera className="text-2xl" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Scan Prescription</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">Upload an image to understand dosages.</p>
                            <div className="text-[#7A8E6B] font-semibold text-sm group-hover:underline">
                                Open Scanner &rarr;
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Vitals Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Glucose Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center hover:shadow-sm transition-shadow">
                        <div className="p-4 bg-teal-50 text-teal-600 rounded-xl mr-5">
                            <FaTint className="text-xl" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Glucose</p>
                            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                {latestGlucose ? `${latestGlucose.value}` : '--'} <span className="text-sm text-gray-400 font-medium">{latestGlucose?.unit || ''}</span>
                            </p>
                        </div>
                    </div>

                    {/* BP Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center hover:shadow-sm transition-shadow">
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-xl mr-5">
                            <FaHeartbeat className="text-xl" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Blood Pressure</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {latestBP ? `${(latestBP.value as any).systolic}/${(latestBP.value as any).diastolic}` : '--'} <span className="text-sm text-gray-400 font-medium">mmHg</span>
                            </p>
                        </div>
                    </div>

                    {/* Health Score Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center hover:shadow-sm transition-shadow">
                        <div className="p-4 bg-purple-50 text-purple-500 rounded-xl mr-5">
                            <FaWeight className="text-xl" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                            <p className="text-2xl font-bold text-gray-900">Good</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                        <Link href="/measurements" className="text-blue-600 font-medium hover:underline">View All</Link>
                    </div>

                    {measurements.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No recent activity recorded.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {measurements.slice(0, 3).map((m, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4 sm:gap-0">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 text-gray-400 shrink-0">
                                            <FaCalendarCheck />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Health Checkup</p>
                                            <p className="text-sm text-gray-500">{new Date(m.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-400">{m.readings.length} readings</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
