'use client';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDoctorReports } from '@/store/slices/doctorReportsSlice';
import Link from 'next/link';
import { FaPlus, FaUserMd, FaPrescriptionBottleAlt, FaCalendarCheck } from 'react-icons/fa';

export default function DoctorReportsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { reports, loading } = useSelector((state: RootState) => state.doctorReports);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchDoctorReports(user.id));
        }
    }, [dispatch, user]);

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Doctor Visits</h1>
                            <p className="text-gray-500 mt-1">Keep track of your appointments and prescriptions.</p>
                        </div>
                        <Link
                            href="/doctor-reports/new"
                            className="btn-primary space-x-2"
                        >
                            <FaPlus />
                            <span>Record Visit</span>
                        </Link>
                    </header>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading records...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUserMd className="text-2xl text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctor visits recorded</h3>
                            <p className="text-gray-500 mb-6">Keep a log of your doctor appointments and prescriptions.</p>
                            <Link
                                href="/doctor-reports/new"
                                className="text-green-600 font-medium hover:underline"
                            >
                                Record a visit &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reports.map((report) => (
                                <div key={report._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#7A8E6B]/30 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-green-50 rounded-xl text-green-500">
                                                <FaUserMd className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{report.doctorName || 'Doctor Visit'}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(report.visitDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        {report.followUpDate && (
                                            <div className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                                                <FaCalendarCheck className="mr-2" />
                                                <span>Follow-up: {new Date(report.followUpDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Diagnosis & Notes</h4>
                                            {report.diagnosis && report.diagnosis.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {report.diagnosis.map((d, i) => (
                                                        <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold">{d}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-gray-600 text-sm leading-relaxed">{report.summary || "No notes recorded."}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                                <FaPrescriptionBottleAlt className="mr-2" /> Prescriptions
                                            </h4>
                                            {report.prescriptions && report.prescriptions.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {report.prescriptions.map((p, i) => (
                                                        <li key={i} className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
                                                            <span className="font-semibold text-gray-800">{p.medicine}</span>
                                                            <span className="text-gray-500"> - {p.dosage} ({p.frequency})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-400 text-sm italic">No prescriptions recorded.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
