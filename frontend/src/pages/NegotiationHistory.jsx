import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import negotiationService from "../services/negotiation.service";
import { Loader2, ArrowRight, Clock, CheckCircle2, XCircle, MessageCircle } from "lucide-react";

const NegotiationHistory = () => {
    const navigate = useNavigate();
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNegotiations = async () => {
            try {
                const data = await negotiationService.getMyNegotiations();
                setNegotiations(data);
            } catch (error) {
                console.error("Failed to load negotiations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNegotiations();
    }, []);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <p className="text-accent font-medium animate-pulse">Loading negotiations...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-dark tracking-tight">Negotiations</h1>
                    <p className="text-accent mt-1">Manage all your active bids and offers</p>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {negotiations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-neutral-light/50">
                        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-text-dark">No Negotiations Yet</h3>
                        <p className="text-accent mt-2 max-w-md mx-auto">Start a negotiation by visiting the marketplace and making an offer on a crop.</p>
                        <button
                            onClick={() => navigate('/dashboard/marketplace')}
                            className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    negotiations.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/dashboard/negotiations/${item._id}`)}
                            className="bg-white p-6 rounded-2xl border border-neutral-light hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-neutral-light/30 rounded-xl flex items-center justify-center text-2xl">
                                        🌾
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-dark group-hover:text-primary transition-colors">{item.cropName || 'Unknown Crop'}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-accent">
                                            <span>Qty: {item.quantity} {item.unit || 'kg'}</span>
                                            <span className="w-1 h-1 bg-neutral-light rounded-full"></span>
                                            <span>Offered: ₹{item.price}/{item.unit || 'kg'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 border ${getStatusStyle(item.status)}`}>
                                        {getStatusIcon(item.status)}
                                        {item.status?.toUpperCase()}
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-neutral-light flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NegotiationHistory;
