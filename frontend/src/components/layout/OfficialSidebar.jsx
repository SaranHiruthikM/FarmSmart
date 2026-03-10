import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FileCheck,
    Landmark,
    Users,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";

const OfficialSidebar = ({ closeSidebar }) => {
    const location = useLocation();

    const menuItems = [
        { label: "Overview", icon: LayoutDashboard, path: "/official/dashboard" },
        { label: "KYC Verification", icon: FileCheck, path: "/official/kyc" },
        { label: "Government Schemes", icon: Landmark, path: "/official/schemes" },
        { label: "Advisories & Alerts", icon: AlertTriangle, path: "/official/advisories" },
        { label: "Dispute Tribunal", icon: ShieldAlert, path: "/official/disputes" },
        { label: "Quality Standards", icon: CheckCircle2, path: "/official/quality" },
    ];

    return (
        <div className="w-72 h-screen bg-slate-900 border-r border-slate-800 flex flex-col font-sans shrink-0">
            {/* Branding */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                    <ShieldAlert className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">FARMSMART</h1>
                    <p className="text-xs text-blue-400 font-medium">Cooperative Portal</p>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => closeSidebar?.()}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${isActive
                                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20"
                                : "text-slate-400 border border-transparent hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"}`} />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                   <p className="text-xs text-slate-400 mb-2">Logged in as Official Admin</p>
                   <Link 
                       to="/login"
                       onClick={() => { localStorage.clear() }} 
                       className="text-xs text-red-400 hover:text-red-300 transition-colors">
                       Sign Out
                   </Link>
                </div>
            </div>
        </div>
    );
};

export default OfficialSidebar;
