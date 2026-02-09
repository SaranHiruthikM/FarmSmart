import React, { useState, useEffect } from 'react';
import { X, HandCoins, AlertCircle, ShoppingBag } from 'lucide-react';
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
            setPrice(crop.pricePerKg || crop.finalPrice || crop.basePrice || '');
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
                // --- NEW DIRECT BUY FLOW ---
                // If "Buy Now", we call the instant buy endpoint
                const order = await orderService.instantBuy(crop._id, quantity || 1);
                // We pass the order object to onSuccess so we can redirect to Order Summary/Details
                if (onSuccess) onSuccess(order);
            } else {
                // --- EXISTING NEGOTIATION FLOW ---
                // FIX: Ensure we extract the ID correctly whether crop.farmer is an object (populated) or string
                // The crop service transform puts 'farmer' as the ID or object, and 'farmerName' separately.
                // Let's rely on crop.farmerId if available (raw from backend) or crop.farmer

                // Inspecting cropService transform:
                // farmer: farmerId (which is _id || obj)

                let farmerId = null;
                if (crop.farmerId && typeof crop.farmerId === 'object') {
                    farmerId = crop.farmerId._id;
                } else if (crop.farmer && typeof crop.farmer === 'object') {
                    farmerId = crop.farmer._id;
                } else {
                    farmerId = crop.farmer || crop.farmerId;
                }

                if (!farmerId) {
                    console.error("Critical: Farmer ID missing from crop object, notification will fail.", crop);
                }

                const newNegotiation = await negotiationService.startNegotiation(
                    crop._id,
                    price,
                    quantity,
                    message,
                    farmerId
                );
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-100 transition-all">
                {/* Header */}
                <div className="bg-[#F1F8F1] px-6 py-4 border-b border-green-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary-dark">
                        <div className="bg-primary/10 p-2 rounded-full">
                            {isBuyMode ? (
                                <ShoppingBag className="w-5 h-5 text-primary" />
                            ) : (
                                <HandCoins className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <h3 className="font-bold text-lg">{isBuyMode ? 'Confirm Purchase' : 'Negotiate Price'}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-green-100 rounded-full text-accent transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-neutral-light/20 rounded-xl border border-neutral-light">
                        <div className="w-12 h-12 bg-neutral-light rounded-lg overflow-hidden">
                            {/* Placeholder for crop image if available, else generic icon */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-2xl">
                                🌾
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-text-dark">{crop?.name}</p>
                            <p className="text-xs text-accent">Asking Price: <span className="font-bold text-primary">₹{crop?.pricePerKg || crop?.finalPrice}/{crop?.unit || 'kg'}</span></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-text-dark mb-1">
                                {isBuyMode ? 'Price (Fixed)' : `Your Offer Price (₹/${crop?.unit || 'kg'})`}
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={price}
                                readOnly={isBuyMode}
                                onChange={(e) => setPrice(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border border-neutral-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg ${isBuyMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                placeholder="Enter amount"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-dark mb-1">Quantity Needed ({crop?.unit || 'kg'})</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max={crop?.quantity}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder={`Max available: ${crop?.quantity}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-dark mb-1">Message (Optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none"
                                placeholder={isBuyMode ? "Add a note to the farmer..." : "Hi, I'm interested in buying..."}
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <PrimaryButton
                                type="submit"
                                className="w-full py-3.5 text-lg shadow-lg shadow-green-200"
                                disabled={loading}
                            >
                                {loading ? (isBuyMode ? 'Processing...' : 'Sending Offer...') : (isBuyMode ? 'Confirm Purchase Request' : 'Send Offer')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NegotiationModal;