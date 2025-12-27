'use client';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchLabReports } from '@/store/slices/labReportsSlice';
import Link from 'next/link';
import { FaPlus, FaFileMedicalAlt, FaFlask, FaDownload, FaSearch } from 'react-icons/fa';

export default function LabReportsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { reports, loading } = useSelector((state: RootState) => state.labReports);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchLabReports(user.id));
        }
    }, [dispatch, user]);

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Lab Reports</h1>
                            <p className="text-gray-500 mt-1">Manage and track your medical test results.</p>
                        </div>
                        <Link
                            href="/lab-reports/new"
                            className="btn-primary space-x-2"
                        >
                            <FaPlus />
                            <span>Upload Report</span>
                        </Link>
                    </header>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaFlask className="text-2xl text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No lab reports found</h3>
                            <p className="text-gray-500 mb-6">Upload your first lab report to keep it safe.</p>
                            <Link
                                href="/lab-reports/new"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Upload a report &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map((report) => (
                                <div key={report._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#7A8E6B]/30 hover:shadow-md transition flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                                            <FaFlask className="text-xl" />
                                        </div>
                                        {report.fileUrl && (
                                            <a
                                                href={report.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-600 transition"
                                                title="Download/View File"
                                            >
                                                <FaDownload />
                                            </a>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{report.testType}</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {new Date(report.reportDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>

                                    <div className="flex-grow">
                                        {report.parsedResults && Object.keys(report.parsedResults).length > 0 && (
                                            <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm">
                                                <p className="font-semibold text-gray-700 mb-2">Key Results:</p>
                                                <div className="space-y-1">
                                                    {Object.entries(report.parsedResults).slice(0, 3).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between text-gray-600">
                                                            <span className="capitalize">{key}:</span>
                                                            <span className="font-medium text-gray-900">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {report.notes && (
                                            <p className="text-sm text-gray-500 italic line-clamp-2">"{report.notes}"</p>
                                        )}
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
