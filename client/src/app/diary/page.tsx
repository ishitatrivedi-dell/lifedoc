'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDiaryEntries, fetchMoodStatistics, deleteDiaryEntry, fetchDiaryEntriesByMood } from '@/store/slices/diarySlice';
import Link from 'next/link';
import { FaPlus, FaPenFancy, FaSmile, FaMeh, FaFrown, FaBolt, FaCloudRain, FaTrash, FaEdit, FaChartPie } from 'react-icons/fa';

export default function DiaryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { entries, loading, stats } = useSelector((state: RootState) => state.diary);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchDiaryEntries(user.id));
            dispatch(fetchMoodStatistics(user.id));
        }
    }, [dispatch, user]);

    const handleFilterMood = (mood: string | null) => {
        if (!user?.id) return;
        setSelectedMood(mood);
        if (mood) {
            dispatch(fetchDiaryEntriesByMood({ userId: user.id, mood }));
        } else {
            dispatch(fetchDiaryEntries(user.id));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            await dispatch(deleteDiaryEntry(id));
            if (user?.id) dispatch(fetchMoodStatistics(user.id)); // Refresh stats
        }
    };

    const getMoodIcon = (mood?: string) => {
        switch (mood) {
            case 'happy': return <FaSmile className="text-yellow-500 text-xl" />;
            case 'energetic': return <FaBolt className="text-orange-500 text-xl" />;
            case 'neutral': return <FaMeh className="text-gray-500 text-xl" />;
            case 'sad': return <FaCloudRain className="text-blue-500 text-xl" />;
            case 'stressed': return <FaFrown className="text-red-500 text-xl" />;
            default: return <FaSmile className="text-gray-400 text-xl" />;
        }
    };

    const moods = [
        { id: 'happy', icon: FaSmile, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { id: 'energetic', icon: FaBolt, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'neutral', icon: FaMeh, color: 'text-gray-500', bg: 'bg-gray-50' },
        { id: 'sad', icon: FaCloudRain, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'stressed', icon: FaFrown, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Health Diary</h1>
                        <p className="text-gray-500 mt-1">Journal your thoughts and track your mood.</p>
                    </div>
                    <Link
                        href="/diary/new"
                        className="btn-primary space-x-2"
                    >
                        <FaPlus />
                        <span>New Entry</span>
                    </Link>
                </header>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <FaPenFancy className="text-2xl text-purple-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Entries</p>
                            <h3 className="text-2xl font-bold text-gray-800">{entries.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <FaChartPie className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Top Mood</p>
                            <h3 className="text-2xl font-bold text-gray-800 capitalize">
                                {stats.length > 0 ? stats[0]._id : 'N/A'}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium mb-3">Mood Distribution</p>
                        <div className="flex space-x-2">
                            {stats.slice(0, 5).map((stat) => (
                                <div key={stat._id} className="flex flex-col items-center">
                                    <div className="h-16 w-2 bg-gray-100 rounded-full relative overflow-hidden">
                                        <div
                                            className={`absolute bottom-0 w-full rounded-full ${stat._id === 'happy' ? 'bg-yellow-400' :
                                                stat._id === 'energetic' ? 'bg-orange-400' :
                                                    stat._id === 'sad' ? 'bg-blue-400' :
                                                        stat._id === 'stressed' ? 'bg-red-400' : 'bg-gray-400'
                                                }`}
                                            style={{ height: `${(stat.count / entries.length) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 capitalize">{stat._id.slice(0, 3)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => handleFilterMood(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedMood === null
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                    {moods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => handleFilterMood(m.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center space-x-2 ${selectedMood === m.id
                                ? `${m.bg} ${m.color.replace('text-', 'text-')} ring-1 ring-inset ring-current`
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <m.icon className={selectedMood === m.id ? m.color : 'text-gray-400'} />
                            <span className="capitalize">{m.id}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading entries...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaPenFancy className="text-2xl text-purple-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No entries found</h3>
                        <p className="text-gray-500 mb-6">
                            {selectedMood ? `No entries found for mood "${selectedMood}".` : "Write your first entry to start tracking your journey."}
                        </p>
                        <Link
                            href="/diary/new"
                            className="text-purple-600 font-medium hover:underline"
                        >
                            Write an entry &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entries.map((entry) => (
                            <div key={entry._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#7A8E6B]/30 hover:shadow-md transition flex flex-col h-full group relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition flex space-x-2">
                                    <Link
                                        href={`/diary/${entry._id}`}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <FaEdit size={12} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(entry._id)}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-600"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-sm font-semibold text-gray-400">
                                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {getMoodIcon(entry.mood)}
                                    </div>
                                </div>

                                <Link href={`/diary/${entry._id}`} className="block flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 hover:text-blue-600 transition">{entry.summary}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {entry.rawText || "No additional text details."}
                                    </p>
                                </Link>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {entry.tags?.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
