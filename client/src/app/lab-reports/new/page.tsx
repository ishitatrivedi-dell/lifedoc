'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createLabReport } from '@/store/slices/labReportsSlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCloudUploadAlt, FaFlask } from 'react-icons/fa';

export default function NewLabReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.labReports);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [testType, setTestType] = useState('');
    const [notes, setNotes] = useState('');
    const [fileUrl, setFileUrl] = useState(''); // Simulating file upload by just taking a URL for now

    // Dynamic results builder
    const [results, setResults] = useState<{ key: string, value: string }[]>([{ key: '', value: '' }]);

    const handleAddResult = () => {
        setResults([...results, { key: '', value: '' }]);
    };

    const handleResultChange = (index: number, field: 'key' | 'value', value: string) => {
        const newResults = [...results];
        newResults[index][field] = value;
        setResults(newResults);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        // Convert results array to object
        const parsedResults = results.reduce((acc, curr) => {
            if (curr.key && curr.value) {
                acc[curr.key] = curr.value;
            }
            return acc;
        }, {} as any);

        const result = await dispatch(createLabReport({
            reportDate: date,
            testType,
            parsedResults,
            notes,
            fileUrl: fileUrl || undefined
        }));

        if (createLabReport.fulfilled.match(result)) {
            router.push('/lab-reports');
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
                        <h1 className="text-2xl font-bold text-gray-800">Add Lab Report</h1>
                    </header>

                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
                                    <input
                                        type="text"
                                        value={testType}
                                        onChange={(e) => setTestType(e.target.value)}
                                        placeholder="e.g. Lipid Profile, CBC"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamic Results Section */}
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-semibold text-gray-700">Key Results (Optional)</label>
                                    <button type="button" onClick={handleAddResult} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Row</button>
                                </div>
                                <div className="space-y-3">
                                    {results.map((item, index) => (
                                        <div key={index} className="flex space-x-3">
                                            <input
                                                type="text"
                                                placeholder="Parameter (e.g. Total Cholesterol)"
                                                value={item.key}
                                                onChange={(e) => handleResultChange(index, 'key', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value (e.g. 190 mg/dL)"
                                                value={item.value}
                                                onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* File URL (Simulated Upload) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File URL (Optional)</label>
                                <div className="relative">
                                    <FaCloudUploadAlt className="absolute left-4 top-3.5 text-gray-400 text-xl" />
                                    <input
                                        type="url"
                                        value={fileUrl}
                                        onChange={(e) => setFileUrl(e.target.value)}
                                        placeholder="https://example.com/my-report.pdf"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Enter a direct link to your PDF or image file.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Doctor's comments or your observations..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Report'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
