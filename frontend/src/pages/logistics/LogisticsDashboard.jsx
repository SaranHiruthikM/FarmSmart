import React, { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, ChevronRight, User, Phone, MapPin, Clock, Edit } from "lucide-react";
import orderService from "../../services/order.service";

const LogisticsDashboard = () => {
    const [activeTab, setActiveTab] = useState("available"); // "available" or "my"
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State for Update Info
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [driverName, setDriverName] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === "available") {
                const data = await orderService.getAvailableOrders();
                setOrders(data);
            } else {
                const data = await orderService.getMyOrders();
                setOrders(data);
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to load ${activeTab} orders.`);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (id) => {
        try {
            await orderService.acceptOrder(id);
            // Remove from available list or force refresh
            setOrders((prev) => prev.filter((o) => o.id !== id));
            alert("Order accepted successfully! You can find it in 'My Deliveries'.");
        } catch (err) {
            alert("Failed to accept order: " + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await orderService.updateOrderStatus(id, status);
            fetchOrders(); // refresh current list
        } catch (err) {
            alert("Failed to update status: " + (err.response?.data?.message || err.message));
        }
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setDriverName(order.logisticsDetails?.driverName || "");
        setVehicleNumber(order.logisticsDetails?.vehicleNumber || "");
        setContactNumber(order.logisticsDetails?.contactNumber || "");
        setEstimatedDelivery(order.logisticsDetails?.estimatedDelivery || "");
        setIsUpdateModalOpen(true);
    };

    const handleUpdateLogistics = async (e) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setIsSubmitting(true);
        try {
            await orderService.updateLogistics(selectedOrder.id, {
                driverName,
                vehicleNumber,
                contactNumber,
                estimatedDelivery
            });
            fetchOrders();
            setIsUpdateModalOpen(false);
            alert("Delivery details updated successfully.");
        } catch (err) {
            alert("Failed to update details: " + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Logistics Dashboard</h1>
                <p className="text-[#5C715E] font-medium mt-1">Manage new delivery requests and your active fleet operations.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab("available")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "available"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    <Package className="w-4 h-4" /> Available Orders
                </button>
                <button
                    onClick={() => setActiveTab("my")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "my"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    <Truck className="w-4 h-4" /> My Deliveries
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                        <Truck className="w-12 h-12 mb-4 animate-pulse duration-1000" />
                        <p className="font-medium text-lg tracking-tight">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="p-10 text-center text-red-500 font-medium">
                        Error: {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                        <CheckCircle className="w-16 h-16 mb-4 text-green-100" />
                        <p className="font-bold text-xl text-gray-600 tracking-tight">All Caught Up!</p>
                        <p className="font-medium mt-2">No {activeTab === "available" ? "new orders available for pickup" : "active deliveries in your queue"}.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {orders.map((order) => (
                            <div key={order.id} className="p-6 md:p-8 hover:bg-green-50/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">

                                {/* Left Side: Order Core Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="bg-green-100 p-4 rounded-2xl text-primary mt-1 shrink-0">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black tracking-tight text-xl text-gray-900">{order.crop}</h3>
                                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 uppercase tracking-widest">
                                                {order.quantity}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === "CREATED" ? "bg-amber-100 text-amber-700" :
                                                order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                                                    order.status === "SHIPPED" ? "bg-purple-100 text-purple-700" :
                                                        "bg-green-100 text-green-700"
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Route Details */}
                                        <div className="flex flex-col gap-2 pt-3 text-sm text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                                                <span className="truncate max-w-[200px] md:max-w-md">Pickup: {order.farmerName} (Farmer)</span>
                                            </div>
                                            <div className="flex items-center gap-2 pl-1 py-1">
                                                <div className="w-1 h-3 border-l-2 border-dashed border-gray-300 ml-1.5" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                                                <span className="truncate max-w-[200px] md:max-w-md">Drop: {order.shippingAddress} ({order.buyerName})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Actions based on Tab */}
                                <div className="flex flex-col gap-3 md:items-end w-full md:w-auto shrink-0">
                                    {activeTab === "available" ? (
                                        <button
                                            onClick={() => handleAcceptOrder(order.id)}
                                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:translate-x-1 duration-200"
                                        >
                                            Accept Route <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="space-y-3 w-full md:w-64">
                                            {/* My Deliveries Actions */}
                                            <div className="border border-gray-200 bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 pl-1">Status Control</div>
                                                {order.status !== "SHIPPED" && order.status !== "DELIVERED" && order.status !== "COMPLETED" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                                                        className="bg-white border-2 border-purple-100 text-purple-600 hover:bg-purple-50 hover:border-purple-200 w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <Truck className="w-3.5 h-3.5" /> Mark Shipped
                                                    </button>
                                                )}
                                                {order.status === "SHIPPED" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                                                        className="bg-green-500 text-white w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20 flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" /> Confirm Delivery
                                                    </button>
                                                )}
                                                {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                                                    <div className="bg-gray-200/50 text-gray-500 w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide text-center">
                                                        Delivery Completed
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => openUpdateModal(order)}
                                                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit className="w-4 h-4 text-gray-400" /> Edit Fleet Details
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 font-medium md:text-right w-full">Order ID: {order.id.slice(-6)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Info Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Fleet Information</h3>
                                <p className="text-[#5C715E] text-sm font-medium mt-1">Order #{selectedOrder?.id.slice(-6)}</p>
                            </div>
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                type="button"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpdateLogistics} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Driver Name</label>
                                <div className="relative">
                                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Vehicle Details</label>
                                <div className="relative">
                                    <Truck className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        value={vehicleNumber}
                                        onChange={(e) => setVehicleNumber(e.target.value)}
                                        placeholder="TN-01-XX-1234 (Tata Ace)"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Contact Number</label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="tel"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Est. Delivery Date</label>
                                <div className="relative">
                                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="date"
                                        value={estimatedDelivery ? estimatedDelivery.split("T")[0] : ""}
                                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="w-1/3 py-3.5 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold uppercase tracking-wide hover:bg-green-600 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Details"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticsDashboard;
