import React, { useState, useEffect } from "react"; // Added hooks
import { Link } from "react-router-dom";
import { Receipt, Search, Filter, ChevronRight, Package, Calendar, Tag } from "lucide-react";
import authService from "../../services/auth.service";
import orderService from "../../services/order.service"; // Changed to real service

const OrderHistory = () => {
    const user = authService.getCurrentUser();
    const isFarmer = user?.role?.toLowerCase() === "farmer";

    // Replaced static mock with state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        // Handle case variant (backend is UPPERCASE)
        const s = status?.toUpperCase();
        switch (s) {
            case "CREATED": return "bg-blue-50 text-blue-600 border-blue-100";
            case "CONFIRMED": return "bg-orange-50 text-orange-600 border-orange-100";
            case "SHIPPED": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "DELIVERED": return "bg-green-50 text-green-600 border-green-100";
            case "COMPLETED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Receipt className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-text-dark tracking-tight">Order History</h1>
                    </div>
                    <p className="text-[#5C715E] font-medium">
                        {isFarmer ? "Manage and track sales of your crops." : "View and track your previous crop purchases."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-11 pr-4 py-3 bg-white border-2 border-neutral-light rounded-2xl focus:border-primary/30 outline-none w-full md:w-64 transition-all font-medium text-sm"
                        />
                    </div>
                    <button className="p-3.5 bg-white border-2 border-neutral-light rounded-2xl text-secondary hover:border-primary/50 hover:text-primary transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="grid gap-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-neutral-light/50">
                        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-text-dark">No Orders Found</h3>
                        <p className="text-accent mt-2 max-w-md mx-auto">Start trading on the marketplace to see your orders here.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                    <Link
                        key={order.id}
                        to={`/dashboard/orders/${order.id}`}
                        className="group bg-white p-5 rounded-3xl border-2 border-neutral-light hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Crop Image & Basic Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-light shrink-0 border-2 border-neutral-light group-hover:border-primary/20 transition-colors flex items-center justify-center text-2xl">
                                    {/* Valid image or Fallback emoji */}
                                     🌾
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-dark group-hover:text-primary transition-colors">{order.crop}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">{order.id.slice(0, 8)}</span>
                                        <span className="w-1 h-1 bg-accent/30 rounded-full" />
                                        <div className="flex items-center gap-1.5 text-accent text-sm font-medium">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-8 lg:gap-12 lg:px-6">
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5">Quantity</p>
                                    <div className="flex items-center gap-2 text-text-dark font-bold">
                                        <Package className="w-4 h-4 text-primary-light" />
                                        {order.quantity}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5">Total Amount</p>
                                    <div className="flex items-center gap-2 text-primary font-black text-lg">
                                        <Tag className="w-4 h-4" />
                                        {/* Format currency if needed */}
                                        ₹{order.totalPrice}
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5">Status</p>
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border-2 ${getStatusColor(order.status)} uppercase tracking-wider`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="lg:ml-auto">
                                <div className="p-3 rounded-2xl bg-neutral-light group-hover:bg-primary/10 group-hover:text-primary text-secondary transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </Link>
                )))}
            </div>

            {/* Empty State Illustration Placeholder */}
            {orders.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border-4 border-dashed border-neutral-light">
                    <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-6">
                        <Receipt className="w-10 h-10 text-accent opacity-20" />
                    </div>
                    <h3 className="text-xl font-black text-text-dark mb-2">No orders found</h3>
                    <p className="text-accent font-medium">You haven't made any transactions yet.</p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
