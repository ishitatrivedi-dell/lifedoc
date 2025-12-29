'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchMeasurements } from '@/store/slices/measurementsSlice';
import Link from 'next/link';
import { FaPlus, FaHeartbeat, FaWeight, FaTint, FaLungs } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MeasurementsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { measurements, loading } = useSelector((state: RootState) => state.measurements);
    const [selectedType, setSelectedType] = useState<'glucose' | 'bp' | 'weight'>('glucose');

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchMeasurements(user.id));
        }
    }, [dispatch, user]);

    // Prepare Data for Charts
    const chartData = measurements
        .map(m => {
            const reading = m.readings.find(r =>
                selectedType === 'bp' ? r.type === 'bloodPressure' : r.type === selectedType
            );
            if (!reading) return null;

            return {
                date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: selectedType === 'bp' ? (reading.value as any).systolic : Number(reading.value),
                value2: selectedType === 'bp' ? (reading.value as any).diastolic : null,
            };
        })
        .filter(Boolean)
        .reverse() // Show chronological order
        .slice(-7); // Last 7 readings

    const getThemeColor = () => {
        switch (selectedType) {
            case 'glucose': return '#5EEAD4'; // Soft Teal
            case 'bp': return '#93C5FD'; // Soft Blue
            case 'weight': return '#C4B5FD'; // Soft Purple
            default: return '#7A8E6B';
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Health Readings</h1>
                        <p className="text-gray-500">Track your vitals over time.</p>
                    </div>
                    <Link href="/measurements/new" className="btn-primary space-x-2">
                        <FaPlus /> <span>New Entry</span>
                    </Link>
                </header>

                {/* Chart Section */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
                    <div className="flex space-x-4 mb-8">
                        {[
                            { id: 'glucose', label: 'Glucose', icon: FaTint, color: 'text-teal-400', bg: 'bg-teal-50' },
                            { id: 'bp', label: 'Blood Pressure', icon: FaHeartbeat, color: 'text-blue-400', bg: 'bg-blue-50' },
                            { id: 'weight', label: 'Weight', icon: FaWeight, color: 'text-purple-400', bg: 'bg-purple-50' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id as any)}
                                className={`flex items-center space-x-3 px-6 py-3 rounded-full font-bold transition-all ${selectedType === type.id
                                    ? 'bg-white shadow-md ring-2 ring-offset-2 ring-[#7A8E6B]/20 text-gray-900'
                                    : 'hover:bg-gray-50 text-gray-500'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type.bg} ${type.color}`}>
                                    <type.icon />
                                </div>
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getThemeColor()} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={getThemeColor()} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={getThemeColor()}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                                {selectedType === 'bp' && (
                                    <Area
                                        type="monotone"
                                        dataKey="value2"
                                        stroke={getThemeColor()}
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        fill="none"
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent History</h3>

                    {loading ? (
                        <p className="text-gray-400 text-center py-10">Loading readings...</p>
                    ) : measurements.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 mb-4">No measurements found.</p>
                            <Link href="/measurements/new" className="text-[#7A8E6B] font-bold hover:underline">Add your first reading</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {measurements.map((measurement) => (
                                <div key={measurement._id} className="group flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-[#7A8E6B]/30 hover:shadow-sm transition-all duration-300">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 font-bold border border-gray-100">
                                            <span className="text-xs uppercase">{new Date(measurement.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-xl text-gray-800">{new Date(measurement.date).getDate()}</span>
                                        </div>

                                        <div className="flex space-x-4">
                                            {measurement.readings.map((reading: any, idx: number) => (
                                                <div key={idx} className="flex items-center space-x-2">
                                                    <div className={`w-2 h-2 rounded-full ${reading.type === 'glucose' ? 'bg-teal-400' :
                                                        reading.type === 'bloodPressure' ? 'bg-blue-400' :
                                                            'bg-purple-400'
                                                        }`}></div>
                                                    <span className="font-semibold text-gray-700 capitalize">{reading.type === 'bloodPressure' ? 'BP' : reading.type}:</span>
                                                    <span className="text-gray-900 font-bold">
                                                        {reading.type === 'bloodPressure'
                                                            ? `${reading.value.systolic}/${reading.value.diastolic}`
                                                            : reading.value}
                                                        <span className="text-gray-400 text-sm ml-1 lowercase">{reading.unit}</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-400">
                                        {new Date(measurement.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
