import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import OfficialSidebar from "./OfficialSidebar";
import authService from "../../services/auth.service";

const OfficialLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Protected Route Logic for Admin
    if (!authService.isAuthenticated()) {
        return <Navigate to="/admin-login" replace />;
    }
    const userRole = authService.getCurrentUser()?.role;
    if (userRole !== "ADMIN" && userRole !== "COOPERATIVE") {
        return <Navigate to="/dashboard" replace />;
    }

    const getPageTitle = (pathname) => {
        if (pathname.includes("/official/kyc")) return "KYC Verification Dashboard";
        if (pathname.includes("/official/schemes")) return "Government Schemes Manager";
        if (pathname.includes("/official/advisories")) return "Broadcast Alerts & Advisories";
        if (pathname.includes("/official/disputes")) return "Dispute Resolution Tribunal";
        if (pathname.includes("/official/quality")) return "Quality Matrix Control";
        return "Cooperative Overview & Analytics";
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="flex h-screen bg-[#0F172A] font-sans text-slate-200">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <OfficialSidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-40 relative">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{pageTitle}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="hidden md:flex flex-col text-right">
                             <span className="text-sm font-semibold text-white">Admin System</span>
                             <span className="text-xs text-blue-400">Connected to Data Center</span>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-slate-700">
                            A
                         </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-[#0F172A]">
                    <div className="max-w-[1920px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default OfficialLayout;
