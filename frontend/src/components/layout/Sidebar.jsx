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
    Leaf,
    Sprout
} from "lucide-react";
import authService from "../../services/auth.service";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const role = user?.role?.toLowerCase();
    // const isAdmin = role === "admin";
    // const isFarmer = role === "farmer";
    // const isBuyer = role === "buyer";
    // const isLogistics = role === "logistics";
    const { t } = useTranslation();

    const menuItems = [
        { label: t('nav.dashboard'), icon: LayoutDashboard, path: "/dashboard", roles: ["farmer", "buyer", "logistics", "admin"] },
        { label: t('nav.marketplace'), icon: Store, path: "/dashboard/marketplace", roles: ["farmer", "buyer"] },
        { label: t('nav.insights'), icon: TrendingUp, path: "/dashboard/insights", roles: ["farmer", "buyer"] },
        { label: t('nav.forecast'), icon: LineChart, path: "/dashboard/forecast", roles: ["farmer", "admin"] },
        { label: t('nav.pricing'), icon: Award, path: "/dashboard/pricing", roles: ["farmer", "buyer"] },
        { label: t('nav.negotiations'), icon: Handshake, path: "/dashboard/negotiations", roles: ["farmer", "buyer"] },
        { label: t('nav.orders'), icon: Receipt, path: "/dashboard/orders", roles: ["farmer", "buyer", "logistics"] },
        { label: t('nav.logistics'), icon: Truck, path: "/dashboard/logistics", roles: ["logistics"] },
        { label: t('nav.reviews'), icon: Star, path: "/dashboard/reviews", roles: ["farmer", "buyer", "logistics"] },
        { label: t('nav.disputes'), icon: ShieldAlert, path: "/dashboard/disputes", roles: ["farmer", "buyer", "logistics"] },
        { label: t('nav.adminDisputes'), icon: ShieldAlert, path: "/dashboard/admin/disputes", roles: ["admin"] },
        { label: t('nav.sales'), icon: TrendingUp, path: "/dashboard/sales", roles: ["farmer"] },
        { label: t('nav.planning'), icon: Sprout, path: "/dashboard/planning", roles: ["farmer"] },
        { label: t('nav.notifications'), icon: Bell, path: "/dashboard/notifications", roles: ["farmer", "buyer", "logistics", "admin"] },
        { label: t('nav.schemes'), icon: Landmark, path: "/dashboard/schemes", roles: ["farmer", "buyer"] },
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
                    <span>{t('nav.settings')}</span>

                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
