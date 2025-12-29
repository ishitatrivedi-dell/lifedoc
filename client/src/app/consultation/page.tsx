'use client';
import 'regenerator-runtime/runtime';
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaStop, FaRobot, FaVolumeUp, FaLanguage } from 'react-icons/fa';

export default function ConsultationPage() {
    const [isClient, setIsClient] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi' | 'gu'>('en');

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
        setAiResponse(null);
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
            const response = await fetch('http://localhost:3001/api/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Add token if auth middleware is enabled
                },
                body: JSON.stringify({ text, language })
            });

            const data = await response.json();

            if (data.summary) {
                setAiResponse(data.summary);
                speakResponse(data.summary);
            } else {
                setAiResponse("I'm sorry, I couldn't understand that. Could you please try again?");
            }
        } catch (error) {
            console.error("Analysis Error:", error);
            setAiResponse("Sorry, I am having trouble connecting to the brain. Please try again later.");
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
                        {(transcript || aiResponse || analyzing) && (
                            <div className="w-full glass rounded-[2rem] p-8 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* User Speech */}
                                    <div className="flex-1">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span> You Said
                                        </h3>
                                        <p className="text-xl text-gray-600 font-medium leading-relaxed italic">
                                            "{transcript || '...'}"
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full md:w-px h-px md:h-auto bg-gray-200 my-4 md:my-0"></div>

                                    {/* AI Response */}
                                    <div className="flex-1 relative">
                                        <h3 className="text-xs font-bold text-[#7A8E6B] uppercase mb-3 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-[#7A8E6B] mr-2"></span> Docmetry Analysis
                                        </h3>

                                        {analyzing ? (
                                            <div className="flex space-x-2 py-4">
                                                <div className="w-2.5 h-2.5 bg-[#7A8E6B] rounded-full animate-bounce"></div>
                                                <div className="w-2.5 h-2.5 bg-[#A9C29B] rounded-full animate-bounce animation-delay-100"></div>
                                                <div className="w-2.5 h-2.5 bg-[#7A8E6B] rounded-full animate-bounce animation-delay-200"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-lg text-gray-800 leading-relaxed font-medium">
                                                    {aiResponse}
                                                </p>
                                                {aiResponse && (
                                                    <button
                                                        onClick={() => speakResponse(aiResponse as string)}
                                                        className="mt-4 flex items-center space-x-2 text-sm font-bold text-[#7A8E6B] hover:text-[#5D6F51] transition-colors"
                                                    >
                                                        <FaVolumeUp /> <span>Replay Audio</span>
                                                    </button>
                                                )}
                                            </>
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
