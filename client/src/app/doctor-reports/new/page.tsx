'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createDoctorReport } from '@/store/slices/doctorReportsSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaUserMd, FaPrescriptionBottleAlt, FaPlus, FaTrash } from 'react-icons/fa';

export default function NewDoctorReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.doctorReports);

    const [visitDate, setVisitDate] = useState(searchParams.get('date')?.split('T')[0] || new Date().toISOString().split('T')[0]);
    const [doctorName, setDoctorName] = useState(searchParams.get('doctor') || '');
    const [summary, setSummary] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [diagnoses, setDiagnoses] = useState<string[]>(['']);

    // Prescriptions
    const [prescriptions, setPrescriptions] = useState<{ medicine: string, dosage: string, frequency: string }[]>([
        { medicine: '', dosage: '', frequency: '' }
    ]);

    // File Upload
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);


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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setFileUrl(data.url);
            } else {
                console.error('Upload failed:', data);
                alert(`Upload failed: ${data.message}\nDetails: ${data.error || 'Check console for logs'}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error uploading image: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        // Filter out empty entries
        const cleanDiagnoses = diagnoses.filter(d => d.trim() !== '');
        const cleanPrescriptions = prescriptions.filter(p => p.medicine.trim() !== '');

        const result = await dispatch(createDoctorReport({
            userId: user.id,
            visitDate,
            doctorName,
            summary,
            diagnosis: cleanDiagnoses,
            prescriptions: cleanPrescriptions,
            followUpDate: followUpDate || undefined,
            fileUrl
        }));

        if (createDoctorReport.fulfilled.match(result)) {
            router.push('/doctor-reports');
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnoses (Optional)</label>
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


                        {/* Prescription Upload */}
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <label className="block text-md font-bold text-blue-800 mb-4 flex items-center">
                                <FaPrescriptionBottleAlt className="mr-2" /> Upload Prescription / Report
                            </label>

                            {fileUrl ? (
                                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                    <img src={fileUrl} alt="Prescription" className="w-full h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => setFileUrl('')}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow hover:bg-red-700"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploading ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            ) : (
                                                <>
                                                    <FaPlus className="w-8 h-8 mb-3 text-blue-500" />
                                                    <p className="mb-2 text-sm text-blue-500"><span className="font-semibold">Click to upload</span> prescription image</p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Summary (Optional)</label>
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
            </DashboardLayout >
        </ProtectedRoute >
    );
}
