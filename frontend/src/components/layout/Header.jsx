import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, ChevronRight, LogOut, MessageSquare, Gavel, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    // Close on click outside
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    return (
        <header className="h-20 bg-[#FAF9F6] border-b border-[#EAEAEA] flex items-center justify-between px-8 shrink-0 relative bg-opacity-80 backdrop-blur-sm z-20">

            {/* Title / Context (Optional, can be dynamic) */}
            <h2 className="text-2xl font-bold text-[#2D362E]">Dashboard</h2>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm group-hover:shadow-md"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-full transition-colors ${showNotifications ? "bg-green-100 text-primary" : "text-[#5C715E] hover:bg-green-50"}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-80 bg-[#FAF9F6] rounded-2xl shadow-xl border border-[#EAEAEA] overflow-hidden origin-top-right"
                            >
                                <div className="p-4 space-y-3">
                                    <NotificationItem icon={MessageSquare} title="New Message" isNew />
                                    <NotificationItem icon={Gavel} title="Auction Update" isNew={false} />
                                    <NotificationItem icon={Gavel} title="Auction Update" isNew={false} />
                                    <NotificationItem icon={AlertCircle} title="Negotiation alert" isNew={false} />
                                </div>
                                <div className="px-4 py-3 bg-white/50 border-t border-[#EAEAEA] text-right">
                                    <button onClick={() => navigate("/dashboard/notifications")} className="text-xs font-semibold text-primary hover:text-primary-dark">View all</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 focus:outline-none"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                            {/* Placeholder Avatar - could be dynamic too if user has image */}
                            <img src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Farm User'}&background=166534&color=fff`} alt="User" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-72 bg-[#FAF9F6] rounded-2xl shadow-xl border border-[#EAEAEA] overflow-hidden origin-top-right p-2"
                            >
                                <div className="p-4 border-b border-[#EAEAEA]/60 mb-2">
                                    <h4 className="font-bold text-[#2D362E]">{user?.fullName || "User"}</h4>
                                    <p className="text-xs text-[#8CA38D] font-medium mt-0.5">{user?.phoneNumber || ""}</p>
                                </div>

                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            navigate("/dashboard/profile");
                                            setShowProfile(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm text-[#5C715E] hover:text-primary transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-green-100/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold">Profile</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#C0C0C0]" />
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm text-[#5C715E] hover:text-red-600 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-green-100/50 rounded-lg group-hover:bg-red-50 transition-colors">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold">Logout</span>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

const NotificationItem = ({ icon: Icon, title, isNew }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer group">
        <Icon className={`w-4 h-4 ${isNew ? "text-primary" : "text-[#8CA38D]"}`} />
        <span className={`text-sm font-medium ${isNew ? "text-[#2D362E]" : "text-[#5C715E]"}`}>{title}</span>
        {isNew && <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"></span>}
    </div>
);

export default Header;
