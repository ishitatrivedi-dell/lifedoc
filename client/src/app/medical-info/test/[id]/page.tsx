'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaArrowLeft, FaVial, FaNotesMedical, FaClipboardCheck, FaInfoCircle } from 'react-icons/fa';

interface LabTest {
    _id: string;
    name: string;
    description: string;
    normalRange: string;
    preparation: string;
    clinicalSignificance: string;
    category: string;
}

const TestDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [test, setTest] = useState<LabTest | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/reference';

    useEffect(() => {
        if (token && id) {
            fetchDetails();
        }
    }, [token, id]);

    const fetchDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/tests/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTest(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-72 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9]"></div>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-72 p-8 text-center text-gray-500">
                    Test not found.
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-72 p-8 transition-all duration-300">
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-[#3AAFA9] mb-6 flex items-center transition-colors font-medium"
                >
                    <FaArrowLeft className="mr-2" /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/60 text-purple-600 rounded-lg text-sm font-bold mb-3 border border-purple-100">
                                    {test.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                                    {test.name}
                                </h1>
                                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                                    {test.description}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm text-purple-500 hidden md:block">
                                <FaVial className="text-4xl" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Normal Range */}
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center">
                                <FaClipboardCheck className="mr-2" /> Normal Range
                            </h3>
                            <p className="text-green-900 font-medium text-lg">
                                {test.normalRange}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Preparation */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FaInfoCircle className="mr-2 text-blue-500" />
                                    Preparation
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed">
                                    {test.preparation}
                                </div>
                            </div>

                            {/* Clinical Significance */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FaNotesMedical className="mr-2 text-red-500" />
                                    Clinical Significance
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed">
                                    {test.clinicalSignificance}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestDetailsPage;
