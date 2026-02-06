import React, { useState } from "react";
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
import mockOrderService from "../../services/order.mock";

const OrderStatus = () => {
    const { orderId } = useParams();
    const user = authService.getCurrentUser();
    const isFarmer = user?.role?.toLowerCase() === "farmer";

    // Load order from mock service
    const orderFromStore = mockOrderService.getOrderById(orderId) || mockOrderService.getAllOrders()[0];

    // Status mapping for the timeline
    const statuses = [
        { id: "Created", label: "Created", icon: Package, description: "Order has been placed and is awaiting confirmation." },
        { id: "Confirmed", label: "Confirmed", icon: ShieldCheck, description: "Farmer has confirmed the order and is preparing for shipment." },
        { id: "Shipped", label: "Shipped", icon: Truck, description: "Crop is in transit to the delivery location." },
        { id: "Delivered", label: "Delivered", icon: MapPin, description: "Order has reached the destination." },
        { id: "Completed", label: "Completed", icon: CheckCircle2, description: "Transaction is finalized and funds released." }
    ];

    const [currentStatus, setCurrentStatus] = useState(orderFromStore.status);

    const currentStatusIndex = statuses.findIndex(s => s.id === currentStatus);

    // Mock Data (Extending with stored data)
    const orderDetails = {
        crop: orderFromStore.crop,
        quantity: orderFromStore.quantity,
        total: orderFromStore.totalPrice,
        orderDate: orderFromStore.date,
        expectedDelivery: "Feb 10, 2024",
        trackingId: "FS-TRK-99281",
        buyer: "Ankit Singh",
        farmer: "Suresh Kumar",
        address: "Block C-4, Warehouse 12, Azadpur Mandi, Delhi - 110033"
    };

    const handleUpdateStatus = (statusId) => {
        if (!isFarmer) {
            alert("Only Farmers can update order status.");
            return;
        }
        setCurrentStatus(statusId);
        mockOrderService.updateOrderStatus(orderId, statusId);
        alert(`Order status updated to ${statusId}`);
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
                    <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border-2 ${currentStatus === "Completed" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-primary/10 border-primary/20 text-primary"
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
                                    {orderDetails.address}
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
        </div>
    );
};

export default OrderStatus;
