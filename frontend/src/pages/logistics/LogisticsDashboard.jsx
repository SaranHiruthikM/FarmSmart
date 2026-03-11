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
    CalendarClock,
    TrendingUp
} from "lucide-react";
import {  AnimatePresence, motion } from "framer-motion";
import orderService from "../../services/order.service";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


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

    const [revenueData, setRevenueData] = useState({
        labels: [],
        datasets: []
    });
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (myDeliveries.length > 0) {
            calculateRevenue();
        }
    }, [myDeliveries]);

    const calculateRevenue = () => {
        const deliveredOrders = myDeliveries.filter(order => order.status === 'DELIVERED');
        const revenueByDate = {};
        let total = 0;

        deliveredOrders.forEach(order => {
            const date = new Date(order.date).toLocaleDateString();
            const revenue = (Number(order.totalPrice) || 0) * 0.10;
            total += revenue;
            revenueByDate[date] = (revenueByDate[date] || 0) + revenue;
        });

        setTotalRevenue(total);

        const labels = Object.keys(revenueByDate);
        const data = Object.values(revenueByDate);

        setRevenueData({
            labels,
            datasets: [
                {
                    label: 'Revenue (10% Commission)',
                    data,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)', 
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 8,
                },
            ],
        });
    };


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

    // Renamed handleAcceptOrder to openAcceptModal, now it just opens modal
    const openAcceptModal = (order) => {
        setShowEditModal({ ...order, isAccepting: true });
        setDetailsForm({
            driverName: "",
            vehicleNumber: "",
            contactNumber: "",
            estimatedDelivery: ""
        });
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!showEditModal) return;

        setActionLoading(showEditModal.id);
        const orderId = showEditModal.id;
        const isAccepting = showEditModal.isAccepting;

        try {
            if (isAccepting) {
                 // Accept Flow
                 await orderService.acceptOrder(orderId);
                 // Then update details
                 await orderService.updateLogisticsDetails(orderId, detailsForm);
                 
                 setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
                 alert("Order accepted and details submitted!");
            } else {
                 // Update Flow
                 await orderService.updateLogisticsDetails(orderId, detailsForm);
                 alert("Delivery details updated!");
                 fetchData();
            }
            setShowEditModal(null);
        } catch (error) {
            console.error(error);
            alert("Failed to process request");
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
        setShowEditModal({ ...order, isAccepting: false });
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
                    <button
                        onClick={() => setActiveTab("revenue")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "revenue" ? "bg-white text-primary shadow-sm" : "text-accent hover:text-text-dark"}`}
                    >
                        Revenue
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
                                        onClick={() => openAcceptModal(order)}
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
                    ) : activeTab === "revenue" ? (
                         <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm">
                             <div className="flex items-center gap-4 mb-8">
                                 <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                                     <TrendingUp className="w-8 h-8" />
                                 </div>
                                 <div>
                                     <h2 className="text-2xl font-black text-text-dark">Total Revenue</h2>
                                     <p className="text-3xl font-black text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
                                     <p className="text-sm font-bold text-accent">10% commission on completed deliveries</p>
                                 </div>
                             </div>
                             
                             {revenueData.labels && revenueData.labels.length > 0 && revenueData.datasets && revenueData.datasets.length > 0 ? (
                                <div className="h-96 w-full">
                                     <Bar 
                                         data={{
                                             labels: revenueData.labels,
                                             datasets: [{
                                                 label: "Revenue (₹)",
                                                 data: revenueData.datasets[0].data,
                                                 backgroundColor: "rgba(16, 185, 129, 0.8)",
                                                 borderRadius: 8,
                                             }]
                                         }}
                                         options={{
                                             responsive: true,
                                             maintainAspectRatio: false,
                                             plugins: {
                                                 legend: { display: false },
                                                 title: { display: false }
                                             },
                                             scales: {
                                                 y: {
                                                     beginAtZero: true,
                                                     grid: { color: "#f3f4f6" },
                                                     ticks: { font: { weight: "bold" } }
                                                 },
                                                 x: {
                                                     grid: { display: false },
                                                     ticks: { font: { weight: "bold" } }
                                                 }
                                             }
                                         }} 
                                     />
                                </div>
                             ) : (
                                 <div className="py-20 text-center border-4 border-dashed border-neutral-light rounded-3xl bg-neutral-light/20">
                                     <p className="text-accent font-bold">No revenue data available yet.</p>
                                 </div>
                             )}
                         </div>
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
                                    <h2 className="text-2xl font-black text-text-dark tracking-tight">
                                        {showEditModal?.isAccepting ? "Accept Order & Assign Details" : "Delivery Details"}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(null)}
                                    className="p-2 hover:bg-neutral-light rounded-xl transition-colors text-accent"
                                >
                                    <AlertCircle className="rotate-45 w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleModalSubmit} className="p-8 space-y-5">
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
                                        {actionLoading === showEditModal.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            showEditModal.isAccepting ? "CONFIRM & ACCEPT" : "SAVE DETAILS"
                                        )}
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
