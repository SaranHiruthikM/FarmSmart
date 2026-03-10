import  { useState, useEffect } from "react";
import api from "../../services/api";
import { ShieldAlert, CheckCircle, MessageSquare } from "lucide-react";

const DisputeTribunal = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [adminRemark, setAdminRemark] = useState("");

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await api.get("/disputes/admin/all");
            setDisputes(res.data);
        } catch (error) {
            console.error("Failed to fetch disputes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (status) => {
        if (!adminRemark.trim()) {
            alert("Please provide a concluding remark for the tribunal record.");
            return;
        }

        try {
            await api.patch(`/disputes/admin/${selectedDispute._id}`, {
                status: status,
                adminRemark: adminRemark
            });
            fetchDisputes();
            setSelectedDispute(null);
            setAdminRemark("");
        } catch (error) {
            console.log(error)
            alert("Failed to update dispute status.");
        }
    };

    if (loading) return <div className="text-center text-slate-400 py-10">Loading Tribunal Cases...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6 shrink-0">
                <ShieldAlert className="text-red-400" />
                Dispute Resolution Tribunal
            </h1>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Cases List */}
                <div className="w-1/3 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/80 font-semibold text-white">Active Cases ({disputes.filter(d => d.status === 'OPEN').length})</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {disputes.map(d => (
                            <button
                                key={d._id}
                                onClick={() => { setSelectedDispute(d); setAdminRemark(d.adminRemark || ""); }}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${selectedDispute?._id === d._id ? "bg-slate-700 border-slate-500 shadow-md" : "bg-slate-900 border-slate-800 hover:bg-slate-800"}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-white">Case #{d._id.slice(-6).toUpperCase()}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        d.status === "OPEN" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                        d.status === "RESOLVED" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                        "bg-slate-700 text-slate-300"
                                    }`}>
                                        {d.status}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-300 font-medium mb-1 truncate">{d.reason}</div>
                                <div className="text-xs text-slate-500 flex justify-between items-center mt-2">
                                    <span>By: {d.raisedByRole}</span>
                                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))}
                        {disputes.length === 0 && <p className="text-center text-slate-500 mt-10">No cases found.</p>}
                    </div>
                </div>

                {/* Case Details */}
                <div className="w-2/3 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
                    {selectedDispute ? (
                        <>
                            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-white">Case Details #{selectedDispute._id.slice(-6).toUpperCase()}</h2>
                                    <span className="text-sm text-slate-400">Filed {new Date(selectedDispute.createdAt).toLocaleString()}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-sm">
                                        <p className="text-slate-400 mb-1">Raised By</p>
                                        <p className="font-semibold text-white">{selectedDispute.raisedBy?.fullName || "User"}</p>
                                        <p className="text-xs text-blue-400 bg-blue-500/10 inline-block px-2 py-0.5 rounded mt-1">{selectedDispute.raisedByRole}</p>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-sm">
                                        <p className="text-slate-400 mb-1">Associated Order ID</p>
                                        <p className="font-mono text-white text-xs mt-2">{selectedDispute.orderId?._id || selectedDispute.orderId}</p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Issue: {selectedDispute.reason}</h3>
                                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 text-sm leading-relaxed">
                                    {selectedDispute.description}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col bg-slate-800">
                                <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-400" /> Official Tribunal Statement
                                </h3>
                                <textarea
                                    className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
                                    placeholder="Enter final resolution remarks and instructions..."
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                    disabled={selectedDispute.status !== 'OPEN'}
                                ></textarea>
                                
                                {selectedDispute.status === 'OPEN' ? (
                                    <div className="flex gap-4 justify-end">
                                        <button 
                                            onClick={() => handleResolve("REJECTED")}
                                            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors">
                                            Dismiss Case
                                        </button>
                                        <button 
                                            onClick={() => handleResolve("RESOLVED")}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 rounded-xl transition-colors">
                                            <CheckCircle className="w-4 h-4" /> Issue Resolution
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                        <CheckCircle className="w-5 h-5" /> This case has been closed.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10">
                            <ShieldAlert className="w-16 h-16 mb-4 opacity-50 text-slate-400" />
                            <p className="text-lg">Select a dispute case from the list</p>
                            <p className="text-sm mt-2">All remarks entered will be permanently attached to the order.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisputeTribunal;
