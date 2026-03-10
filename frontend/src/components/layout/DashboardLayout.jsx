import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = (pathname) => {
        if (pathname.includes("/dashboard/marketplace")) return "Marketplace";
        if (pathname.includes("/dashboard/my-crops")) return "My Crops";
        if (pathname.includes("/dashboard/notifications")) return "Notifications";
        if (pathname.includes("/dashboard/negotiations")) return "Negotiations";
        if (pathname.includes("/dashboard/orders")) return "Orders";
        if (pathname.includes("/dashboard/sales")) return "Sales & Revenue";
        if (pathname.includes("/dashboard/profile")) return "Profile";
        if (pathname.includes("/dashboard/settings")) return "Settings";
        return "Dashboard";
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="flex h-screen overflow-hidden bg-transparent font-sans text-slate-800">
            {/* Sidebar - Floating Glass Panel */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 lg:m-4 m-0 lg:rounded-3xl rounded-r-3xl glass-panel transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-filter-none shadow-2xl lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:ml-4 lg:mr-0"
                    }`}
            >
                <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Navbar */}
                <header className="h-16 md:h-24 flex items-center justify-between px-4 md:px-8 z-40 relative mt-2 shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            className="lg:hidden p-2 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors shadow-sm text-nature-800 active:scale-95"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-xl md:text-3xl font-black text-nature-900 tracking-tight drop-shadow-sm truncate max-w-[200px] md:max-w-none">{pageTitle}</h2>
                    </div>
                    <Header />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-4 pb-20 md:px-8 md:pb-8 scroll-smooth scrollbar-hide pt-2">
                    <div className="max-w-[1920px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>


            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-nature-950/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;
