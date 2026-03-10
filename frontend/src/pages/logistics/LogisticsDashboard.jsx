import { useState, useEffect } from "react";
import {
    Truck,
    Package,
    MapPin,
    Navigation,
    User,
    Phone,
    Calendar,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Info,
    Search,
    Filter,
    ArrowRight,
    Loader2,
    CalendarClock
} from "lucide-react";
import {  AnimatePresence } from "framer-motion";
import orderService from "../../services/order.service";

const LogisticsDashboard = () => {
    const [activeTab, setActiveTab] = useState("marketplace");
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showEditModal, setShowEditModal] = useState(null);
    const [detailsForm, setDetailsForm] = useState({
        driverName: "",
        vehicleNumber: "",
        contactNumber: "",
        estimatedDelivery: ""
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "marketplace") {
                const data = await orderService.getAvailableOrders();
                setAvailableOrders(data);
            } else {
                const data = await orderService.getMyOrders();
                setMyDeliveries(data);
            }
        } catch (error) {
            console.error("Failed to fetch logistics data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        setActionLoading(orderId);
        try {
            await orderService.acceptOrder(orderId);
            setAvailableOrders(availableOrders.filter(o => o.id !== orderId));
            alert("Order accepted successfully!");
        } catch (error) {
            console.log(error)
            alert("Failed to accept order");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        if (!showEditModal) return;

        setActionLoading(showEditModal.id);
        try {
            await orderService.updateLogisticsDetails(showEditModal.id, detailsForm);
            alert("Delivery details updated!");
            setShowEditModal(null);
            fetchData();
        } catch (error) {
            console.log(error)
            alert("Failed to update details");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        setActionLoading(orderId + status);
        try {
            await orderService.updateOrderStatus(orderId, status);
            fetchData();
        } catch (error) {
            console.log(error)
            alert("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (order) => {
        setShowEditModal(order);
        setDetailsForm({
            driverName: order.logisticsDetails?.driverName || "",
            vehicleNumber: order.logisticsDetails?.vehicleNumber || "",
            contactNumber: order.logisticsDetails?.contactNumber || "",
            estimatedDelivery: order.logisticsDetails?.estimatedDelivery ? new Date(order.logisticsDetails.estimatedDelivery).toISOString().split('T')[0] : ""
        });
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-text-dark tracking-tight">Logistics Hub</h1>
                    </div>
                    <p className="text-[#5C715E] font-medium">Manage deliveries and find new service opportunities.</p>
                </div>

                <div className="flex p-1.5 bg-neutral-light rounded-[1.25rem] border-2 border-neutral-light w-fit">
                    <button
                        onClick={() => setActiveTab("marketplace")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "marketplace" ? "bg-white text-primary shadow-sm" : "text-accent hover:text-text-dark"}`}
                    >
                        Marketplace
                    </button>
                    <button
                        onClick={() => setActiveTab("deliveries")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "deliveries" ? "bg-white text-primary shadow-sm" : "text-accent hover:text-text-dark"}`}
                    >
                        My Deliveries
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-accent font-bold animate-pulse">Fetching your orders...</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {activeTab === "marketplace" ? (
                        availableOrders.length > 0 ? (
                            availableOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    variants={itemVariants}
                                    className="bg-white rounded-4xl border-2 border-neutral-light p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-text-dark">{order.crop}</h3>
                                                <p className="text-xs font-bold text-accent">QTY: {order.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">ORDER ID</p>
                                            <p className="text-xs font-bold text-text-dark">{order.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="relative pl-7">
                                            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-neutral-light border-dashed border-l-2 border-accent/20" />
                                            <div className="space-y-6">
                                                <div className="relative">
                                                    <MapPin className="w-4 h-4 text-primary absolute -left-7 top-0.5" />
                                                    <p className="text-[10px] font-black text-accent uppercase tracking-tighter mb-1">Pickup</p>
                                                    <p className="text-sm font-bold text-text-dark leading-tight">{order.farmerAddress}</p>
                                                    <p className="text-xs text-accent mt-1">From: {order.farmerName}</p>
                                                </div>
                                                <div className="relative">
                                                    <Navigation className="w-4 h-4 text-emerald-500 absolute -left-7 top-0.5" />
                                                    <p className="text-[10px] font-black text-accent uppercase tracking-tighter mb-1">Drop-off</p>
                                                    <p className="text-sm font-bold text-text-dark leading-tight">{order.buyerAddress}</p>
                                                    <p className="text-xs text-accent mt-1">To: {order.buyerName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAcceptOrder(order.id)}
                                        disabled={actionLoading === order.id}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-green-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group/btn"
                                    >
                                        {actionLoading === order.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                ACCEPT ORDER <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-4 border-dashed border-neutral-light">
                                <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="w-10 h-10 text-accent opacity-20" />
                                </div>
                                <h3 className="text-xl font-black text-text-dark mb-2">No Service Requests</h3>
                                <p className="text-accent font-medium">Check back later for new delivery opportunities.</p>
                            </div>
                        )
                    ) : (
                        myDeliveries.length > 0 ? (
                            myDeliveries.map((order) => (
                                <motion.div
                                    key={order.id}
                                    variants={itemVariants}
                                    className="bg-white rounded-4xl border-2 border-neutral-light p-6 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                order.status === "SHIPPED" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                    "bg-orange-50 text-orange-600 border-orange-100"
                                            }`}>
                                            {order.status}
                                        </span>
                                        <button
                                            onClick={() => openEditModal(order)}
                                            className="p-2 hover:bg-neutral-light rounded-xl transition-colors text-accent hover:text-primary"
                                        >
                                            <Info className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-neutral-light rounded-2xl flex items-center justify-center text-text-dark">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-text-dark">{order.crop}</h3>
                                            <p className="text-xs font-bold text-accent">Order #{order.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-light/30 rounded-2xl border-2 border-neutral-light/50 mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-accent uppercase tracking-tighter mb-0.5">Driver</p>
                                            <p className="text-xs font-bold truncate">{order.logisticsDetails?.driverName || "Not set"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-accent uppercase tracking-tighter mb-0.5">Vehicle</p>
                                            <p className="text-xs font-bold truncate">{order.logisticsDetails?.vehicleNumber || "Not set"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {order.status === "CONFIRMED" && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                                                disabled={actionLoading === order.id + "SHIPPED"}
                                                className="w-full py-3.5 bg-text-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-2"
                                            >
                                                {actionLoading === order.id + "SHIPPED" ? <Loader2 className="w-4 h-4 animate-spin" /> : "MARK AS SHIPPED"}
                                            </button>
                                        )}
                                        {order.status === "SHIPPED" && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                                                disabled={actionLoading === order.id + "DELIVERED"}
                                                className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                            >
                                                {actionLoading === order.id + "DELIVERED" ? <Loader2 className="w-4 h-4 animate-spin" /> : "COMPLETE DELIVERY"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => window.open(`/dashboard/orders/${order.id}`, "_self")}
                                            className="w-full py-3.5 bg-neutral-light text-text-dark rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-neutral-light/70 transition-all"
                                        >
                                            VIEW DETAILS
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-4 border-dashed border-neutral-light">
                                <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Truck className="w-10 h-10 text-accent opacity-20" />
                                </div>
                                <h3 className="text-xl font-black text-text-dark mb-2">No Active Deliveries</h3>
                                <p className="text-accent font-medium">Head to the marketplace to accept new orders.</p>
                            </div>
                        )
                    )}
                </motion.div>
            )}

            {/* Edit Logistics Details Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-text-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b-2 border-neutral-light flex justify-between items-center bg-neutral-light/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-text-dark tracking-tight">Delivery Details</h2>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(null)}
                                    className="p-2 hover:bg-neutral-light rounded-xl transition-colors text-accent"
                                >
                                    <AlertCircle className="rotate-45 w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateDetails} className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">Driver Name</label>
                                        <div className="relative">
                                            <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                            <input
                                                required
                                                type="text"
                                                value={detailsForm.driverName}
                                                onChange={(e) => setDetailsForm({ ...detailsForm, driverName: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3.5 bg-neutral-light/50 border-2 border-transparent focus:border-primary rounded-2xl outline-none font-bold text-sm transition-all"
                                                placeholder="Enter name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">Vehicle No.</label>
                                        <div className="relative">
                                            <Navigation className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                            <input
                                                required
                                                type="text"
                                                value={detailsForm.vehicleNumber}
                                                onChange={(e) => setDetailsForm({ ...detailsForm, vehicleNumber: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3.5 bg-neutral-light/50 border-2 border-transparent focus:border-primary rounded-2xl outline-none font-bold text-sm transition-all"
                                                placeholder="TN 01 AB 1234"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                        <input
                                            required
                                            type="tel"
                                            value={detailsForm.contactNumber}
                                            onChange={(e) => setDetailsForm({ ...detailsForm, contactNumber: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-neutral-light/50 border-2 border-transparent focus:border-primary rounded-2xl outline-none font-bold text-sm transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">Estimated Delivery</label>
                                    <div className="relative">
                                        <CalendarClock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                                        <input
                                            required
                                            type="date"
                                            value={detailsForm.estimatedDelivery}
                                            onChange={(e) => setDetailsForm({ ...detailsForm, estimatedDelivery: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-neutral-light/50 border-2 border-transparent focus:border-primary rounded-2xl outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(null)}
                                        className="flex-1 py-4 bg-neutral-light text-accent rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-neutral-light/50 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading === showEditModal.id}
                                        className="flex-3 py-4 bg-primary text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-green-600 transition-all shadow-lg shadow-primary/20"
                                    >
                                        {actionLoading === showEditModal.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SAVE DETAILS"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LogisticsDashboard;
