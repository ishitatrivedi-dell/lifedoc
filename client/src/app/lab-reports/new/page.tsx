'use client';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createLabReport, analyzeLabReport } from '@/store/slices/labReportsSlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCloudUploadAlt, FaFlask, FaMagic, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function NewLabReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.labReports);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [testType, setTestType] = useState('');
    const [notes, setNotes] = useState('');
    const [fileUrl, setFileUrl] = useState(''); // Base64 string
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const loadingMessages = [
        "Analyzing lab report...",
        "Extracting test results...",
        "Summarizing clinical findings...",
        "Uploading to secure storage...",
        "Finalizing report..."
    ];

    const [aiResponse, setAiResponse] = useState<any>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading || analyzing) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 2000);
        } else {
            setLoadingMessageIndex(0);
        }
        return () => clearInterval(interval);
    }, [loading, analyzing]);

    const handleAnalyze = async () => {
        if (!fileUrl) return;
        setAnalyzing(true);
        setAiResponse(null);
        try {
            const resultAction = await dispatch(analyzeLabReport({ image: fileUrl }));
            if (analyzeLabReport.fulfilled.match(resultAction)) {
                const data = resultAction.payload;
                setAiResponse(data);

                // Auto-fill fields
                if (data.labReport?.reportDate) {
                    setDate(new Date(data.labReport.reportDate).toISOString().split('T')[0]);
                }

                // Determine test type
                let type = "General Lab Report";
                if (data.tests && data.tests.length > 0) {
                    type = data.tests[0].testCategory || data.tests[0].testName || type;
                }
                setTestType(type);

                // Fill results
                if (data.tests && data.tests.length > 0) {
                    const newResults = data.tests.map((test: any) => ({
                        key: test.testName,
                        value: `${test.resultValue} ${test.unit || ''}`.trim()
                    }));
                    setResults(newResults);
                }

                // Add summary to notes
                if (data.summary) {
                    const summaryText = `Total Tests: ${data.summary.totalTests}, Abnormal: ${data.summary.abnormalTests}. ${data.summary.criticalFindings ? 'CRITICAL FINDINGS DETECTED.' : ''}`;
                    setNotes(prev => prev ? `${prev}\n\nAI Analysis: ${summaryText}` : `AI Analysis: ${summaryText}`);
                }
            }
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Failed to analyze report. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !fileUrl) {
            if (!fileUrl) alert("Please upload a lab report image.");
            return;
        }

        try {
            const resultAction = await dispatch(analyzeLabReport({
                image: fileUrl,
                notes: notes,
                reportDate: date,
                testType: testType
            }));

            if (analyzeLabReport.fulfilled.match(resultAction)) {
                router.push('/lab-reports');
            } else {
                alert("Failed to save report. Please try again.");
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("An error occurred while saving.");
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
                    <h1 className="text-2xl font-bold text-gray-800">Add Lab Report</h1>
                </header>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">

                    {/* Loading Overlay */}
                    {(loading || analyzing) && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center max-w-sm w-full mx-4">
                                <div className="relative w-16 h-16 mb-6">
                                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                    <FaMagic className="absolute inset-0 m-auto text-blue-600 text-xl animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Report</h3>
                                <p className="text-gray-500 text-center animate-pulse transition-all duration-500">
                                    {loadingMessages[loadingMessageIndex]}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-300 ${(loading || analyzing) ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>

                        {/* File Upload & Analysis */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <label className="block text-sm font-medium text-blue-900 mb-3">Upload Report (Image/PDF)</label>
                            <div className="flex items-center space-x-4">
                                <div className="relative flex-grow">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={!fileUrl || analyzing}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${!fileUrl || analyzing
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md'
                                        }`}
                                >
                                    <FaMagic />
                                    <span>Analyze with AI</span>
                                </button>
                            </div>
                            {fileUrl && (
                                <div className="mt-3">
                                    {fileUrl.startsWith('data:image') ? (
                                        <img src={fileUrl} alt="Preview" className="h-32 object-contain rounded-lg border border-gray-200 bg-white" />
                                    ) : (
                                        <div className="text-sm text-gray-600 flex items-center">
                                            <FaCloudUploadAlt className="mr-2" /> File selected
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

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
                                    placeholder={fileUrl ? "Auto-assigned by AI" : "e.g. Lipid Profile, CBC"}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Dynamic Results Section */}
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-semibold text-gray-700">Key Results</label>
                                <button type="button" onClick={handleAddResult} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Row</button>
                            </div>
                            <div className="space-y-3">
                                {results.map((item, index) => (
                                    <div key={index} className="flex space-x-3">
                                        <input
                                            type="text"
                                            placeholder="Parameter"
                                            value={item.key}
                                            onChange={(e) => handleResultChange(index, 'key', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={item.value}
                                            onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
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
                            disabled={loading || analyzing}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Report'}
                        </button>
                    </form>

                    {/* AI Analysis Response Section */}
                    {aiResponse && (
                        <div className={`mt-8 pt-8 border-t border-gray-100 transition-all duration-300 ${(loading || analyzing) ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaMagic className="text-purple-500 mr-2" />
                                AI Analysis Result
                            </h3>
                            <div className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono shadow-inner">
                                <pre>{JSON.stringify(aiResponse, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
