'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createDoctorReport } from '@/store/slices/doctorReportsSlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaUserMd, FaPrescriptionBottleAlt, FaPlus, FaTrash } from 'react-icons/fa';

export default function NewDoctorReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.doctorReports);

    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [doctorName, setDoctorName] = useState('');
    const [summary, setSummary] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [diagnoses, setDiagnoses] = useState<string[]>(['']);

    // Prescriptions
    const [prescriptions, setPrescriptions] = useState<{ medicine: string, dosage: string, frequency: string }[]>([
        { medicine: '', dosage: '', frequency: '' }
    ]);

    const handleAddDiagnosis = () => setDiagnoses([...diagnoses, '']);
    const handleDiagnosisChange = (index: number, value: string) => {
        const newDiagnoses = [...diagnoses];
        newDiagnoses[index] = value;
        setDiagnoses(newDiagnoses);
    };

    const handleAddPrescription = () => setPrescriptions([...prescriptions, { medicine: '', dosage: '', frequency: '' }]);
    const handlePrescriptionChange = (index: number, field: string, value: string) => {
        const newPrescriptions = [...prescriptions];
        (newPrescriptions[index] as any)[field] = value;
        setPrescriptions(newPrescriptions);
    };
    const handleRemovePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        // Filter out empty entries
        const cleanDiagnoses = diagnoses.filter(d => d.trim() !== '');
        const cleanPrescriptions = prescriptions.filter(p => p.medicine.trim() !== '');

        const result = await dispatch(createDoctorReport({
            visitDate,
            doctorName,
            summary,
            diagnosis: cleanDiagnoses,
            prescriptions: cleanPrescriptions,
            followUpDate: followUpDate || undefined
        }));

        if (createDoctorReport.fulfilled.match(result)) {
            router.push('/doctor-reports');
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <header className="flex items-center mb-8">
                        <button
                            onClick={() => router.back()}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Record Doctor Visit</h1>
                    </header>

                    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                                    <input
                                        type="date"
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                                    <input
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        placeholder="Dr. Smith"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnoses</label>
                                <div className="space-y-3">
                                    {diagnoses.map((diagnosis, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={diagnosis}
                                            onChange={(e) => handleDiagnosisChange(index, e.target.value)}
                                            placeholder="e.g. Type 2 Diabetes"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                                        />
                                    ))}
                                    <button type="button" onClick={handleAddDiagnosis} className="text-sm text-green-600 font-medium hover:underline">+ Add Diagnosis</button>
                                </div>
                            </div>

                            {/* Prescriptions */}
                            <div className="bg-green-50 p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-md font-bold text-green-800 flex items-center">
                                        <FaPrescriptionBottleAlt className="mr-2" /> Prescriptions
                                    </label>
                                </div>
                                <div className="space-y-4">
                                    {prescriptions.map((prescription, index) => (
                                        <div key={index} className="flex flex-col md:flex-row gap-3 items-start bg-white p-4 rounded-lg shadow-sm">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={prescription.medicine}
                                                onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}
                                                className="flex-grow px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage (500mg)"
                                                value={prescription.dosage}
                                                onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                                                className="w-full md:w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Frequency (2x daily)"
                                                value={prescription.frequency}
                                                onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                                                className="w-full md:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePrescription(index)}
                                                className="p-2 text-red-400 hover:text-red-600"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddPrescription} className="w-full py-2 border-2 border-dashed border-green-200 rounded-lg text-green-600 font-medium hover:bg-green-100 transition">
                                        + Add Prescription
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Summary</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Doctor's advice, lifestyle changes, etc..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                                />
                            </div>

                            {/* Follow Up */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date (Optional)</label>
                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Visit Record'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
