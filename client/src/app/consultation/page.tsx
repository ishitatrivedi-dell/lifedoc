'use client';
import 'regenerator-runtime/runtime';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { FaMicrophone, FaStop, FaRobot, FaVolumeUp, FaLanguage } from 'react-icons/fa';

export default function ConsultationPage() {
    const [isClient, setIsClient] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<any | null>(null); // Changed to object
    const [language, setLanguage] = useState<'en' | 'hi' | 'gu'>('en');

    const dispatch = useDispatch<AppDispatch>();
    const { token } = useSelector((state: RootState) => state.auth);

    // Speech Recognition Hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    if (!browserSupportsSpeechRecognition) {
        return (
            <ProtectedRoute>
                <div className="flex justify-center items-center h-screen">
                    <p className="text-xl text-red-500">Your browser does not support speech recognition.</p>
                </div>
            </ProtectedRoute>
        );
    }

    const handleStartListening = () => {
        resetTranscript();
        setAiResult(null);
        SpeechRecognition.startListening({ continuous: true, language: language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'gu-IN' });
    };

    const handleStopListening = async () => {
        SpeechRecognition.stopListening();
        if (transcript.trim().length > 0) {
            await analyzeSymptoms(transcript);
        }
    };

    const analyzeSymptoms = async (text: string) => {
        setAnalyzing(true);
        try {
            const response = await fetch('http://localhost:5000/api/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, language })
            });

            const data = await response.json();

            if (data.summary) {
                setAiResult(data);
                speakResponse(data.summary);
            } else {
                setAiResult({ summary: "I'm sorry, I couldn't understand that. Could you please try again?" });
            }
        } catch (error) {
            console.error("Analysis Error:", error);
            setAiResult({ summary: "Sorry, I am having trouble connecting to the brain. Please try again later." });
        } finally {
            setAnalyzing(false);
        }
    };

    const speakResponse = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'gu-IN';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[85vh] relative overflow-hidden w-full">
                    {/* Background Blobs for specific immersive feel */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7A8E6B]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A9C29B]/5 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32"></div>

                    <div className="w-full max-w-4xl z-10 flex flex-col items-center">

                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[#7A8E6B] text-sm font-bold mb-4 border border-[#7A8E6B]/20 shadow-sm">
                                <FaRobot /> <span>AI Health Assistant</span>
                            </div>
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                                How are you <span className="text-gradient">feeling?</span>
                            </h1>
                            <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
                                I'm listening. Describe your symptoms, and I'll help you understand what might be wrong.
                            </p>
                        </div>

                        {/* Language Selector */}
                        <div className="flex space-x-3 mb-10 bg-white/40 p-1.5 rounded-full backdrop-blur-sm border border-white/40">
                            {['en', 'hi', 'gu'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang as any)}
                                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${language === lang
                                        ? 'bg-gradient-primary text-white shadow-lg shadow-[#7A8E6B]/25'
                                        : 'text-gray-500 hover:text-[#7A8E6B] hover:bg-white/60'
                                        }`}
                                >
                                    {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Gujarati'}
                                </button>
                            ))}
                        </div>

                        {/* Main Interaction Area */}
                        <div className="relative mb-12 group">
                            {/* Ripple Effect */}
                            {listening && (
                                <>
                                    <div className="absolute inset-0 bg-[#7A8E6B] rounded-full animate-ping opacity-20 scale-150"></div>
                                    <div className="absolute inset-0 bg-[#A9C29B] rounded-full animate-ping opacity-10 scale-125 animation-delay-200"></div>
                                </>
                            )}

                            <button
                                onClick={listening ? handleStopListening : handleStartListening}
                                className={`relative z-20 w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all duration-500 transform hover:scale-105 ${listening
                                    ? 'bg-red-500 text-white rotate-12'
                                    : 'bg-gradient-primary text-white'
                                    }`}
                            >
                                {listening ? <FaStop className="text-4xl" /> : <FaMicrophone />}
                            </button>

                            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-48 text-center">
                                <p className={`font-bold uppercase tracking-widest text-xs transition-colors duration-300 ${listening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                    {listening ? 'Listening...' : 'Tap to Speak'}
                                </p>
                            </div>
                        </div>

                        {/* Transcript / AI Response Area */}
                        {(transcript || aiResult || analyzing) && (
                            <div className="w-full glass rounded-[2rem] p-8 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex flex-col gap-8">
                                    {/* User Speech Section */}
                                    <div className="border-b border-gray-100 pb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span> You Said
                                        </h3>
                                        <p className="text-xl text-gray-600 font-medium leading-relaxed italic">
                                            "{transcript || '...'}"
                                        </p>
                                    </div>

                                    {/* AI Analysis Section */}
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xs font-bold text-[#7A8E6B] uppercase flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-[#7A8E6B] mr-2"></span> Docmetry Analysis
                                            </h3>
                                            {aiResult?.urgency && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${aiResult.urgency === 'High' ? 'bg-red-100 text-red-600' :
                                                    aiResult.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    Urgency: {aiResult.urgency}
                                                </span>
                                            )}
                                        </div>

                                        {analyzing ? (
                                            <div className="flex space-x-2 py-4 justify-center">
                                                <div className="w-2.5 h-2.5 bg-[#7A8E6B] rounded-full animate-bounce"></div>
                                                <div className="w-2.5 h-2.5 bg-[#A9C29B] rounded-full animate-bounce animation-delay-100"></div>
                                                <div className="w-2.5 h-2.5 bg-[#7A8E6B] rounded-full animate-bounce animation-delay-200"></div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-lg text-gray-800 leading-relaxed font-medium">
                                                        {aiResult?.summary}
                                                    </p>
                                                    {aiResult?.summary && (
                                                        <button
                                                            onClick={() => speakResponse(aiResult.summary)}
                                                            className="mt-2 text-sm font-bold text-[#7A8E6B] hover:text-[#5D6F51] transition-colors flex items-center"
                                                        >
                                                            <FaVolumeUp className="mr-2" /> Replay Audio
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Lifestyle Advice */}
                                                {aiResult?.lifestyleAdvice && aiResult.lifestyleAdvice.length > 0 && (
                                                    <div className="bg-green-50 rounded-xl p-5">
                                                        <h4 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">🌱 Lifestyle Recommendations</h4>
                                                        <ul className="space-y-2">
                                                            {aiResult.lifestyleAdvice.map((item: string, idx: number) => (
                                                                <li key={idx} className="flex items-start text-green-900">
                                                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Suggested Medicines */}
                                                {aiResult?.suggestedMedicines && aiResult.suggestedMedicines.length > 0 && (
                                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                                        <h4 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">💊 Over-the-Counter Suggestions</h4>
                                                        <ul className="space-y-2 mb-3">
                                                            {aiResult.suggestedMedicines.map((item: string, idx: number) => (
                                                                <li key={idx} className="flex items-start text-blue-900 font-medium">
                                                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <p className="text-xs text-blue-600 italic border-t border-blue-100 pt-2">
                                                            ⚠️ Disclaimer: These are suggestions for common symptoms. Always consult a doctor before taking new medication.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Immediate Actions */}
                                                {aiResult?.actions && aiResult.actions.length > 0 && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">⚡ Immediate Actions</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiResult.actions.map((action: string, idx: number) => (
                                                                <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                                                                    {action}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
