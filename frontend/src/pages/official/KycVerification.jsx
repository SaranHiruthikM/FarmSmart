import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { CheckCircle2, XCircle, FileText } from "lucide-react";

const KycVerification = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get("/admin/kyc/pending");
            setUsers(res.data.data.users);
        } catch (error) {
            console.error("Failed to fetch kyc", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, status) => {
        try {
            await api.put(`/admin/kyc/${userId}`, { status });
            setUsers(users.filter((u) => u._id !== userId));
        } catch (error) {
            alert("Action failed");
        }
    };

    if (loading) return <div className="text-center text-slate-400 py-10">Loading Verifications...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">KYC Verification Inbox</h1>
            
            {users.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 p-10 rounded-2xl text-center">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No pending KYC verifications.</p>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-center">Document</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{user.fullName || "N/A"}</div>
                                        <div className="text-slate-500 text-xs">{user.phoneNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.district}, {user.state}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {user.kycDocumentUrl ? (
                                            <a href={user.kycDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs font-medium">VIEW DOCUMENT</a>
                                        ) : (
                                            <span className="text-slate-500 text-xs">No File</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                                        <button 
                                            onClick={() => handleAction(user._id, "APPROVED")}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20">
                                            <CheckCircle2 className="w-4 h-4" /> <span className="text-xs font-semibold">Approve</span>
                                        </button>
                                        <button 
                                            onClick={() => handleAction(user._id, "REJECTED")}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
                                            <XCircle className="w-4 h-4" /> <span className="text-xs font-semibold">Reject</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default KycVerification;
