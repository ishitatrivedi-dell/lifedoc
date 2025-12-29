'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createMeasurement, MeasurementReading } from '@/store/slices/measurementsSlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTint, FaHeartbeat, FaWeight, FaStopwatch } from 'react-icons/fa';

export default function NewMeasurementPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.measurements);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState('glucose');

    // Form states
    const [reading, setReading] = useState<any>({
        value: '',
        systolic: '',
        diastolic: '',
        unit: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        let finalValue;
        let finalUnit = reading.unit;

        if (selectedType === 'bloodPressure') {
            finalValue = {
                systolic: Number(reading.systolic),
                diastolic: Number(reading.diastolic)
            };
            finalUnit = 'mmHg';
        } else {
            finalValue = Number(reading.value);
            if (!finalUnit) {
                if (selectedType === 'glucose') finalUnit = 'mg/dL';
                if (selectedType === 'weight') finalUnit = 'kg';
                if (selectedType === 'heartRate') finalUnit = 'bpm';
                if (selectedType === 'spo2') finalUnit = '%';
            }
        }

        const payload: MeasurementReading = {
            type: selectedType as any,
            value: finalValue,
            unit: finalUnit,
            notes: reading.notes,
            timestamp: new Date().toISOString()
        };

        const result = await dispatch(createMeasurement({
            userId: user.id,
            date: date,
            readings: [payload]
        }));

        if (createMeasurement.fulfilled.match(result)) {
            router.push('/measurements');
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Record New Measurement</h1>
                </header>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Type</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['glucose', 'bloodPressure', 'weight', 'heartRate'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setSelectedType(type)}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${selectedType === type
                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {type === 'glucose' && <FaTint />}
                                        {type === 'bloodPressure' && <FaHeartbeat />}
                                        {type === 'weight' && <FaWeight />}
                                        {type === 'heartRate' && <FaStopwatch />}
                                        <span className="text-xs font-semibold uppercase">{type.replace(/([A-Z])/g, ' $1')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Inputs */}
                        <div className="p-6 bg-gray-50 rounded-xl space-y-4">
                            {selectedType === 'bloodPressure' ? (
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Systolic</label>
                                        <input
                                            type="number"
                                            placeholder="120"
                                            value={reading.systolic}
                                            onChange={(e) => setReading({ ...reading, systolic: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Diastolic</label>
                                        <input
                                            type="number"
                                            placeholder="80"
                                            value={reading.diastolic}
                                            onChange={(e) => setReading({ ...reading, diastolic: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Value</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="0"
                                            value={reading.value}
                                            onChange={(e) => setReading({ ...reading, value: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <span className="absolute right-4 top-2 text-gray-400 text-sm">
                                            {selectedType === 'glucose' ? 'mg/dL' : selectedType === 'weight' ? 'kg' : selectedType === 'heartRate' ? 'bpm' : ''}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Notes (Optional)</label>
                                <textarea
                                    value={reading.notes}
                                    onChange={(e) => setReading({ ...reading, notes: e.target.value })}
                                    placeholder="e.g., Fasting, After meal..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Measurement'}
                        </button>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
