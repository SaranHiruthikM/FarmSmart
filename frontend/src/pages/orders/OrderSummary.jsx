import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Truck, User, Info, AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import authService from "../../services/auth.service";
import negotiationService from "../../services/negotiation.service";
import orderService from "../../services/order.service";

const OrderSummary = () => {
    const { negotiationId } = useParams();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const isBuyer = user?.role?.toLowerCase() === "buyer";
    const [confirming, setConfirming] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNegotiation = async () => {
            try {
                const data = await negotiationService.getNegotiationById(negotiationId);
                if (!data) throw new Error("Negotiation not found");

                setOrderData({
                    cropName: data.cropName,
                    agreedPrice: data.price,
                    agreedQuantity: data.quantity,
                    totalAmount: data.price * data.quantity,
                    farmer: {
                        name: data.farmerName || "Farmer",
                        location: "Modakurichi, Tamil Nadu",
                        phone: "+91 98765 43210"
                    },
                    buyer: {
                        name: data.buyerName || "Buyer",
                        location: "New Delhi, India",
                        phone: "+91 88888 77777"
                    },
                    deliveryEstimate: "3-5 Business Days",
                    paymentMethod: "Escrow Payment (Secured)"
                });
            } catch (err) {
                console.error("Failed to load negotiation", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNegotiation();
    }, [negotiationId]);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const newOrder = await orderService.createOrder(negotiationId);
            alert("Order Confirmed Successfully!");
            navigate(`/dashboard/orders/${newOrder.id}`);
        } catch (err) {
            console.error("Order creation failed", err);
            alert("Failed to create order: " + (err.response?.data?.message || err.message));
        } finally {
            setConfirming(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-accent">Loading Order Details...</div>;
    if (!orderData) return <div className="p-12 text-center text-accent font-bold">Order Details Not Found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-accent hover:text-primary font-bold transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                BACK TO NEGOTIATION
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                    <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-black text-text-dark tracking-tight">Verify Order</h1>
                <p className="text-secondary font-bold uppercase tracking-widest text-xs">Awaiting Confirmation • Ref: {negotiationId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items Card */}
                    <div className="bg-white rounded-[2.5rem] border-2 border-neutral-light overflow-hidden shadow-sm">
                        <div className="bg-neutral-light/50 px-8 py-4 border-b-2 border-neutral-light">
                            <h2 className="text-sm font-black text-secondary uppercase tracking-wider flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> TRANSACTION DETAILS
                            </h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-text-dark">{orderData.cropName}</h3>
                                    <p className="text-accent font-medium mt-1">Premium Quality Export Grade</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-primary">₹{orderData.totalAmount.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1">Total Amount</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-6 bg-neutral-light/30 rounded-3xl border-2 border-neutral-light/50">
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Agreed Price</p>
                                    <p className="text-lg font-bold text-text-dark">₹{orderData.agreedPrice} <span className="text-sm font-medium text-accent">/kg</span></p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Total Quantity</p>
                                    <p className="text-lg font-bold text-text-dark">{orderData.agreedQuantity} <span className="text-sm font-medium text-accent">kg</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Farmer Info */}
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-neutral-light shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-text-dark text-sm uppercase tracking-wider">Farmer</h3>
                                </div>
                                <CheckCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-text-dark">{orderData.farmer.name}</p>
                                <p className="text-sm text-accent font-medium">{orderData.farmer.location}</p>
                                <p className="text-xs text-primary font-bold mt-2">{orderData.farmer.phone}</p>
                            </div>
                        </div>

                        {/* Buyer Info */}
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-neutral-light shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-text-dark text-sm uppercase tracking-wider">Buyer</h3>
                                </div>
                                <CheckCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-text-dark">{orderData.buyer.name}</p>
                                <p className="text-sm text-accent font-medium">{orderData.buyer.location}</p>
                                <p className="text-xs text-primary font-bold mt-2">{orderData.buyer.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary & Action */}
                <div className="space-y-6">
                    <div className="bg-primary-dark text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 space-y-6 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />

                        <h2 className="text-xl font-black tracking-tight">Order Finalization</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/60 text-sm font-bold">Subtotal</span>
                                <span className="font-bold">₹{orderData.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/60 text-sm font-bold">Logistics</span>
                                <span className="font-bold text-primary-light">To be calculated</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-black tracking-wider uppercase text-xs text-white/60">Estimated Total</span>
                                <span className="text-3xl font-black">₹{orderData.totalAmount}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                                <Truck className="w-4 h-4" /> Delivery: {orderData.deliveryEstimate}
                            </div>
                            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                                <Info className="w-4 h-4" /> {orderData.paymentMethod}
                            </div>
                        </div>

                        {isBuyer ? (
                            <button
                                onClick={handleConfirm}
                                disabled={confirming}
                                className={`w-full py-4 rounded-2xl font-black tracking-widest uppercase transition-all shadow-lg ${confirming
                                    ? "bg-white/20 text-white animate-pulse"
                                    : "bg-white text-primary-dark hover:bg-neutral-light hover:-translate-y-1 active:scale-95"
                                    }`}
                            >
                                {confirming ? "PROCESSING..." : "CONFIRM ORDER"}
                            </button>
                        ) : (
                            <div className="bg-white/10 p-4 rounded-xl text-center">
                                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                                    Awaiting Buyer Confirmation
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-100 flex gap-3 text-orange-800">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-xs font-bold leading-relaxed">
                            By clicking confirm, you agree to the terms of the transaction. Funds will be held in escrow until delivery is confirmed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
