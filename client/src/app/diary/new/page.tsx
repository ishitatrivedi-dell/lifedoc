'use client';
import { useState } from 'react';
import axios from 'axios';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createDiaryEntry } from '@/store/slices/diarySlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaMagic, FaSmile, FaMeh, FaFrown, FaBolt, FaCloudRain } from 'react-icons/fa';

export default function NewDiaryEntryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.diary);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [text, setText] = useState('');
    const [mood, setMood] = useState('neutral');
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate AI Summary
    const generateSummary = async () => {
        if (!text) return;
        setIsGenerating(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/ai/summerizer?prompt=diarySummerizer`,
                { text, date },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { summary: aiSummary, feeling } = response.data;
            setSummary(aiSummary);

            // Auto-select mood if it matches one of our options
            if (feeling) {
                const moodLower = feeling.toLowerCase();
                if (moods.some(m => m.id === moodLower)) {
                    setMood(moodLower);
                }
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Failed to generate summary. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        // Use simulated summary if not provided
        const finalSummary = summary || text.slice(0, 100) + (text.length > 100 ? '...' : '');

        const result = await dispatch(createDiaryEntry({
            userId: user.id,
            date: date,
            rawText: text,
            summary: finalSummary,
            mood: mood,
            tags: ['daily', mood] // Simple default tags
        }));

        if (createDiaryEntry.fulfilled.match(result)) {
            router.push('/diary');
        }
    };

    const moods = [
        { id: 'happy', icon: FaSmile, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { id: 'energetic', icon: FaBolt, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'neutral', icon: FaMeh, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
        { id: 'sad', icon: FaCloudRain, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
        { id: 'stressed', icon: FaFrown, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    ];

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
                    <h1 className="text-2xl font-bold text-gray-800">New Diary Entry</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
                                <div className="flex space-x-4 overflow-x-auto pb-2">
                                    {moods.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setMood(m.id)}
                                            className={`flex flex-col items-center p-4 rounded-xl border min-w-[80px] transition ${mood === m.id
                                                ? `${m.bg} ${m.border} ring-2 ring-offset-1 ring-blue-500`
                                                : 'bg-white border-gray-100 hover:bg-gray-50'
                                                }`}
                                        >
                                            <m.icon className={`text-2xl mb-2 ${m.color}`} />
                                            <span className="text-xs font-semibold capitalize text-gray-600">{m.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Journal Entry</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Write about your day, health, diet, or exercise..."
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AI Summary Side (Simulated) */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                            <div className="flex items-center space-x-2 mb-4">
                                <FaMagic className="text-yellow-300" />
                                <h3 className="font-bold">AI Companion</h3>
                            </div>
                            <p className="text-purple-100 text-sm mb-6">
                                I can summarize your day and extract health insights from your writing.
                            </p>

                            {summary ? (
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
                                    <h4 className="text-xs font-bold uppercase text-purple-200 mb-1">Generated Summary</h4>
                                    <p className="text-sm leading-relaxed">{summary}</p>
                                </div>
                            ) : (
                                <div className="border border-white/20 border-dashed rounded-xl p-8 text-center text-purple-200 text-sm">
                                    Write your entry first...
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={generateSummary}
                                disabled={!text || isGenerating}
                                className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition disabled:opacity-50"
                            >
                                {isGenerating ? 'Generating...' : 'Generate Summary'}
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !text}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
