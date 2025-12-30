'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaArrowLeft, FaUserMd, FaPrescriptionBottleAlt, FaCalendarCheck, FaFilePrescription, FaNotesMedical, FaDownload } from 'react-icons/fa';
import Link from 'next/link';

interface Prescription {
    medicine: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
}

interface DoctorReport {
    _id: string;
    visitDate: string;
    doctorName?: string;
    diagnosis?: string[];
    prescriptions?: Prescription[];
    summary?: string;
    fileUrl?: string;
    followUpDate?: string;
}

export default function DoctorVisitDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [report, setReport] = useState<DoctorReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctor-reports/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.data) {
                    setReport(response.data.data);
                } else {
                    setError('Report not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load report details');
            } finally {
                setLoading(false);
            }
        };

        if (token && params.id) {
            fetchReport();
        }
    }, [token, params.id]);

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex justify-center items-center h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (error || !report) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Report not found'}</h2>
                        <button onClick={() => router.back()} className="text-blue-600 hover:underline">
                            &larr; Go Back
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Visit Details</h1>
                        <p className="text-gray-500 text-sm">
                            {new Date(report.visitDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Main Column */}
                    <div className="space-y-6">

                        {/* Doctor Info Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
                                <FaUserMd className="text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{report.doctorName || 'Unknown Doctor'}</h2>
                                <p className="text-gray-500 mt-1">Provider / Specialist</p>
                                {report.followUpDate && (
                                    <div className="mt-4 inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium">
                                        <FaCalendarCheck className="mr-2" />
                                        Follow-up: {new Date(report.followUpDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary & Diagnosis */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaNotesMedical className="mr-2 text-purple-500" /> Clinical Summary
                            </h3>

                            {report.diagnosis && report.diagnosis.length > 0 && (
                                <div className="mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Diagnoses</span>
                                    <div className="flex flex-wrap gap-2">
                                        {report.diagnosis.map((d, i) => (
                                            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Doctor's Notes</span>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {report.summary || "No additional notes recorded."}
                                </p>
                            </div>
                        </div>

                        {/* Prescriptions List */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FaPrescriptionBottleAlt className="mr-2 text-green-500" /> Prescriptions
                            </h3>
                            {report.prescriptions && report.prescriptions.length > 0 ? (
                                <div className="space-y-3">
                                    {report.prescriptions.map((p, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-gray-900">{p.medicine}</p>
                                                <p className="text-sm text-gray-500">{p.dosage} • {p.frequency}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No prescriptions listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Prescription Image (Moved Below Prescriptions) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FaFilePrescription className="mr-2 text-blue-500" /> Attachment
                        </h3>
                        {report.fileUrl ? (
                            <div className="space-y-4">
                                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img
                                        src={report.fileUrl}
                                        alt="Prescription"
                                        className="w-full h-auto object-contain max-h-96 hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                                        onClick={() => window.open(report.fileUrl, '_blank')}
                                    />
                                </div>
                                <a
                                    href={report.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition"
                                >
                                    <FaDownload className="inline mr-2" /> View Full Size
                                </a>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">No image attached</p>
                            </div>
                        )}
                    </div>
                </div>


            </DashboardLayout>
        </ProtectedRoute>
    );
}
