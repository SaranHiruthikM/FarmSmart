import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ShieldAlert,
    ArrowLeft,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MessageCircle,
    Package,
    ArrowRight
} from "lucide-react";
import authService from "../../services/auth.service";
import mockDisputeService from "../../services/dispute.mock";

const DisputeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dispute, setDispute] = useState(null);

    useEffect(() => {
        const data = mockDisputeService.getDisputeById(id);
        if (data) {
            setDispute(data);
        } else {
            navigate("/dashboard/disputes");
        }
    }, [id, navigate]);

    if (!dispute) return null;

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
                return <Clock className="w-5 h-5" />;
            case "RESOLVED":
                return <CheckCircle2 className="w-5 h-5" />;
            case "REJECTED":
                return <XCircle className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest mb-2">
                        <Link to="/dashboard/disputes" className="hover:text-primary transition-colors">Disputes</Link>
                        <span>/</span>
                        <span className="text-primary">{id}</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tight leading-none">Dispute Details</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard/disputes")}
                        className="px-6 py-3 rounded-[2rem] bg-white border-2 border-neutral-light text-accent text-xs font-black uppercase tracking-widest hover:bg-neutral-light transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> BACK TO LIST
                    </button>
                    <div className={`px-6 py-3 rounded-[2rem] text-xs font-black uppercase tracking-wider border-2 flex items-center gap-3 ${getStatusStyle(dispute.status)}`}>
                        {getStatusIcon(dispute.status)}
                        {dispute.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Issue Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-50 rounded-[1.5rem] text-red-600">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-dark tracking-tight leading-tight">{dispute.reason}</h2>
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">Dispute ID: {dispute.id}</p>
                            </div>
                        </div>

                        <div className="p-8 bg-neutral-light/30 rounded-[2rem] border-2 border-neutral-light/50">
                            <p className="font-medium text-text-dark leading-relaxed whitespace-pre-wrap">
                                {dispute.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 pt-2">
                            <div className="flex items-center gap-2 text-accent">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Raised on: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-accent">
                                <Package className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Order ID: {dispute.orderId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Response Section */}
                    {dispute.status !== "OPEN" && (
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-text-dark tracking-tight italic">Admin Remarks</h3>
                            </div>
                            <div className={`p-8 rounded-[2rem] border-2 ${dispute.status === "RESOLVED" ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"}`}>
                                <p className="font-bold text-text-dark leading-relaxed">
                                    {dispute.adminRemarks || "Decision pending additional details."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Related Information */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-text-dark tracking-tight italic">Order Quick View</h3>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-neutral-light rounded-2xl flex items-center justify-center text-primary">
                                    <Package className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-accent uppercase tracking-widest">Order ID</p>
                                    <h4 className="font-bold text-text-dark truncate">#{dispute.orderId}</h4>
                                </div>
                            </div>

                            <Link
                                to={`/dashboard/orders/${dispute.orderId}`}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-light text-secondary rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-neutral-light/50 transition-all border-2 border-transparent"
                            >
                                VIEW FULL ORDER <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldAlert className="w-24 h-24" />
                        </div>
                        <h4 className="text-lg font-black tracking-tight leading-snug relative z-10">FarmSmart Protection</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed relative z-10">
                            Our team investigates all disputes within 24-48 business hours. Your funds remain secured in escrow during this process.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeDetails;
