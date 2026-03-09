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
import { useTranslation } from "react-i18next";

const Sidebar = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const role = user?.role?.toLowerCase();
    const isAdmin = role === "admin";
    const isFarmer = role === "farmer";
    const isBuyer = role === "buyer";
    const isLogistics = role === "logistics";
    const { t } = useTranslation();

    const menuItems = [
        { label: t('nav.dashboard'), icon: LayoutDashboard, path: "/dashboard", roles: ["farmer", "buyer", "logistics", "admin"] },
        { label: t('nav.marketplace'), icon: Store, path: "/dashboard/marketplace", roles: ["farmer", "buyer"] },
        { label: t('nav.insights'), icon: TrendingUp, path: "/dashboard/insights", roles: ["farmer", "buyer"] },
        { label: t('nav.forecast'), icon: LineChart, path: "/dashboard/forecast", roles: ["farmer", "admin"] },
        { label: t('nav.pricing'), icon: Award, path: "/dashboard/pricing", roles: ["farmer", "buyer"] },
        { label: t('nav.negotiations'), icon: Handshake, path: "/dashboard/negotiation", roles: ["farmer", "buyer"] },
        { label: t('nav.orders'), icon: Receipt, path: "/dashboard/orders", roles: ["farmer", "buyer", "logistics"] },
        { label: t('nav.logistics'), icon: Truck, path: "/dashboard/logistics", roles: ["logistics"] },
        { label: t('nav.reviews'), icon: Star, path: "/dashboard/reviews", roles: ["farmer", "buyer", "logistics"] },
        { label: t('nav.disputes'), icon: ShieldAlert, path: "/dashboard/disputes", roles: ["farmer", "buyer", "logistics"] },
        { label: t('nav.adminDisputes'), icon: ShieldAlert, path: "/dashboard/admin/disputes", roles: ["admin"] },
        { label: t('nav.sales'), icon: TrendingUp, path: "/dashboard/sales", roles: ["farmer"] },
        { label: t('nav.notifications'), icon: Bell, path: "/dashboard/notifications", roles: ["farmer", "buyer", "logistics", "admin"] },
        { label: t('nav.schemes'), icon: Landmark, path: "/dashboard/schemes", roles: ["farmer", "buyer"] },
    ].filter(item => item.roles.includes(role));


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
                {menuItems.map((item) => {
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
                    <span>{t('nav.settings')}</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
