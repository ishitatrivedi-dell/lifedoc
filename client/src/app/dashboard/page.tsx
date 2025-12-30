'use client';
import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMeasurements } from '@/store/slices/measurementsSlice';
import Link from 'next/link';
import { FaHeartbeat, FaTint, FaWeight, FaCalendarCheck, FaMicrophone, FaFileMedical, FaRobot, FaArrowRight } from 'react-icons/fa';

// Components
import VitalsCard from '@/components/dashboard/VitalsCard';
import HealthTrendChart from '@/components/dashboard/HealthTrendChart';
import HealthNewsWidget from '@/components/dashboard/HealthNewsWidget';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { measurements, loading } = useSelector((state: RootState) => state.measurements);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (user?.id) {
            dispatch(fetchMeasurements(user.id));
        }
    }, [dispatch, user]);

    // Derived Data for Vitals
    const latestGlucose = useMemo(() =>
        measurements.flatMap(m => m.readings).filter(r => r.type === 'glucose').pop(),
        [measurements]);

    const latestBP = useMemo(() =>
        measurements.flatMap(m => m.readings).filter(r => r.type === 'bloodPressure').pop(),
        [measurements]);

    // Mock Weight (since it's not in the main measurement slice yet, usually separate)
    // In a real app, this would come from a weightSlice or BodyComposition API
    const weightValue = "72"; // kg

    // Chart Data Preparation
    const glucoseData = useMemo(() => {
        // Backend returns measurements sorted by date DESC (Newest first)
        // We want the LATEST 7 records, but displayed Chronologically (Oldest -> Newest) on the chart
        const data = measurements
            .filter(m => m.readings.some(r => r.type === 'glucose'))
            .map(m => {
                const reading = m.readings.find(r => r.type === 'glucose');
                return {
                    date: m.date,
                    value: reading ? Number(reading.value) : 0
                };
            })
            // Take the 7 most recent entries (which are at the top of the array)
            .slice(0, 7);

        // Reverse them so the chart draws Oldest (left) -> Newest (right)
        return [...data].reverse();
    }, [measurements]);

    // Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (!isClient || (loading && measurements.length === 0)) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <DashboardSkeleton />
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in-up">
                    <div>
                        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Overview</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            {getGreeting()}, <span className="text-[#3AAFA9]">{user?.name || 'User'}</span> 👋
                        </h1>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold text-gray-500 border border-gray-200 shadow-sm self-start md:self-auto">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Hero / Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17252A] to-[#2B7A78] shadow-lg group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:opacity-10 transition-opacity duration-700"></div>

                        <div className="relative z-10 p-8 flex flex-col items-start h-full justify-between">
                            <div>
                                <div className="flex items-center space-x-2 text-[#DEF2F1] text-sm font-bold mb-4 tracking-wide uppercase">
                                    <FaRobot className="animate-bounce" /> <span>AI Health Assistant</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                    Feeling unwell? <br /> Let AI analyze your symptoms.
                                </h2>
                                <p className="text-[#DEF2F1]/80 text-base max-w-lg mt-2">
                                    Get instant medical insights and analysis by describing your condition or uploading a report.
                                </p>
                            </div>
                            <Link href="/consultation" className="mt-8 bg-white text-[#2B7A78] px-8 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-gray-50 hover:scale-105 transition-all flex items-center space-x-2">
                                <FaMicrophone /> <span>Start Voice Session</span>
                            </Link>
                        </div>
                    </div>

                    <Link href="/lab-reports" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 flex flex-col justify-between hover:border-[#3AAFA9]/50 hover:shadow-lg transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3AAFA9] opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="p-4 bg-teal-50 text-[#3AAFA9] rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                                <FaFileMedical className="text-2xl" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Lab Reports</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">Upload and analyze your medical reports instantly.</p>
                            <div className="text-[#3AAFA9] font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                                Upload Now <FaArrowRight className="ml-2" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Vitals Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <VitalsCard
                        title="Glucose"
                        value={latestGlucose ? String(latestGlucose.value) : '--'}
                        unit={latestGlucose?.unit || 'mg/dL'}
                        icon={FaTint}
                        colorClass="text-teal-600 bg-teal-50"
                        trend="stable"
                        trendValue="Normal"
                    />
                    <VitalsCard
                        title="Blood Pressure"
                        value={
                            latestBP && typeof latestBP.value === 'object'
                                ? `${latestBP.value.systolic}/${latestBP.value.diastolic}`
                                : '--'
                        }
                        unit="mmHg"
                        icon={FaHeartbeat}
                        colorClass="text-rose-500 bg-rose-50"
                        trend="down"
                        trendValue="-2%"
                    />
                    <VitalsCard
                        title="Weight"
                        value={weightValue}
                        unit="kg"
                        icon={FaWeight}
                        colorClass="text-purple-600 bg-purple-50"
                        trend="up"
                        trendValue="+0.5kg"
                    />
                </div>

                {/* Main Content Grid: Charts & News */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Charts & Activity */}
                    <div className="lg:col-span-2 space-y-8">
                        <HealthTrendChart
                            title="Glucose Trends"
                            data={glucoseData}
                            dataKey="value"
                            color="#38B2AC" // Teal 400
                        />

                        <UpcomingAppointments />

                        {/* Recent Activity List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                                <Link href="/measurements" className="text-[#3AAFA9] font-bold hover:underline text-sm">View All</Link>
                            </div>

                            {measurements.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-medium">No recent activity recorded.</p>
                                    <p className="text-gray-300 text-sm mt-1">Start by adding a measurement.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {measurements.slice(0, 3).map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-[#DEF2F1] text-[#2B7A78] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                                    <FaCalendarCheck />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">Daily Check-in</p>
                                                    <p className="text-xs text-gray-500 font-medium">{new Date(m.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-500 rounded-full">{m.readings.length} readings</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: News & Status */}
                    <div className="space-y-8">
                        <HealthNewsWidget />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
