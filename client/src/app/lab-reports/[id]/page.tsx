'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchLabReportById } from '@/store/slices/labReportsSlice';
import { useRouter, useParams } from 'next/navigation';
import { deleteLabReport } from '@/store/slices/labReportsSlice';
import { FaArrowLeft, FaFlask, FaDownload, FaMagic, FaCalendarAlt, FaNotesMedical, FaTrash } from 'react-icons/fa';

export default function LabReportDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const { currentReport, loading, error } = useSelector((state: RootState) => state.labReports);

    useEffect(() => {
        if (id) {
            dispatch(fetchLabReportById(id as string));
        }
    }, [dispatch, id]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this lab report? This action cannot be undone.")) {
            if (id) {
                const result = await dispatch(deleteLabReport(id as string));
                if (deleteLabReport.fulfilled.match(result)) {
                    router.push('/lab-reports');
                } else {
                    alert("Failed to delete report.");
                }
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (error || !currentReport) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
                        <p className="text-gray-500 mb-6">{error || "The requested lab report could not be found."}</p>
                        <button
                            onClick={() => router.back()}
                            className="text-blue-600 hover:underline"
                        >
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
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{currentReport.testType}</h1>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                            <FaCalendarAlt className="mr-2" />
                            {new Date(currentReport.reportDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-3">
                        {currentReport.fileUrl && (
                            <a
                                href={currentReport.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <FaDownload />
                                <span>View Original</span>
                            </a>
                        )}
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                        >
                            <FaTrash />
                            <span>Delete</span>
                        </button>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Main Content - Results */}
                    <div className="space-y-8">
                        {/* Key Results */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800 flex items-center">
                                    <FaFlask className="mr-2 text-blue-500" />
                                    Test Results
                                </h3>
                            </div>
                            <div className="p-6">
                                {currentReport.parsedResults ? (
                                    <div className="space-y-8">
                                        {/* Handle 'tests' array from AI */}
                                        {currentReport.parsedResults.tests && Array.isArray(currentReport.parsedResults.tests) && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Detailed Analysis</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                                <th className="pb-3 pl-4">Test Name</th>
                                                                <th className="pb-3">Result</th>
                                                                <th className="pb-3">Unit</th>
                                                                <th className="pb-3">Ref Range</th>
                                                                <th className="pb-3">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {currentReport.parsedResults.tests.map((test: any, index: number) => (
                                                                <tr key={index} className="hover:bg-gray-50 transition">
                                                                    <td className="py-4 pl-4 font-medium text-gray-700">{test.testName || 'Unknown'}</td>
                                                                    <td className="py-4 text-gray-900 font-semibold">{test.resultValue || '-'}</td>
                                                                    <td className="py-4 text-gray-500 text-sm">{test.unit || '-'}</td>
                                                                    <td className="py-4 text-gray-500 text-sm">{test.referenceRange || '-'}</td>
                                                                    <td className="py-4">
                                                                        {test.interpretation === 'Abnormal' || test.interpretation === 'High' || test.interpretation === 'Low' ? (
                                                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Abnormal</span>
                                                                        ) : (
                                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Normal</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Handle 'patientDetails' */}
                                        {currentReport.parsedResults.patientDetails && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Patient Details</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                                                    {Object.entries(currentReport.parsedResults.patientDetails).map(([key, value]) => (
                                                        <div key={key}>
                                                            <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                            <p className="font-medium text-gray-800">{String(value)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Handle 'summary' */}
                                        {currentReport.parsedResults.summary && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Summary</h4>
                                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
                                                    <p><strong>Total Tests:</strong> {currentReport.parsedResults.summary.totalTests}</p>
                                                    <p><strong>Abnormal Tests:</strong> {currentReport.parsedResults.summary.abnormalTests}</p>
                                                    {currentReport.parsedResults.summary.criticalFindings && (
                                                        <p className="mt-2 text-red-600 font-bold">Critical Findings Detected</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fallback for simple key-value pairs if not using the specific schema */}
                                        {!currentReport.parsedResults.tests && !currentReport.parsedResults.patientDetails && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                            <th className="pb-3 pl-4">Parameter</th>
                                                            <th className="pb-3">Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {Object.entries(currentReport.parsedResults).map(([key, value]) => {
                                                            if (typeof value === 'object') return null; // Skip nested objects in fallback
                                                            return (
                                                                <tr key={key} className="hover:bg-gray-50 transition">
                                                                    <td className="py-4 pl-4 font-medium text-gray-700 capitalize">{key}</td>
                                                                    <td className="py-4 text-gray-900 font-semibold">{String(value)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-center py-4">No structured results available.</p>
                                )}
                            </div>
                        </div>

                        {/* Clinical Notes */}
                        {currentReport.notes && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <FaNotesMedical className="mr-2 text-green-500" />
                                    Clinical Notes
                                </h3>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-green-50 p-4 rounded-xl border border-green-100">
                                    {currentReport.notes}
                                </p>
                            </div>
                        )}

                        {/* Original Report Image */}
                        {currentReport.originalReport && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <FaFlask className="mr-2 text-indigo-500" />
                                    Original Report
                                </h3>
                                <div className="rounded-xl overflow-hidden border border-gray-200">
                                    <img
                                        src={currentReport.originalReport}
                                        alt="Original Lab Report"
                                        className="w-full h-auto object-contain max-h-[600px] bg-gray-50"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
