'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCalendarAlt, FaUserMd, FaFlask, FaPlus, FaTimes, FaTrash, FaCheckCircle } from 'react-icons/fa';

interface Appointment {
    _id: string;
    providerName: string;
    type: 'Doctor' | 'Lab';
    date: string;
    time: string;
    notes: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const AppointmentsPage = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        providerName: '',
        type: 'Doctor',
        date: '',
        time: '',
        notes: ''
    });

    // Use port 5000 as per previous fix
    const API_URL = 'http://localhost:5000/api/appointments';

    useEffect(() => {
        if (token) {
            fetchAppointments();
        }
    }, [token]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(API_URL, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAppointments([...appointments, response.data.data]);
                setShowModal(false);
                setFormData({ providerName: '', type: 'Doctor', date: '', time: '', notes: '' });
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAppointments(appointments.map(app => app._id === id ? { ...app, status: status as any } : app));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(appointments.filter(app => app._id !== id));
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-72 p-8 transition-all duration-300">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-600 mt-2">Manage your doctor visits and lab tests.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#3AAFA9] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#2B7A78] transition-colors flex items-center space-x-2"
                    >
                        <FaPlus /> <span>Book Appointment</span>
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9]"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaCalendarAlt className="mx-auto text-6xl text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Appointments Scheduled</h3>
                        <p className="text-gray-500">Book your first appointment to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((app) => (
                            <div key={app._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-4 rounded-xl ${app.type === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {app.type === 'Doctor' ? <FaUserMd className="text-2xl" /> : <FaFlask className="text-2xl" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">{app.providerName}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${app.status === 'Scheduled' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center space-x-4">
                                            <span>{new Date(app.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{app.time}</span>
                                        </p>
                                        {app.notes && <p className="text-gray-400 text-sm mt-2 italic">"{app.notes}"</p>}
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                                    {app.status === 'Scheduled' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Completed')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg tooltip"
                                                title="Mark as Completed"
                                            >
                                                <FaCheckCircle className="text-xl" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Cancelled')}
                                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg tooltip"
                                                title="Cancel Appointment"
                                            >
                                                <FaTimes className="text-xl" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(app._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg tooltip"
                                        title="Delete"
                                    >
                                        <FaTrash className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Provider Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Dr. Smith or City Lab"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                                        value={formData.providerName}
                                        onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Doctor">Doctor</option>
                                            <option value="Lab">Lab</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#3AAFA9] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#2B7A78] transition-colors mt-2"
                                >
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsPage;
