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
// eslint-disable-next-line
import authService from "../../services/auth.service";
import disputeService from "../../services/dispute.service";

const MyDisputes = () => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        const fetchDisputes = async () => {
            setLoading(true);
            try {
                const data = await disputeService.getMyDisputes();
                setDisputes(data);
            } catch (err) {
                console.error("Failed to fetch disputes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDisputes();
    }, []);

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

    const filteredDisputes = activeTab === "ALL"
        ? disputes
        : disputes.filter(d => d.status === activeTab);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        <span>Dashboard</span>
                        <span className="opacity-30">/</span>
                        <span className="text-primary font-black uppercase">My Disputes</span>
                    </div>
                    <h1 className="text-5xl font-black text-text-dark tracking-tighter leading-none">
                        Support <span className="text-primary">Tickets</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 bg-neutral-light/50 rounded-xl">
                        {["ALL", "OPEN", "RESOLVED"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-accent"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-20 rounded-[3rem] border-2 border-neutral-light flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-accent uppercase tracking-widest">Loading history...</p>
                </div>
            ) : filteredDisputes.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border-2 border-neutral-light text-center space-y-8 shadow-sm">
                    <div className="w-24 h-24 bg-neutral-light rounded-[2rem] flex items-center justify-center mx-auto text-accent shadow-inner">
                        <ShieldAlert className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-text-dark tracking-tight">No disputes to show</h3>
                        <p className="text-accent font-medium max-w-xs mx-auto">Either you're all caught up, or your filter is too specific.</p>
                    </div>
                    <Link
                        to="/dashboard/orders"
                        className="inline-flex items-center gap-2 bg-text-dark text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 hover:-translate-y-1"
                    >
                        VIEW MY ORDERS <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDisputes.map((dispute) => (
                        <div
                            key={dispute.id}
                            onClick={() => navigate(`/dashboard/disputes/${dispute.id}`)}
                            className="bg-white p-8 rounded-[3rem] border-2 border-neutral-light shadow-sm hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden cursor-pointer"
                        >
                            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldAlert className="w-32 h-32" />
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

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-text-dark tracking-tight leading-tight group-hover:text-primary transition-colors">
                                        {dispute.reason}
                                    </h3>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary" /> CASE #{dispute.id?.toString().slice(-6) || "???"}
                                    </p>
                                </div>

                                <p className="text-sm font-medium text-secondary line-clamp-2 leading-relaxed italic">
                                    "{dispute.description}"
                                </p>

                                <div className="pt-4 flex items-center justify-between border-t-2 border-neutral-light group-hover:border-primary/20">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">VIEW DETAILS</span>
                                    <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
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
