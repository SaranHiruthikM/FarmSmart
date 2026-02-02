import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[#F8FAF8] overflow-hidden">
            {/* Sidebar - Fixed */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
