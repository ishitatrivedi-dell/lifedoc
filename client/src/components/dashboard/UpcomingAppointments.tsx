'use client';
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserMd, FaFlask, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface Appointment {
    _id: string;
    providerName: string;
    type: 'Doctor' | 'Lab';
    date: string;
    time: string;
    notes: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const UpcomingAppointments = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!token) return;
            try {
                // Use port 5000
                const API_URL = 'http://localhost:5000/api/appointments';
                const response = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const appointments: Appointment[] = response.data.data;

                    // Filter for future scheduled appointments
                    const now = new Date();
                    const upcoming = appointments
                        .filter(app => app.status === 'Scheduled')
                        .filter(app => {
                            const appDate = new Date(app.date);
                            // Set app date time to end of day to include today's appointments
                            appDate.setHours(23, 59, 59, 999);
                            return appDate >= now;
                        })
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                    if (upcoming.length > 0) {
                        setNextAppointment(upcoming[0]);
                    } else {
                        setNextAppointment(null);
                    }
                }
            } catch (err) {
                console.error("Error fetching appointments", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [token]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-100 rounded-xl w-full"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-[#3AAFA9]" /> Upcoming Appointments
                </h3>
                <Link href="/appointments" className="text-xs font-bold text-[#3AAFA9] hover:underline">
                    View All
                </Link>
            </div>

            {nextAppointment ? (
                <div className="relative z-10">
                    <div className="flex items-start space-x-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                        <div className={`p-3 rounded-lg ${nextAppointment.type === 'Doctor' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {nextAppointment.type === 'Doctor' ? <FaUserMd className="text-xl" /> : <FaFlask className="text-xl" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{nextAppointment.providerName}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1 space-x-3">
                                <span className="flex items-center"><FaCalendarAlt className="mr-1 text-gray-400" /> {new Date(nextAppointment.date).toLocaleDateString()}</span>
                                <span className="flex items-center"><FaClock className="mr-1 text-gray-400" /> {nextAppointment.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 relative z-10">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <FaCalendarAlt className="text-xl" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No upcoming appointments</p>
                    <Link href="/appointments" className="text-[#3AAFA9] text-xs font-bold mt-2 inline-block hover:underline">
                        Schedule one now
                    </Link>
                </div>
            )}

            {/* Decorative background element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#3AAFA9] opacity-5 rounded-full blur-xl"></div>
        </div>
    );
};

export default UpcomingAppointments;
