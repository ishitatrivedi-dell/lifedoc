'use client';
import { useState, useEffect } from 'react';
import { FaLightbulb, FaNewspaper, FaChevronRight, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';

interface NewsItem {
    _id: string;
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    url: string;
}

const TIPS_MOCK = [
    "Take a 5-minute stretch break every hour.",
    "Replace soda with sparkling water and lemon.",
    "Practice deep breathing for 2 minutes to reduce stress.",
    "Eat a rainbow of vegetables daily.",
    "Aim for 30 minutes of moderate activity."
];

const HealthNewsWidget = () => {
    const [tipIndex, setTipIndex] = useState(0);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Rotate tips every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS_MOCK.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch News
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                // Use port 5000 as per previous fix
                const apiUrl = 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/news`);

                if (response.data.success) {
                    // Take only first 4 items
                    setNews(response.data.data.slice(0, 4));
                }
            } catch (err) {
                console.error("News Fetch Error", err);
                setError("Unable to load latest news");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const handleNewsClick = (link: string) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-6">
            {/* Daily Tip Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 relative overflow-hidden transition-all duration-500 hover:shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaLightbulb className="text-6xl text-amber-500" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm mb-2 uppercase tracking-wide">
                        <FaLightbulb /> <span>Daily Health Tip</span>
                    </div>
                    <p className="text-gray-800 font-medium text-lg leading-relaxed animate-fade-in">
                        "{TIPS_MOCK[tipIndex]}"
                    </p>
                </div>
            </div>

            {/* News Feed */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaNewspaper className="text-blue-500" /> Health News
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Live</span>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 flex-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-gray-400 flex-1">
                        <FaExclamationCircle className="mx-auto text-2xl mb-2 text-gray-300" />
                        <p className="text-sm">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-6 flex-1">
                        {news.map((newsItem) => (
                            <div
                                key={newsItem._id}
                                onClick={() => handleNewsClick(newsItem.url)}
                                className="group cursor-pointer"
                            >
                                <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                                    {newsItem.title}
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                                    {newsItem.description || newsItem.title}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="font-medium bg-gray-50 px-2 py-1 rounded">{newsItem.source}</span>
                                    <span className="flex items-center gap-1">
                                        {new Date(newsItem.publishedAt).toLocaleDateString()}
                                        <FaChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 -ml-2 group-hover:ml-0 duration-300" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-6 mt-auto border-t border-gray-50">
                    <Link
                        href="/insights"
                        className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                        <span>View All Insights</span>
                        <FaArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HealthNewsWidget;
