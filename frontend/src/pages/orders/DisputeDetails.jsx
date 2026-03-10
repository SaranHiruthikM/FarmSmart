import  { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ShieldAlert,
    ArrowLeft,
    Calendar,
    Clock,
    CircleAlert,
    CheckCircle2,
    XCircle,
    MessageCircle,
    Package,
    ArrowRight,
    User,
    RotateCcw
} from "lucide-react";
import authService from "../../services/auth.service";
import disputeService from "../../services/dispute.service";

const DisputeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const userRole = user?.role?.toUpperCase() || "BUYER";
    const isAdmin = userRole === "ADMIN";
    const isFarmer = userRole === "FARMER";

    const [dispute, setDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminRemarks, setAdminRemarks] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadDispute();
    }, [id]);

    const loadDispute = async () => {
        setLoading(true);
        try {
            const data = await disputeService.getDisputeById(id);
            if (!data) throw new Error("Dispute not found");
            setDispute(data);
            if (data.adminRemarks) setAdminRemarks(data.adminRemarks);
        } catch (err) {
            console.error("Failed to fetch dispute", err);
            alert("Case not found or access denied.");
            navigate("/dashboard/disputes");
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
                await disputeService.updateDisputeStatus(id, status, adminRemarks);
            } else if (isFarmer && status === "RESOLVED") {
                await disputeService.resolveDispute(id);
            }
            await loadDispute();
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

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-accent uppercase tracking-widest">Identifying Case #{id?.slice(-6)}...</p>
        </div>
    );
    if (!dispute) return null;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2 cursor-pointer" onClick={() => navigate("/dashboard/disputes")}>
                        <ArrowLeft className="w-4 h-4 text-primary" />
                        <span>Support Center</span>
                        <span className="opacity-30">/</span>
                        <span className="text-primary">Case Details</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tighter leading-none">
                        #{dispute.id?.toString().slice(-8).toUpperCase() || "CASE-FILE"}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-2 ${getStatusStyle(dispute.status)}`}>
                        {dispute.status === "OPEN" ? <Clock className="w-4 h-4" /> :
                            dispute.status === "RESOLVED" ? <CheckCircle2 className="w-4 h-4" /> :
                                <XCircle className="w-4 h-4" />}
                        {dispute.status}
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/disputes")}
                        className="px-8 py-3 rounded-2xl bg-white border-2 border-neutral-light text-text-dark text-[10px] font-black uppercase tracking-widest hover:bg-neutral-light transition-all flex items-center gap-2 shadow-sm"
                    >
                        BACK TO LIST
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Case Substance */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-neutral-light shadow-sm space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                            <ShieldAlert className="w-64 h-64" />
                        </div>

                        <div className="space-y-2 relative z-10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dispute Reason</p>
                            <h2 className="text-3xl font-black text-text-dark tracking-tighter leading-tight">
                                {dispute.reason}
                            </h2>
                        </div>

                        <div className="p-8 bg-neutral-light/30 rounded-[2.5rem] border-2 border-dashed border-neutral-light relative z-10">
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-4">Statement of Facts</p>
                            <p className="text-lg font-medium text-text-dark leading-relaxed italic">
                                "{dispute.description}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 relative z-10">
                            <div className="p-6 bg-white border-2 border-neutral-light rounded-2xl">
                                <p className="text-[8px] font-black text-accent uppercase tracking-[0.2em] mb-1">RAISED BY</p>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-text-dark text-sm">{dispute.raisedBy}</span>
                                </div>
                            </div>
                            <div className="p-6 bg-white border-2 border-neutral-light rounded-2xl">
                                <p className="text-[8px] font-black text-accent uppercase tracking-[0.2em] mb-1">DATED</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-text-dark text-sm">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="p-6 bg-white border-2 border-neutral-light rounded-2xl">
                                <p className="text-[8px] font-black text-accent uppercase tracking-[0.2em] mb-1">LINKED ORDER</p>
                                <div className="flex items-center gap-2 text-primary hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/orders/${dispute.orderId}`)}>
                                    <Package className="w-4 h-4" />
                                    <span className="font-black text-sm uppercase">#{dispute.orderIdDisplay?.toString().slice(-6) || dispute.orderId?.toString().slice(-6) || "UNK"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolution Timeline / Decision */}
                    {dispute.status !== "OPEN" ? (
                        <div className="bg-text-dark p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                            <div className="absolute -bottom-10 -right-10 p-10 opacity-10">
                                <CheckCircle2 className="w-48 h-48" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-4 bg-primary/20 rounded-2xl text-primary border border-primary/20">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight leading-none uppercase italic">Official Decision</h3>
                                    <p className="text-xs text-primary font-black tracking-widest mt-1">CASE {dispute.status}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 relative z-10">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Resolution Summary</p>
                                <p className="text-xl font-medium text-stone-200 leading-relaxed italic">
                                    "{dispute.adminRemarks || "The issue has been satisfactorily addressed according to platform policies."}"
                                </p>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => handleAction("OPEN")}
                                    className="px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-text-dark rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 relative z-10"
                                >
                                    <RotateCcw className="w-4 h-4" /> RE-OPEN CASE FOR INVESTIGATION
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-10 rounded-[3rem] border-2 border-blue-100 flex items-start gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Clock className="w-32 h-32 text-blue-500" />
                            </div>
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-blue-600 shadow-sm border border-blue-200 relative z-10">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <h3 className="text-2xl font-black text-blue-950 tracking-tight leading-none">Case Under Investigation</h3>
                                <p className="text-blue-800 font-medium leading-relaxed max-w-xl">
                                    Our resolution officers are currently reviewing the evidence provided. This typically takes 24-48 business hours.
                                    {isAdmin ? " You have full authority to mediate this case." : " We will notify you via email and notification once a decision is logged."}
                                </p>
                                <div className="flex gap-4 pt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" /> REAL-TIME MONITORING ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Sidebar */}
                <div className="space-y-6">
                    {dispute.status === "OPEN" && (isAdmin || isFarmer) && (
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-primary/20 shadow-xl shadow-primary/5 space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <h3 className="text-2xl font-black text-text-dark tracking-tighter">Take <span className="text-primary">Action</span></h3>

                            {isAdmin ? (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> Final Remarks
                                        </label>
                                        <textarea
                                            value={adminRemarks}
                                            onChange={(e) => setAdminRemarks(e.target.value)}
                                            placeholder="Clearly state the reason for the resolution..."
                                            className="w-full p-6 bg-neutral-light/30 rounded-[1.5rem] border-2 border-neutral-light focus:border-primary focus:bg-white outline-none transition-all min-h-[160px] font-medium text-sm shadow-inner"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => handleAction("RESOLVED")}
                                            disabled={isUpdating}
                                            className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-green-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> APPROVE & RESOLVE
                                        </button>
                                        <button
                                            onClick={() => handleAction("REJECTED")}
                                            disabled={isUpdating}
                                            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" /> REJECT CLAIM
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-100 flex items-start gap-4">
                                        <CircleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-amber-800 leading-relaxed italic">
                                            "Marking this as resolved confirms you have addressed the buyer's concerns directly. This will close the ticket."
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAction("RESOLVED")}
                                        disabled={isUpdating}
                                        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> ISSUE RESOLVED
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Support Card */}
                    <div className="bg-text-dark p-10 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldAlert className="w-24 h-24" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight leading-tight relative z-10 italic">Case Integrity</h4>
                        <p className="text-xs text-stone-400 font-medium leading-relaxed mt-4 relative z-10">
                            All disputes are recorded for quality assurance. Providing false evidence may lead to account suspension.
                        </p>
                        <div className="pt-6 relative z-10">
                            <ul className="space-y-3">
                                {[
                                    "Immutable Case Logs",
                                    "Verified Transaction IDs",
                                    "Escrow Protection Active"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeDetails;
