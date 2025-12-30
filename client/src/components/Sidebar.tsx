'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaHeartbeat, FaBookMedical, FaFileMedical, FaUserMd, FaSignOutAlt, FaMicrophone, FaCamera, FaUser, FaLightbulb, FaCalendarAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaHome },
        { name: 'AI Consultation', path: '/consultation', icon: FaMicrophone },
        // { name: 'Rx Scanner', path: '/scan', icon: FaCamera },
        { name: 'Measurements', path: '/measurements', icon: FaHeartbeat },
        { name: 'Diary', path: '/diary', icon: FaBookMedical },
        { name: 'Lab Reports', path: '/lab-reports', icon: FaFileMedical },
        { name: 'Doctor Reports', path: '/doctor-reports', icon: FaUserMd },
        { name: 'Appointments', path: '/appointments', icon: FaCalendarAlt },
        { name: 'Insights', path: '/insights', icon: FaLightbulb },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`h-screen w-72 bg-white border-r border-gray-200 fixed left-0 top-0 z-50 flex flex-col font-sans transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-8">
                    <h1 className="text-2xl font-extrabold flex items-center space-x-2 text-gray-900 tracking-tight">
                        <span>Docmetry</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={onClose} // Close sidebar on nav click (mobile)
                                className={`flex items-center space-x-3 px-5 py-3.5 rounded-sm transition-all duration-300 group ${isActive
                                    ? 'bg-gradient-primary text-white shadow-md shadow-[#7A8E6B]/20'
                                    : 'text-gray-500 hover:bg-[#7A8E6B]/10 hover:text-[#7A8E6B]'
                                    }`}
                            >
                                <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#7A8E6B]'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                        <span className="text-xs font-bold text-gray-500 uppercase">Settings & Accessibility</span>
                    </div>
                    <Link
                        href="/profile"
                        onClick={onClose}
                        className="flex items-center space-x-3 px-4 py-2 w-full rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                        <FaUser className="text-xl" />
                        <span className="font-medium">Profile</span>
                    </Link>


                    <div className="h-px bg-gray-200 my-2"></div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
