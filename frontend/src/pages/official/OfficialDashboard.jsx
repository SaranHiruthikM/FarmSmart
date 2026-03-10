import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Users, AlertTriangle, FileCheck, Package } from "lucide-react";

const OfficialDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/dashboard");
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
    }

    const cards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Pending KYC", value: stats?.pendingKycCount || 0, icon: FileCheck, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        { label: "Active Disputes", value: stats?.activeDisputes || 0, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
        { label: "Total Orders", value: stats?.totalOrders || 0, icon: Package, color: "text-green-400", bg: "bg-green-500/10" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">System Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${card.bg}`}>
                            <card.icon className={`w-8 h-8 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                            <h3 className="text-3xl font-bold text-white">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Supply vs Demand Analytics</h3>
                    {stats?.supplyDemandData?.length > 0 ? (
                        <div className="space-y-5">
                            {stats.supplyDemandData.map((item, idx) => {
                                const maxSupply = Math.max(...stats.supplyDemandData.map(d => d.supply), 1);
                                const maxDemand = Math.max(...stats.supplyDemandData.map(d => d.demandIndex), 1);
                                
                                const supplyWidth = (item.supply / maxSupply) * 100;
                                const demandWidth = (item.demandIndex / maxDemand) * 100;
                                
                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="text-sm font-bold text-white mb-1">
                                            {item.name}
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <span className="text-xs text-green-400 font-semibold w-12 text-right">Supply</span>
                                            <div className="flex-1 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                                                <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{width: `${supplyWidth}%`}}></div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono w-16">{item.supply} kg</span>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <span className="text-xs text-red-400 font-semibold w-12 text-right">Demand</span>
                                            <div className="flex-1 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                                                <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{width: `${demandWidth}%`}}></div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono w-16">{item.demandIndex} bids</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center border border-slate-700 border-dashed rounded-xl">
                            <p className="text-slate-500 text-sm">Not enough data to generate analytics yet.</p>
                        </div>
                    )}
                </div>
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Alerts</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                            <div>
                                <p className="text-sm text-white font-medium">Unresolved Disputes (+3)</p>
                                <p className="text-xs text-slate-400">Requires attention from tribunal.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                            <FileCheck className="w-5 h-5 text-blue-400 shrink-0" />
                            <div>
                                <p className="text-sm text-white font-medium">KYC Backlog (+12)</p>
                                <p className="text-xs text-slate-400">Verifications pending approval.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficialDashboard;
