import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Package,
    Truck,
    CheckCircle2,
    MapPin,
    Clock,
    ShieldCheck,
    ExternalLink,
    ChevronDown,
    CircleDashed,
    Box
} from "lucide-react";
import authService from "../../services/auth.service";
import orderService from "../../services/order.service";
import reviewService from "../../services/review.service";
import { Star } from "lucide-react";

const OrderStatus = () => {
    const { orderId } = useParams();
    const user = authService.getCurrentUser();
    const isFarmer = user?.role?.toLowerCase() === "farmer";

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState("CREATED");

    // Status mapping
    const statuses = [
        { id: "CREATED", label: "Created", icon: Package, description: "Order has been placed and is awaiting confirmation." },
        { id: "CONFIRMED", label: "Confirmed", icon: ShieldCheck, description: "Farmer has confirmed the order and is preparing for shipment." },
        { id: "SHIPPED", label: "Shipped", icon: Truck, description: "Crop is in transit to the delivery location." },
        { id: "DELIVERED", label: "Delivered", icon: MapPin, description: "Order has reached the destination." },
        { id: "COMPLETED", label: "Completed", icon: CheckCircle2, description: "Transaction is finalized and funds released." }
    ];

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await orderService.getOrderById(orderId);
                setOrder(data);
                setCurrentStatus(data.status?.toUpperCase() || "CREATED");
            } catch (error) {
                console.error("Failed to load order", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const currentStatusIndex = statuses.findIndex(s => s.id === currentStatus);

    if (loading || !order) return <div className="p-10 text-center text-accent">Loading...</div>;

    // Use fetched order data
    const orderDetails = {
        crop: order.crop,
        quantity: order.quantity,
        total: order.totalPrice,
        orderDate: order.date,
        id: order.id,
        deliveryAddress: order.shippingAddress || "Agri Market Yard, Erode, Tamil Nadu",
        farmerLocation: "Modakurichi, Tamil Nadu",
        expectedDelivery: "In Transit",
        trackingId: order.id,
        buyer: order.buyer || "Valued Customer",
        farmer: order.farmer || "Trusted Farmer",
    };


    const handleUpdateStatus = async (statusId) => {
        try {
            await orderService.updateOrderStatus(orderId, statusId);
            setCurrentStatus(statusId);
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            await reviewService.addReview({
                orderId: order.id,
                rating: reviewRating,
                comment: reviewComment
                // targetId is handled by backend based on order
            });
            setReviewSubmitted(true);
            alert("Review submitted successfully!");
        } catch (err) {
            alert("Failed to submit review: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest mb-2">
                        <Link to="/dashboard/orders" className="hover:text-primary transition-colors">Orders</Link>
                        <span>/</span>
                        <span className="text-primary">{orderId}</span>
                    </div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tight leading-none">Track Order</h1>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border-2 ${currentStatus === "COMPLETED" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                        {currentStatus}
                    </span>
                    {isFarmer && (
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-primary/20">
                                UPDATE STATUS <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-neutral-light rounded-2xl shadow-xl hidden group-hover:block z-10 overflow-hidden">
                                {statuses.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleUpdateStatus(s.id)}
                                        className="w-full text-left px-5 py-3 text-xs font-bold text-text-dark hover:bg-neutral-light hover:text-primary transition-colors border-b border-neutral-light last:border-0"
                                    >
                                        Mark as {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm">
                        <div className="flex items-center gap-3 mb-10">
                            <Clock className="w-6 h-6 text-accent" />
                            <h2 className="text-xl font-black text-text-dark tracking-tight italic">Order Timeline</h2>
                        </div>

                        <div className="relative pl-24 space-y-12">
                            {/* Vertical Line */}
                            <div className="absolute left-[2.45rem] top-2 bottom-2 w-1 bg-neutral-light" />
                            <div
                                className="absolute left-[2.45rem] top-2 w-1 bg-primary transition-all duration-1000"
                                style={{ height: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                            />

                            {statuses.map((status, index) => {
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const Icon = status.icon;

                                return (
                                    <div key={status.id} className="relative flex items-start gap-8 group">
                                        {/* Dot */}
                                        <div className={`absolute -left-[5.5rem] w-14 h-14 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-500 ${isCompleted
                                            ? "bg-primary border-white text-white shadow-lg shadow-primary/30"
                                            : "bg-white border-neutral-light text-accent"
                                            } ${isCurrent ? "scale-110" : ""}`}>
                                            <Icon className={`w-5 h-5 ${isCurrent ? "animate-pulse" : ""}`} />
                                        </div>

                                        <div className={`transition-all duration-500 ${isCompleted ? "opacity-100" : "opacity-40"}`}>
                                            <h3 className={`text-lg font-black ${isCompleted ? "text-text-dark" : "text-accent"}`}>
                                                {status.label}
                                                {isCurrent && <span className="ml-3 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Current</span>}
                                            </h3>
                                            <p className="text-sm font-medium text-accent mt-1 leading-relaxed max-w-md">
                                                {status.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> SHIPPING ADDRESS
                            </h3>
                            <div className="p-6 bg-neutral-light/30 rounded-3xl border-2 border-neutral-light/50">
                                <p className="font-bold text-text-dark leading-relaxed">
                                    {orderDetails.deliveryAddress}
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-64 space-y-4">
                            <h3 className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                <Box className="w-4 h-4" /> SHIPMENT DETAILS
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-tighter">Tracking Number</p>
                                    <p className="text-sm font-bold text-primary flex items-center gap-1">
                                        {orderDetails.trackingId} <ExternalLink className="w-3 h-3" />
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-accent uppercase tracking-tighter">Carrier</p>
                                        <p className="text-sm font-bold">SmartLogistics</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-accent uppercase tracking-tighter">Weight</p>
                                        <p className="text-sm font-bold">{orderDetails.quantity}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Order Information */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm space-y-8">
                        <h2 className="text-xl font-black text-text-dark tracking-tight italic">Order Details</h2>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-neutral-light rounded-2xl flex items-center justify-center text-primary">
                                    <Package className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-accent uppercase tracking-widest">Item</p>
                                    <h4 className="font-bold text-text-dark">{orderDetails.crop}</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 py-6 border-y-2 border-neutral-light/50">
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Quantity</p>
                                    <p className="font-bold">{orderDetails.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="font-black text-primary">{orderDetails.total}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-accent font-medium">Order Date</span>
                                    <span className="font-bold text-text-dark">{orderDetails.orderDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-accent font-medium">Expected Delivery</span>
                                    <span className="font-bold text-text-dark">{orderDetails.expectedDelivery}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-accent font-medium">{isFarmer ? "Buyer" : "Farmer"}</span>
                                    <span className="font-black text-primary">{isFarmer ? orderDetails.buyer : orderDetails.farmer}</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-neutral-light text-secondary rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-red-50 hover:text-secondary-light transition-all border-2 border-transparent hover:border-secondary-light/20">
                            NEED HELP? RAISE DISPUTE
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
                        <CircleDashed className="absolute top-0 right-0 w-32 h-32 text-white/5 -mr-12 -mt-12" />
                        <h3 className="text-lg font-black tracking-tight leading-snug">Secure Transaction Guarantee</h3>
                        <p className="text-xs text-white/70 font-medium leading-relaxed">
                            Your payment is held securely. It will be released to the farmer only after you confirm successful delivery and quality check.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <ShieldCheck className="w-5 h-5 text-primary-light" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified by FarmSmart</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Section - Only for Completed Orders */}
            {currentStatus === "COMPLETED" && !isFarmer && (
                <div className="mt-12 bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm max-w-2xl mx-auto">
                    {!reviewSubmitted ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Star className="w-6 h-6 text-primary fill-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-text-dark tracking-tight">Rate Your Experience</h2>
                            </div>

                            <p className="text-secondary font-medium">Your feedback helps us maintain a trusted community for farmers and buyers.</p>

                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className={`transition-all duration-200 ${reviewRating >= star ? "text-primary scale-110" : "text-neutral-light"}`}
                                        >
                                            <Star className={`w-8 h-8 ${reviewRating >= star ? "fill-primary" : ""}`} />
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-accent uppercase tracking-widest ml-1">Your Comment</label>
                                    <textarea
                                        required
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Tell us about the quality of the crop and the seller's service..."
                                        className="w-full p-6 bg-neutral-light/30 rounded-3xl border-2 border-neutral-light focus:border-primary outline-none transition-all min-h-[120px] font-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-green-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSubmittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-2 border-green-100">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-text-dark">Thank You for Your Review!</h3>
                            <p className="text-accent font-medium">Your feedback has been published on the seller's profile.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderStatus;
