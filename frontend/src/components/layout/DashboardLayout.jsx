import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTranslation } from "react-i18next";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const { t } = useTranslation();

    const getPageTitle = (pathname) => {
        if (pathname.includes("/dashboard/marketplace")) return t('nav.marketplace');
        if (pathname.includes("/dashboard/my-crops")) return t('nav.myCrops');
        if (pathname.includes("/dashboard/notifications")) return t('nav.notifications');
        if (pathname.includes("/dashboard/negotiations")) return t('nav.negotiations');
        if (pathname.includes("/dashboard/orders")) return t('nav.orders');
        if (pathname.includes("/dashboard/sales")) return t('nav.sales');
        if (pathname.includes("/dashboard/profile")) return t('nav.profile');
        if (pathname.includes("/dashboard/settings")) return t('nav.settings');
        return t('nav.dashboard');
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-900">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 z-40 relative">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{pageTitle}</h2>
                    </div>
                    <Header />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    <div className="max-w-[1920px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;
