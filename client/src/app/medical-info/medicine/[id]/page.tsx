'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaArrowLeft, FaPills, FaNotesMedical, FaExclamationTriangle, FaPrescriptionBottle } from 'react-icons/fa';

interface Medicine {
    _id: string;
    name: string;
    description: string;
    uses: string[];
    sideEffects: string[];
    dosageInfo: string;
    manufacturer: string;
    category: string;
}

const MedicineDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/reference';

    useEffect(() => {
        if (token && id) {
            fetchDetails();
        }
    }, [token, id]);

    const fetchDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/medicines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMedicine(response.data.data);
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

    if (!medicine) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-72 p-8 text-center text-gray-500">
                    Medicine not found.
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/60 text-blue-600 rounded-lg text-sm font-bold mb-3 border border-blue-100">
                                    {medicine.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                                    {medicine.name}
                                </h1>
                                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                                    {medicine.description}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-500 hidden md:block">
                                <FaPills className="text-4xl" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid gap-8 md:grid-cols-2">
                        {/* Uses */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <FaNotesMedical className="mr-2 text-green-500" />
                                Indications & Usage
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed max-h-60 overflow-y-auto">
                                {medicine.uses.map((use, i) => (
                                    <p key={i} className="mb-2">{use}</p>
                                ))}
                            </div>
                        </div>

                        {/* Side Effects */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <FaExclamationTriangle className="mr-2 text-orange-500" />
                                Adverse Reactions
                            </h3>
                            <div className="bg-orange-50/50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed max-h-60 overflow-y-auto">
                                {medicine.sideEffects.map((effect, i) => (
                                    <p key={i} className="mb-2">{effect}</p>
                                ))}
                            </div>
                        </div>

                        {/* Dosage Info */}
                        <div className="md:col-span-2 mt-4">
                            <div className="bg-[#3AAFA9]/5 border border-[#3AAFA9]/20 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-[#2B7A78] flex items-center mb-3">
                                    <FaPrescriptionBottle className="mr-2" />
                                    Dosage & Administration
                                </h3>
                                <p className="text-gray-800 leading-relaxed font-medium text-sm">
                                    {medicine.dosageInfo}
                                </p>
                                <p className="text-xs text-gray-500 mt-4 italic">
                                    * Always consult your physician before taking any medication.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineDetailsPage;
