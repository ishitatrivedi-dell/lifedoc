'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaSearch, FaPills, FaVial, FaBookMedical, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

interface MedicalItem {
    _id: string;
    name: string;
    description: string;
    category?: string;
    type?: 'medicine' | 'test'; // For mixed search results
}

const MedicalInfoPage = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'medicine' | 'test'>('medicine');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<MedicalItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<MedicalItem[]>([]);

    const API_URL = 'http://localhost:5000/api/reference';

    useEffect(() => {
        if (token) {
            fetchInitialData();
        }
    }, [token, activeTab]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'medicine' ? '/medicines' : '/tests';
            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: { query: searchQuery, type: activeTab },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const displayItems = searchQuery.length > 1 ? searchResults : items;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-72 p-8 transition-all duration-300">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <FaBookMedical className="mr-3 text-[#3AAFA9]" />
                        Medical Encyclopedia
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Trusted information about medicines and lab tests.
                    </p>
                </header>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('medicine')}
                        className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'medicine'
                                ? 'border-[#3AAFA9] text-[#3AAFA9]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <FaPills className="inline mr-2 mb-1" /> Medicines
                    </button>
                    <button
                        onClick={() => setActiveTab('test')}
                        className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'test'
                                ? 'border-[#3AAFA9] text-[#3AAFA9]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <FaVial className="inline mr-2 mb-1" /> Lab Tests
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'medicine' ? 'medicines' : 'lab tests'}...`}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:border-[#3AAFA9] focus:ring-4 focus:ring-[#3AAFA9]/10 outline-none transition-all text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => (
                                <Link
                                    key={item._id}
                                    href={`/medical-info/${activeTab}/${item._id}`}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#3AAFA9]/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${activeTab === 'medicine' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {activeTab === 'medicine' ? <FaPills className="text-xl" /> : <FaVial className="text-xl" />}
                                        </div>
                                        {item.category && (
                                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#3AAFA9] transition-colors mb-2">
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center text-[#3AAFA9] font-bold text-sm">
                                        Read More <FaChevronRight className="ml-1 text-xs" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500 text-lg">No results found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalInfoPage;
