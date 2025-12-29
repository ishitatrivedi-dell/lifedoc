'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 flex items-center px-4 border-b border-gray-200 shadow-sm">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FaBars className="text-xl" />
                </button>
                <span className="ml-4 font-extrabold text-xl text-gray-900 tracking-tight">Docmetry</span>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            {/* Added pt-16 for mobile to account for the fixed header, removed on md */}
            <main className={`flex-1 transition-all duration-300 ease-in-out w-full
                pt-16 md:pt-0 md:ml-72
            `}>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
