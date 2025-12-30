'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCamera, FaUpload, FaSpinner, FaPrescriptionBottleAlt, FaVolumeUp } from 'react-icons/fa';

export default function PrescriptionScannerPage() {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { token } = useSelector((state: RootState) => state.auth);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzePrescription = async () => {
        if (!image) return;
        setAnalyzing(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/analyze-prescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ image })
            });
            const data = await response.json();
            setResult(data);

            // Auto-speak the summary
            if (data.audioSummary) {
                speak(data.audioSummary);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to analyze prescription. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Prescription Scanner</h1>
                    <p className="text-gray-500 text-lg">Upload or take a photo of your doctor's prescription.</p>
                </header>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Upload Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                        {image ? (
                            <div className="w-full relative">
                                <img src={image} alt="Prescription" className="w-full rounded-2xl shadow-sm mb-6 max-h-[400px] object-contain" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 bg-gray-900/50 text-white rounded-full p-2 hover:bg-black/70"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="text-center w-full">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                                    <FaCamera className="text-4xl" />
                                </div>
                                <label className="block w-full cursor-pointer">
                                    <span className="sr-only">Choose file</span>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <div className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition inline-block">
                                        <FaUpload className="inline mr-2" /> Upload Photo
                                    </div>
                                </label>
                                <p className="text-gray-400 mt-4 text-sm">Supports JPG, PNG</p>
                            </div>
                        )}

                        {image && !analyzing && !result && (
                            <button
                                onClick={analyzePrescription}
                                className="w-full mt-4 btn-primary text-lg"
                            >
                                Analyze Prescription
                            </button>
                        )}

                        {analyzing && (
                            <div className="flex flex-col items-center mt-6">
                                <FaSpinner className="animate-spin text-3xl text-blue-600 mb-2" />
                                <p className="text-blue-600 font-medium">Reading handwriting...</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 min-h-[400px] relative">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaPrescriptionBottleAlt className="mr-3 text-green-500" />
                            Explanation
                        </h2>

                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                <p>Upload a prescription to see the simplified explanation here.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-6 rounded-2xl relative">
                                    <button
                                        onClick={() => speak(result.audioSummary)}
                                        className="absolute top-4 right-4 p-2 bg-white text-blue-600 rounded-full shadow-sm hover:bg-blue-100"
                                    >
                                        <FaVolumeUp />
                                    </button>
                                    <h3 className="font-bold text-blue-800 mb-2 uppercase text-xs tracking-wider">Summary</h3>
                                    <p className="text-blue-900 text-lg leading-relaxed">{result.audioSummary}</p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4">Medicines Identified</h3>
                                    <div className="space-y-3">
                                        {result.medicines?.map((med: any, idx: number) => (
                                            <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-xl">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 text-green-600 flex-shrink-0 font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{med.name}</p>
                                                    <p className="text-gray-600">{med.dosage} • {med.timing}</p>
                                                    <p className="text-sm text-amber-600 mt-1 font-medium">⚠️ {med.precaution}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
