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
    const role = user?.role?.toLowerCase();
    const isAdmin = role === "admin";
    const isFarmer = role === "farmer";
    const isBuyer = role === "buyer";
    const isLogistics = role === "logistics";

    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["farmer", "buyer", "logistics", "admin"] },
        { label: "Crop Marketplace", icon: Store, path: "/dashboard/marketplace", roles: ["farmer", "buyer"] },
        { label: "Price Insights", icon: TrendingUp, path: "/dashboard/insights", roles: ["farmer", "buyer"] },
        { label: "Demand Forecasting", icon: LineChart, path: "/dashboard/forecast", roles: ["farmer", "admin"] },
        { label: "Quality Pricing", icon: Award, path: "/dashboard/pricing", roles: ["farmer", "buyer"] },
        { label: "Negotiations", icon: Handshake, path: "/dashboard/negotiation", roles: ["farmer", "buyer"] },
        { label: "Orders & History", icon: Receipt, path: "/dashboard/orders", roles: ["farmer", "buyer", "logistics"] },
        { label: "Logistics Hub", icon: Truck, path: "/dashboard/logistics", roles: ["logistics"] },
        { label: "Reviews & Trust", icon: Star, path: "/dashboard/reviews", roles: ["farmer", "buyer", "logistics"] },
        { label: "Dispute Support", icon: ShieldAlert, path: "/dashboard/disputes", roles: ["farmer", "buyer", "logistics"] },
        { label: "Admin Disputes", icon: ShieldAlert, path: "/dashboard/admin/disputes", roles: ["admin"] },
        { label: "Sales & Revenue", icon: TrendingUp, path: "/dashboard/sales", roles: ["farmer"] },
        { label: "Notifications", icon: Bell, path: "/dashboard/notifications", roles: ["farmer", "buyer", "logistics", "admin"] },
        { label: "Gov Schemes", icon: Landmark, path: "/dashboard/schemes", roles: ["farmer", "buyer"] },
    ].filter(item => item.roles.includes(role));


    return (
        <div className="w-full h-full flex flex-col font-sans shrink-0 bg-transparent">
            {/* Branding */}
            <div className="p-8 flex items-center gap-4">
                <div className="bg-gradient-to-br from-nature-400 to-nature-600 p-2.5 rounded-xl shadow-lg shadow-nature-500/30">
                    <Leaf className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-nature-900">FarmSmart</h1>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-nature-200">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm group relative overflow-hidden ${isActive
                                ? "bg-nature-600 text-white shadow-lg shadow-nature-600/30"
                                : "text-nature-900 hover:bg-white/50 hover:text-nature-700 hover:shadow-sm"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30" />
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-white" : "text-nature-400 group-hover:text-nature-600"}`} />
                            <span className="truncate relative z-10">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Settings Link */}
            <div className="p-4 mx-4 mb-4 mt-2 border-t border-nature-200/50">
                <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nature-700 hover:bg-white/50 hover:text-nature-900 transition-all text-sm font-medium">
                    <div className="w-5 h-5 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-nature-400"></span>
                    </div>
                    <span>Settings</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
