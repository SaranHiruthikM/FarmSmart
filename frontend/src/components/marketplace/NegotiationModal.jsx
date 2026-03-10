import React, { useState, useEffect } from 'react';
import { X, HandCoins, AlertCircle, ShoppingBag, Sprout } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import orderService from '../../services/order.service';
import negotiationService from '../../services/negotiation.service';

const NegotiationModal = ({ isOpen, onClose, crop, onSuccess, mode = 'negotiate' }) => {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset or Initialize state when modal opens
    useEffect(() => {
        if (isOpen && crop) {
            setPrice(crop.price || crop.finalPrice || crop.basePrice || '');
            setQuantity(crop.quantity || '');

            if (mode === 'buy') {
                setMessage(`I would like to purchase ${crop.quantity || 'this'}kg of ${crop.name} at the listed price.`);
            } else {
                setMessage('');
            }
        }
    }, [isOpen, crop, mode]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'buy') {
                const order = await orderService.createOrder(crop._id, Number(quantity));
                if (onSuccess) onSuccess(order);
            } else {
                let farmerId = null;
                // Handle populated vs manual ID
                if (crop.farmer && typeof crop.farmer === 'object') {
                    farmerId = crop.farmer._id;
                } else if (crop.farmerId && typeof crop.farmerId === 'object') {
                   farmerId = crop.farmerId._id;
                } else {
                    farmerId = crop.farmer || crop.farmerId;
                }

                if (!farmerId) {
                   throw new Error("Farmer ID missing from crop object.");
                }

                const newNegotiation = await negotiationService.createNegotiation({
                    cropId: crop._id,
                    proposedPrice: Number(price),
                    proposedQuantity: Number(quantity),
                    initialMessage: message
                });
                
                if (onSuccess) onSuccess(newNegotiation);
            }
            onClose();
        } catch (err) {
            console.error(mode === 'buy' ? "Purchase Error:" : "Negotiation Error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to process request";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isBuyMode = mode === 'buy';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/40 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-nature-50 to-nature-100/50 p-6 border-b border-nature-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isBuyMode ? 'bg-nature-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                            {isBuyMode ? (
                                <ShoppingBag className="w-5 h-5" />
                            ) : (
                                <HandCoins className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-nature-900">{isBuyMode ? 'Confirm Purchase' : 'Negotiate Price'}</h3>
                            <p className="text-xs text-nature-500 font-medium">Step 1 of 1 • Final Review</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/60 rounded-full text-nature-400 hover:text-nature-600 transition-colors backdrop-blur-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 mb-6 animate-pulse">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4 p-4 bg-nature-50/50 rounded-2xl border border-nature-100/50 mb-6">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-nature-100 flex items-center justify-center text-3xl shrink-0">
                            {/* Placeholder for crop image or icon */}
                            {crop?.images && crop?.images.length > 0 ? (
                                <img src={crop.images[0]} alt="Crop" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <Sprout className="w-8 h-8 text-nature-300" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-nature-900 line-clamp-1">{crop?.name || "Crop Name"}</p>
                            <p className="text-xs text-nature-500 font-medium mt-1">
                                listed at <span className="font-bold text-nature-700 bg-nature-100 px-1.5 py-0.5 rounded-md">₹{crop?.price || crop?.finalPrice || crop?.basePrice}/{crop?.unit || 'kg'}</span>
                            </p>
                            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                In Stock: {crop?.quantity}{crop?.unit}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-nature-600 uppercase tracking-widest mb-2">
                                    {isBuyMode ? 'Price' : `Offer Price`}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nature-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={price}
                                        readOnly={isBuyMode}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className={`w-full pl-7 pr-3 py-3 rounded-xl border border-nature-200 focus:ring-2 focus:ring-nature-400 outline-none transition-all font-bold 
                                            ${isBuyMode ? 'bg-nature-100/50 text-nature-500 cursor-not-allowed' : 'bg-white text-nature-900 focus:bg-white'}`}
                                    />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-nature-600 uppercase tracking-widest mb-2">
                                    Quantity ({crop?.unit || 'kg'})
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={crop?.quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-nature-200 text-nature-900 font-bold focus:ring-2 focus:ring-nature-400 outline-none transition-all"
                                    placeholder="Qty"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-nature-600 uppercase tracking-widest mb-2">Note to Farmer (Optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-nature-200 text-nature-800 font-medium focus:ring-2 focus:ring-nature-400 outline-none transition-all h-24 resize-none placeholder:text-nature-300"
                                placeholder={isBuyMode ? "Example: Call me upon delivery..." : "Example: I'm looking for a bulk discount..."}
                            ></textarea>
                        </div>

                        <div className="pt-4 pb-2">
                            <PrimaryButton
                                type="submit"
                                className="w-full py-4 text-lg shadow-xl shadow-nature-600/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    isBuyMode ? 'Confirm Purchase' : 'Send Offer'
                                )}
                            </PrimaryButton>
                            <p className="text-center text-[10px] text-nature-400 font-medium mt-3">
                                By confirming, you agree to the platform's terms of service.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NegotiationModal;