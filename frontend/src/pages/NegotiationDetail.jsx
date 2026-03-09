import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import negotiationService from '../services/negotiation.service';
import socketService from '../services/socket.service';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Send, ShieldCheck, User, Clock, IndianRupee } from 'lucide-react';
import PrimaryButton from '../components/common/PrimaryButton';

const NegotiationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [counterPrice, setCounterPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    // Mocking user role for now - in real app would verify against auth
    const [userRole, setUserRole] = useState(null); // Start as null to avoid default-state flashes

    useEffect(() => {
        const fetchNegotiation = async () => {
            try {
                const data = await negotiationService.getNegotiationById(id);

                // Determine role immediately before setting negotiation to avoid sync issues
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = userData._id || userData.id;

                // Robust comparison
                const isFarmer = String(data.farmerId) === String(userId);
                const isBuyer = String(data.buyerId) === String(userId);

                if (isFarmer) setUserRole("farmer");
                else if (isBuyer) setUserRole("buyer");
                else setUserRole(null); // Unauthorized viewer

                setNegotiation(data);
            } catch (error) {
                console.error("Failed to load negotiation", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNegotiation();

        // Socket setup
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData._id || userData.id;

        const socket = socketService.connect(userId);
        socketService.joinNegotiation(id);

        const handleUpdate = (data) => {
            console.log("Real-time update received:", data);
            const transformed = negotiationService.transformNegotiation(data);
            // Ensure we update state correctly
            setNegotiation(prev => {
                // Optimization: only update if changed? For now, always update.
                return transformed;
            });
        };

        socketService.on('negotiation:update', handleUpdate);

        return () => {
            socketService.leaveNegotiation(id);
            socketService.off('negotiation:update', handleUpdate);
        };
    }, [id]);

    const handleResponse = async (action) => {
        setIsSubmitting(true);
        try {
            const updatedNegotiation = await negotiationService.respondToNegotiation(id, action, counterPrice);
            setNegotiation(updatedNegotiation);
            setCounterPrice('');
        } catch (error) {
            alert(error.message || "Action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
    );

    if (!negotiation) return <div className="p-8 text-center text-red-500">{t('negotiations.notFound')}</div>;

    const isFinalStatus = ['accepted', 'rejected'].includes(negotiation.status?.toLowerCase());

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <button
                onClick={() => navigate('/dashboard/negotiation')}
                className="flex items-center text-accent hover:text-primary transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('negotiations.backToNeg')}
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-green-100/50 border border-green-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                        🌾
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-dark">{negotiation.cropName}</h1>
                        <p className="text-accent font-medium mt-1">{t('negotiations.quantity')}: <span className="text-text-dark font-bold">{negotiation.quantity} {negotiation.unit || 'kg'}</span></p>
                        <p className="text-sm text-accent mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('negotiations.started')} {new Date(negotiation.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className={`px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 border-2 ${negotiation.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                    negotiation.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                    {negotiation.status === 'accepted' ? <CheckCircle2 className="w-5 h-5" /> :
                        negotiation.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                            <Clock className="w-5 h-5" />}
                    {negotiation.status}
                </div>
            </div>

            {/* Chat/Timeline Area */}
            <div className="bg-[#F8FAF8] rounded-[2rem] p-6 border border-neutral-light min-h-[400px] flex flex-col">
                <div className="flex-1 space-y-6">
                    {/* Conversation History */}
                    {negotiation.history && negotiation.history.map((offer, index) => {
                        const isMyOffer = offer.by.toLowerCase() === userRole;
                        const offerName = offer.by === 'BUYER' ? negotiation.buyerName : negotiation.farmerName;

                        return (
                            <div key={index} className={`flex ${isMyOffer ? 'justify-end' : 'justify-start'}`}>
                                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-neutral-light max-w-lg ${isMyOffer ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-full ${offer.by === 'BUYER' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-accent uppercase">
                                            {offerName} <span className="opacity-70">({offer.by})</span>
                                        </span>
                                        <span className="text-[10px] text-accent/50 font-medium ml-auto">
                                            {new Date(offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-primary mb-1">
                                        ₹{offer.price}
                                        <span className="text-base text-accent font-medium ml-1">/{negotiation.unit || 'kg'} • {offer.quantity} {negotiation.unit || 'kg'}</span>
                                    </div>
                                    {offer.message && (
                                        <p className="text-text-dark bg-neutral-light/30 p-3 rounded-xl text-sm mt-3 italic">"{offer.message}"</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* If Status changed */}
                    {isFinalStatus && (
                        <div className="flex justify-center my-6">
                            <div className="bg-white border border-neutral-light px-6 py-2 rounded-full text-sm font-bold text-accent shadow-sm flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                {t('negotiations.negStatus', { status: negotiation.status, by: negotiation.statusBy || t('negotiations.farmer') })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Area (Turn-based) */}
                {userRole && negotiation.lastOfferBy?.toUpperCase() !== userRole.toUpperCase() && !isFinalStatus && (
                    <div className="mt-8 bg-white p-6 rounded-3xl shadow-lg border border-neutral-light">
                        <h3 className="font-bold text-text-dark mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            {t('negotiations.respond')}
                        </h3>
                        {/* Action Buttons Grid */}
                        <div className={`grid grid-cols-1 ${userRole === 'farmer' ? 'md:grid-cols-2' : ''} gap-4`}>
                            {userRole === 'farmer' && (
                                <button
                                    onClick={() => handleResponse('accept')}
                                    disabled={isSubmitting}
                                    className="p-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> {t('negotiations.accept')}
                                </button>
                            )}
                            <button
                                onClick={() => handleResponse('reject')}
                                disabled={isSubmitting}
                                className="p-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" /> {t('negotiations.reject')}
                            </button>
                        </div>

                        <div className="relative mt-6 pt-6 border-t border-neutral-light">
                            <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-bold text-accent uppercase">{t('negotiations.orCounter')}</p>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                                    <input
                                        type="number"
                                        placeholder={t('negotiations.enterPrice')}
                                        value={counterPrice}
                                        onChange={(e) => setCounterPrice(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-light/20 border border-neutral-light rounded-xl font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <PrimaryButton
                                    onClick={() => handleResponse('counter')}
                                    disabled={!counterPrice || isSubmitting}
                                    className="px-6"
                                >
                                    {t('negotiations.counter')}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Waiting View (Turn-based) */}
                {userRole && negotiation.lastOfferBy?.toUpperCase() === userRole.toUpperCase() && !isFinalStatus && (
                    <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-100 text-center font-medium animate-pulse">
                        {t('negotiations.waitingForUser', { user: userRole === 'buyer' ? t('negotiations.farmer') : t('negotiations.buyer') })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NegotiationDetail;
