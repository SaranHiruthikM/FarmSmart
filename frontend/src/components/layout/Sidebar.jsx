import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Store,
    TrendingUp,
    LineChart,
    Award,
    Handshake,
    Receipt,
    Truck,
    Star,
    ShieldAlert,
    Bell,
    Landmark,
    Leaf
} from "lucide-react";
import authService from "../../services/auth.service";

const Sidebar = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const isLogisticsProvider = user?.role?.toLowerCase() === "logistics";
    const isAdminOrFarmer = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "farmer";

    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", show: true },
        { label: "Crop Listing & Marketplace", icon: Store, path: "/dashboard/marketplace", show: !isLogisticsProvider },
        { label: "Price Comparison & Insights", icon: TrendingUp, path: "/dashboard/insights", show: !isLogisticsProvider },
        { label: "Demand Forecasting", icon: LineChart, path: "/dashboard/forecast", show: !isLogisticsProvider },
        { label: "Quality-Based Pricing", icon: Award, path: "/dashboard/pricing", show: !isLogisticsProvider },
        { label: "Negotiation & Bidding", icon: Handshake, path: "/dashboard/negotiation", show: !isLogisticsProvider },
        { label: "Orders & Transactions", icon: Receipt, path: "/dashboard/orders", show: !isLogisticsProvider },
        { label: "Logistics Dashboard", icon: Truck, path: "/dashboard/logistics", show: isLogisticsProvider },
        { label: "Ratings, Reviews & Trust", icon: Star, path: "/dashboard/reviews", show: !isLogisticsProvider },
        { label: "Dispute Resolution", icon: ShieldAlert, path: "/dashboard/disputes", show: !isLogisticsProvider },
        ...(isAdminOrFarmer ? [{ label: "Manage Disputes (Admin)", icon: ShieldAlert, path: "/dashboard/admin/disputes", show: true }] : []),
        ...(user?.role?.toLowerCase() === "farmer" ? [{ label: "Sales & Revenue", icon: TrendingUp, path: "/dashboard/sales", show: true }] : []),
        { label: "Notifications & Alerts", icon: Bell, path: "/dashboard/notifications", show: true },
        { label: "Gov Schemes & Advisory", icon: Landmark, path: "/dashboard/schemes", show: !isLogisticsProvider },
    ];

    return (
        <div className="w-72 h-screen bg-[#F1F8F1] border-r border-green-100 flex flex-col font-sans shrink-0">
            {/* Branding */}
            <div className="p-6 flex items-center gap-3 border-b border-green-100/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-primary-dark">FARMSMART</h1>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-green-200">
                {menuItems.filter(item => item.show).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive
                                ? "bg-primary text-white shadow-md shadow-green-200"
                                : "text-[#5C715E] hover:bg-green-100/50 hover:text-primary-dark"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#8CA38D] group-hover:text-primary"}`} />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Settings Link (optional but standard) */}
            <div className="p-4 border-t border-green-100/50">
                <Link to="/dashboard/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#5C715E] hover:bg-green-100/50 hover:text-primary-dark transition-all text-sm font-medium">
                    <div className="w-5 h-5" /> {/* Placeholder/Icon if needed */}
                    <span>Settings</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
