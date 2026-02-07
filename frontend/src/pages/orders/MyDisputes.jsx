import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ShieldAlert,
    ChevronRight,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import mockDisputeService from "../../services/dispute.mock";

const MyDisputes = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);

    useEffect(() => {
        if (user) {
            const data = mockDisputeService.getMyDisputes(user.fullName);
            setDisputes(data);
        }
    }, [user?.fullName]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "OPEN":
                return "bg-amber-50 text-amber-600 border-amber-100";
            case "RESOLVED":
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "REJECTED":
                return "bg-red-50 text-red-600 border-red-100";
            default:
                return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "OPEN":
                return <Clock className="w-4 h-4" />;
            case "RESOLVED":
                return <CheckCircle2 className="w-4 h-4" />;
            case "REJECTED":
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest mb-2">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-primary">Disputes</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tight leading-none">My Disputes</h1>
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-neutral-light shadow-sm text-center space-y-6">
                    <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto text-accent">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text-dark tracking-tight">No Disputes Found</h3>
                        <p className="text-accent font-medium mt-2">You haven't raised any disputes yet.</p>
                    </div>
                    <Link
                        to="/dashboard/orders"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-primary/20"
                    >
                        VIEW MY ORDERS <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {disputes.map((dispute) => (
                        <div
                            key={dispute.id}
                            onClick={() => {
                                window.scrollTo(0, 0);
                                navigate(`/dashboard/disputes/${dispute.id}`);
                            }}
                            className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm hover:border-primary transition-all group relative overflow-hidden cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldAlert className="w-24 h-24" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 flex items-center gap-2 ${getStatusStyle(dispute.status)}`}>
                                        {getStatusIcon(dispute.status)}
                                        {dispute.status}
                                    </div>
                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(dispute.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-text-dark tracking-tight leading-snug group-hover:text-primary transition-colors">
                                        {dispute.reason}
                                    </h3>
                                    <p className="text-xs font-black text-accent uppercase tracking-widest mt-1">
                                        Order ID: {dispute.orderId}
                                    </p>
                                </div>

                                <p className="text-sm font-medium text-secondary line-clamp-2 leading-relaxed">
                                    {dispute.description}
                                </p>

                                <div className="pt-4 flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                                    VIEW DETAILS <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDisputes;
