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
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import mockDisputeService from "../../services/dispute.mock";

const AdminDisputes = () => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadDisputes();
    }, []);

    const loadDisputes = () => {
        const data = mockDisputeService.getAllDisputes();
        setDisputes(data);
    };

    const handleAction = (status) => {
        if (!adminRemarks) {
            alert("Please provide admin remarks.");
            return;
        }

        setIsUpdating(true);
        setTimeout(() => {
            mockDisputeService.updateDisputeStatus(selectedDispute.id, status, adminRemarks);
            loadDisputes();
            setIsUpdating(false);
            setSelectedDispute(null);
            setAdminRemarks("");
            alert(`Dispute ${status.toLowerCase()} successfully.`);
        }, 1000);
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

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest mb-2">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-primary">Dispute Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tight leading-none">Manage Disputes</h1>
                </div>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-3 rounded-[2rem] bg-white border-2 border-neutral-light text-accent text-xs font-black uppercase tracking-widest hover:bg-neutral-light transition-all flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Disputes List */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2.5rem] border-2 border-neutral-light shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-light/50 border-b-2 border-neutral-light">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Dispute ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Raised By</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Reason</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-accent uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-neutral-light">
                                {disputes.map((dispute) => (
                                    <tr
                                        key={dispute.id}
                                        className={`hover:bg-neutral-light/20 transition-colors ${selectedDispute?.id === dispute.id ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-text-dark">#{dispute.id}</span>
                                            <p className="text-[10px] font-bold text-accent uppercase mt-1">Order: {dispute.orderId}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-neutral-light rounded-full flex items-center justify-center text-accent">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text-dark">{dispute.raisedBy}</p>
                                                    <p className="text-[10px] font-black text-primary uppercase">{dispute.raisedByRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-secondary">
                                            {dispute.reason}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${getStatusStyle(dispute.status)}`}>
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => setSelectedDispute(dispute)}
                                                className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-accent"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dispute Action Panel */}
                <div className="space-y-6">
                    {selectedDispute ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm space-y-6 sticky top-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-text-dark tracking-tight italic">Handle Dispute</h2>
                                <button onClick={() => setSelectedDispute(null)} className="text-xs font-black text-accent hover:text-red-500 uppercase tracking-widest">Close</button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-neutral-light/30 rounded-2xl border-2 border-neutral-light">
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Issue Description</p>
                                    <p className="text-sm font-medium text-text-dark leading-relaxed">
                                        {selectedDispute.description}
                                    </p>
                                </div>

                                {selectedDispute.status === "OPEN" ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-accent uppercase tracking-widest ml-1">Admin Remarks</label>
                                            <textarea
                                                value={adminRemarks}
                                                onChange={(e) => setAdminRemarks(e.target.value)}
                                                placeholder="Enter resolution details or reason for rejection..."
                                                className="w-full p-4 bg-neutral-light/30 rounded-2xl border-2 border-neutral-light focus:border-primary outline-none transition-all min-h-[120px] font-medium text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleAction("RESOLVED")}
                                                disabled={isUpdating}
                                                className="py-4 bg-primary text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-green-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                            >
                                                RESOLVE
                                            </button>
                                            <button
                                                onClick={() => handleAction("REJECTED")}
                                                disabled={isUpdating}
                                                className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4 pt-4 border-t-2 border-neutral-light">
                                        <div className="flex items-center gap-2 text-primary">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="text-xs font-black uppercase tracking-widest">Already {selectedDispute.status}</span>
                                        </div>
                                        <div className="p-4 bg-neutral-light/50 rounded-2xl italic text-sm text-secondary">
                                            "{selectedDispute.adminRemarks}"
                                        </div>
                                        <button
                                            onClick={() => {
                                                mockDisputeService.updateDisputeStatus(selectedDispute.id, "OPEN", "");
                                                loadDisputes();
                                                setSelectedDispute(null);
                                            }}
                                            className="w-full py-3 border-2 border-neutral-light text-accent rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-neutral-light transition-all flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="w-3 h-3" /> RE-OPEN DISPUTE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-neutral-light shadow-sm text-center space-y-4">
                            <div className="w-16 h-16 bg-neutral-light/50 rounded-full flex items-center justify-center mx-auto text-accent/50">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-accent italic">Select a dispute from the list to take action.</p>
                        </div>
                    )}

                    <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Package className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-widest">System Stats</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-secondary">Total Disputes</span>
                                <span className="text-sm font-black text-text-dark">{disputes.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-600">
                                <span className="text-xs font-bold">Open Items</span>
                                <span className="text-sm font-black">{disputes.filter(d => d.status === 'OPEN').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDisputes;
