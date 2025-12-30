'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaUserMd,
    FaFlask,
    FaNotesMedical,
    FaPrescriptionBottleAlt,
    FaFileMedical,
    FaClock,
    FaStethoscope
} from 'react-icons/fa';
import Link from 'next/link';

interface Appointment {
    _id: string;
    providerName: string;
    type: 'Doctor' | 'Lab';
    date: string;
    time: string;
    notes: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

interface Prescription {
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
    _id: string;
}

interface DoctorReport {
    _id: string;
    visitDate: string;
    doctorName: string;
    diagnosis: string[];
    prescriptions: Prescription[];
    summary: string;
    fileUrl?: string;
    followUpDate?: string;
}

const AppointmentDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [doctorReports, setDoctorReports] = useState<DoctorReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (token && id) {
            fetchDetails();
        }
    }, [token, id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            // 1. Fetch Appointment Details
            const appResponse = await axios.get(`${API_URL}/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (appResponse.data.success) {
                const appData = appResponse.data.data;
                setAppointment(appData);

                // 2. Fetch Linked/Related Doctor Reports
                // Try to find report by matching date and provider name if appointmentId link is missing
                // In a perfect world we use appointmentId, but for now we search loosely to support legacy data too

                // First, formatted date for query
                // Note: The backend logic for "search" might need exact date match which can be tricky with timezones.
                // Optimally we'd look for a report that has the same visitDate.

                // Let's try searching by doctor name and date range (start of day to end of day)
                const appDate = new Date(appData.date);
                const startDate = new Date(appDate);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(appDate);
                endDate.setHours(23, 59, 59, 999);

                const reportResponse = await axios.get(`${API_URL}/doctor-reports/user/${user?.id}/search`, {
                    params: {
                        doctorName: appData.providerName,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString()
                    },
                    headers: { Authorization: `Bearer ${token}` }
                });


                if (reportResponse.data && reportResponse.data.data) {
                    setDoctorReports(reportResponse.data.data);
                }
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Failed to load appointment details.');
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

    if (error || !appointment) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-72 p-8">
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                        {error || 'Appointment not found'}
                    </div>
                    <button onClick={() => router.back()} className="mt-4 text-gray-600 hover:underline flex items-center">
                        <FaArrowLeft className="mr-2" /> Back to Appointments
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-72 p-8 transition-all duration-300">
                <header className="mb-8">
                    <button
                        onClick={() => router.push('/appointments')}
                        className="text-gray-500 hover:text-[#3AAFA9] mb-4 flex items-center transition-colors font-medium"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Appointments
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        {appointment.type === 'Doctor' ? <FaUserMd className="text-[#3AAFA9]" /> : <FaFlask className="text-purple-600" />}
                        {appointment.providerName}
                        <span className={`text-sm ml-4 px-3 py-1 rounded-full ${appointment.status === 'Scheduled' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {appointment.status}
                        </span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Appointment Details Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <FaCalendarAlt className="mr-2 text-blue-500" />
                                Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date & Time</label>
                                    <p className="text-gray-900 font-medium flex items-center mt-1">
                                        <FaClock className="mr-2 text-gray-400" />
                                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</label>
                                    <p className="text-gray-900 font-medium mt-1">
                                        {appointment.type} Visit
                                    </p>
                                </div>
                                {appointment.notes && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notes</label>
                                        <div className="bg-gray-50 p-3 rounded-xl mt-1 text-gray-700 italic">
                                            "{appointment.notes}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Report / Medical Info Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {doctorReports.length > 0 ? (
                            doctorReports.map(report => (
                                <div key={report._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                            <FaFileMedical className="mr-2 text-[#3AAFA9]" />
                                            Site Report
                                        </h2>
                                        <span className="text-sm text-gray-500">
                                            Visit Date: {new Date(report.visitDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Diagnosis */}
                                    {report.diagnosis && report.diagnosis.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                                                <FaStethoscope className="mr-2" /> Diagnosis
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {report.diagnosis.map((d, i) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {report.summary && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                                                <FaNotesMedical className="mr-2" /> Clinical Summary
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                                {report.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Prescriptions */}
                                    {report.prescriptions && report.prescriptions.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                                                <FaPrescriptionBottleAlt className="mr-2" /> Prescriptions
                                            </h3>
                                            <div className="grid gap-3">
                                                {report.prescriptions.map((rx) => (
                                                    <div key={rx._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{rx.medicine}</p>
                                                            <p className="text-sm text-gray-500">{rx.dosage} • {rx.frequency}</p>
                                                        </div>
                                                        <span className="text-sm font-medium text-[#3AAFA9] mt-2 sm:mt-0 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                                                            {rx.duration}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* File Attachment */}
                                    {report.fileUrl && (
                                        <div className="mt-6 border-t border-gray-100 pt-4">
                                            <a
                                                href={report.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-[#3AAFA9] hover:text-[#2B7A78] font-medium transition-colors"
                                            >
                                                View Original Document <FaArrowLeft className="ml-2 rotate-180" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaFileMedical className="text-2xl text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Report Available</h3>
                                <p className="text-gray-500 mb-6">
                                    There is no detailed report linked to this appointment yet.
                                </p>
                                {appointment.status === 'Completed' && (
                                    <Link
                                        href={`/doctor-reports/new?date=${appointment.date}&doctor=${encodeURIComponent(appointment.providerName)}`}
                                        className="inline-flex items-center px-6 py-3 bg-[#3AAFA9] text-white rounded-xl font-bold hover:bg-[#2B7A78] transition-colors shadow-lg shadow-[#3AAFA9]/20"
                                    >
                                        Create Report Now
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsPage;
