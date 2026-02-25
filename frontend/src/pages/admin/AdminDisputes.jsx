import React, { useState, useEffect } from "react";
import {
    ShieldAlert,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Package,
    ArrowRight,
    MessageCircle,
    RotateCcw,
    ArrowLeft,
    ChevronRight,
    CircleAlert
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import disputeService from "../../services/dispute.service";
import authService from "../../services/auth.service";

const AdminDisputes = () => {
    const { id: urlId } = useParams();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const userRole = user?.role?.toUpperCase() || "BUYER";
    const isAdmin = userRole === "ADMIN";
    const isFarmer = userRole === "FARMER";
     // eslint-disable-next-line
    const isBuyer = userRole === "BUYER";

    const [disputes, setDisputes] = useState([]);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        loadDisputes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole]);

    const loadDisputes = async () => {
        setLoading(true);
        try {
            const data = isAdmin
                ? await disputeService.getAllDisputes()
                : await disputeService.getMyDisputes();
            setDisputes(data);

            // Handle URL-based deep linking
            if (urlId) {
                const match = data.find(d => d.id === urlId);
                if (match) {
                    setSelectedDispute(match);
                    if (match.adminRemarks) setAdminRemarks(match.adminRemarks);
                }
            }
        } catch (err) {
            console.error("Failed to load disputes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        if (isAdmin && !adminRemarks) {
            alert("Please provide admin remarks.");
            return;
        }

        setIsUpdating(true);
        try {
            if (isAdmin) {
                await disputeService.updateDisputeStatus(selectedDispute.id, status, adminRemarks);
            } else if (isFarmer && status === "RESOLVED") {
                await disputeService.resolveDispute(selectedDispute.id);
            }
            await loadDisputes();
            setSelectedDispute(null);
            setAdminRemarks("");
            alert(`Dispute ${status.toLowerCase()} successfully.`);
        } catch (err) {
            alert("Failed to update dispute: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

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

    const filteredDisputes = activeTab === "ALL"
        ? disputes
        : disputes.filter(d => d.status === activeTab);

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        <span>Support Center</span>
                        <span className="opacity-30">/</span>
                        <span className="text-primary">Dispute Resolution</span>
                    </div>
                    <h1 className="text-5xl font-black text-text-dark tracking-tighter leading-none">
                        Resolution <span className="text-primary">Center</span>
                    </h1>
                    <p className="text-accent font-medium mt-3 max-w-md">
                        {isAdmin
                            ? "Manage and resolve conflicts between farmers and buyers across the platform."
                            : "Track and manage disputes related to your orders and transactions."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadDisputes}
                        className="p-4 rounded-2xl bg-white border-2 border-neutral-light text-accent hover:text-primary hover:border-primary transition-all shadow-sm"
                        title="Refresh List"
                    >
                        <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-8 py-4 rounded-2xl bg-white border-2 border-neutral-light text-text-dark text-xs font-black uppercase tracking-widest hover:bg-neutral-light transition-all flex items-center gap-2 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> DASHBOARD
                    </button>
                </div>
            </div>

            {/* Quick Stats & Tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b-2 border-neutral-light pb-2">
                <div className="flex gap-2 p-1 bg-neutral-light/50 rounded-2xl w-full lg:w-auto">
                    {["ALL", "OPEN", "RESOLVED", "REJECTED"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? "bg-white text-primary shadow-md"
                                : "text-accent hover:text-text-dark"
                                }`}
                        >
                            {tab} {activeTab === tab && `(${filteredDisputes.length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Disputes List */}
                <div className="xl:col-span-2 space-y-6">
                    {loading ? (
                        <div className="bg-white p-20 rounded-[3rem] border-2 border-neutral-light flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-black text-accent uppercase tracking-widest">Fetching records...</p>
                        </div>
                    ) : filteredDisputes.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border-2 border-neutral-light text-center space-y-6">
                            <div className="w-20 h-20 bg-neutral-light rounded-[2rem] flex items-center justify-center mx-auto text-accent shadow-inner">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-dark tracking-tight">Everything looks clear</h3>
                                <p className="text-accent font-medium mt-2 max-w-xs mx-auto">No disputes match your current filter selection.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredDisputes.map((dispute) => (
                                <div
                                    key={dispute.id}
                                    onClick={() => setSelectedDispute(dispute)}
                                    className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex items-center gap-6 ${selectedDispute?.id === dispute.id
                                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                        : "bg-white border-neutral-light hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${dispute.status === "OPEN" ? "bg-amber-50 border-amber-100 text-amber-500" :
                                        dispute.status === "RESOLVED" ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                            "bg-red-50 border-red-100 text-red-500"
                                        }`}>
                                        {dispute.status === "OPEN" ? <Clock className="w-6 h-6" /> :
                                            dispute.status === "RESOLVED" ? <CheckCircle2 className="w-6 h-6" /> :
                                                <XCircle className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">#{dispute.id?.toString().slice(-6) || "???"}</span>
                                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                                                <Package className="w-3 h-3" /> ORDER: {dispute.orderIdDisplay || dispute.orderId?.toString().slice(-6) || "UNK"}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-text-dark tracking-tight truncate group-hover:text-primary transition-colors">
                                            {dispute.reason}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 bg-neutral-light rounded-full flex items-center justify-center text-accent">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-bold text-secondary">{dispute.raisedBy}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-accent/50 uppercase tracking-widest">{dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : "Unknown"}</span>
                                        </div>
                                    </div>

                                    <div className="hidden md:block text-right px-4">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusStyle(dispute.status)}`}>
                                            {dispute.status}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-neutral-light/50 rounded-xl text-accent group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dispute Action Panel */}
                <div className="space-y-6">
                    {selectedDispute ? (
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-neutral-light shadow-xl space-y-8 sticky top-8 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-text-dark tracking-tighter">Case <span className="text-primary">Details</span></h2>
                                <button
                                    onClick={() => setSelectedDispute(null)}
                                    className="p-2 hover:bg-red-50 text-accent hover:text-red-500 rounded-xl transition-all"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-neutral-light/30 rounded-[2rem] border-2 border-neutral-light relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <MessageCircle className="w-16 h-16 text-accent" />
                                    </div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-3">Raiser's Statement</p>
                                    <p className="text-base font-medium text-text-dark leading-relaxed relative z-10">
                                        "{selectedDispute.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Status</p>
                                        <p className="text-xs font-black text-text-dark uppercase">{selectedDispute.status}</p>
                                    </div>
                                    <div className="p-4 bg-accent/5 rounded-2xl border-2 border-accent/10">
                                        <p className="text-[8px] font-black text-accent uppercase tracking-[0.2em] mb-1">Created</p>
                                        <p className="text-xs font-black text-text-dark uppercase">{new Date(selectedDispute.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {selectedDispute.status === "OPEN" ? (
                                    <div className="space-y-6 pt-4 border-t-2 border-neutral-light">
                                        {isAdmin ? (
                                            <>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-black text-accent uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4" /> Admin Remarks
                                                    </label>
                                                    <textarea
                                                        value={adminRemarks}
                                                        onChange={(e) => setAdminRemarks(e.target.value)}
                                                        placeholder="Provide a clear explanation for the resolution..."
                                                        className="w-full p-5 bg-neutral-light/30 rounded-[1.5rem] border-2 border-neutral-light focus:border-primary focus:bg-white outline-none transition-all min-h-[140px] font-medium text-sm shadow-inner"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => handleAction("RESOLVED")}
                                                        disabled={isUpdating}
                                                        className="py-5 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-green-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                                    >
                                                        APPROVE & RESOLVE
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction("REJECTED")}
                                                        disabled={isUpdating}
                                                        className="py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                                                    >
                                                        REJECT CASE
                                                    </button>
                                                </div>
                                            </>
                                        ) : isFarmer ? (
                                            <div className="space-y-4">
                                                <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-100 flex items-start gap-4">
                                                    <CircleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                                                        A buyer has raised an issue regarding this order. If you've addressed their concerns, you can close this dispute yourself.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleAction("RESOLVED")}
                                                    disabled={isUpdating}
                                                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" /> MARK AS RESOLVED
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 flex items-start gap-4">
                                                <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-blue-900 uppercase">Awaiting Review</p>
                                                    <p className="text-xs font-medium text-blue-800 leading-relaxed">
                                                        Your dispute is being investigated by our admin team. You'll be notified once a decision has been made.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6 pt-6 border-t-2 border-neutral-light">
                                        <div className={`p-6 rounded-[2rem] border-2 ${selectedDispute.status === "RESOLVED" ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"
                                            }`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                {selectedDispute.status === "RESOLVED" ? (
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-500" />
                                                )}
                                                <span className={`text-sm font-black uppercase tracking-widest ${selectedDispute.status === "RESOLVED" ? "text-emerald-700" : "text-red-700"
                                                    }`}>
                                                    Case {selectedDispute.status}
                                                </span>
                                            </div>

                                            {selectedDispute.adminRemarks && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-accent/60 uppercase tracking-widest">Resolution Summary</p>
                                                    <p className="text-sm font-medium text-secondary italic leading-relaxed">
                                                        "{selectedDispute.adminRemarks}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {isAdmin && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await disputeService.updateDisputeStatus(selectedDispute.id, "OPEN", "Re-opened for further investigation");
                                                        loadDisputes();
                                                        setSelectedDispute(null);
                                                    } catch {
                                                        alert("Failed to re-open dispute");
                                                    }
                                                }}
                                                className="w-full py-4 border-2 border-neutral-light text-accent rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-neutral-light transition-all flex items-center justify-center gap-2"
                                            >
                                                <RotateCcw className="w-4 h-4" /> RE-OPEN DISPUTE
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-neutral-light text-center space-y-6">
                            <div className="w-24 h-24 bg-neutral-light/50 rounded-full flex items-center justify-center mx-auto text-accent/30 group">
                                <ShieldAlert className="w-12 h-12 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-text-dark tracking-tight">Select a case</h4>
                                <p className="text-accent text-sm font-medium mt-1">Review the details and take necessary actions to resolve conflicts.</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Help */}
                    <div className="bg-text-dark p-8 rounded-[3rem] text-white space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <ShieldAlert className="w-6 h-6" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Guidelines</h4>
                        </div>
                        <ul className="space-y-3 opacity-80">
                            {[
                                "Be objective in your assessments",
                                "Provide clear remarks for transparency",
                                "Resolution time is typically 24-48h"
                            ].map((text, i) => (
                                <li key={i} className="text-xs font-medium flex items-center gap-3 italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDisputes;
