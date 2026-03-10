import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, ChevronRight, LogOut, MessageSquare, Gavel, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import LanguageSelector from "../common/LanguageSelector";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
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
        <div className="flex items-center justify-end px-0 shrink-0 relative z-20 gap-4">

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block group">
                    <input
                        type="text"

                        className="pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-glass hover:bg-white/80 placeholder-nature-400 text-nature-800"

                        placeholder={t('common.search')}
                    />
                    <Search className="w-4 h-4 text-nature-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Language Switcher */}
                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm px-2">
                    <LanguageSelector />
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-3 rounded-2xl transition-all border border-transparent ${showNotifications 
                            ? "bg-nature-100 text-nature-700 shadow-inner" 
                            : "bg-white/60 backdrop-blur-md border-white/50 text-nature-600 shadow-sm hover:shadow-glass hover:bg-white/80"}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-400 rounded-full ring-2 ring-white"></span>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-4 w-96 glass-panel rounded-2xl overflow-hidden origin-top-right !p-0 z-50"
                            >

                                <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-white/50">
                                    <h3 className="font-bold text-nature-900">Notifications</h3>
                                </div>
                                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                                    <NotificationItem icon={MessageSquare} title={t('common.newMessage')} isNew />
                                    <NotificationItem icon={Gavel} title={t('common.auctionUpdate')} isNew={false} />
                                    <NotificationItem icon={AlertCircle} title={t('common.negotiationAlert')} isNew={false} warning/>
                                </div>
                                <div className="p-3 bg-nature-50/50 backdrop-blur-sm border-t border-white/50 text-center">
                                    <button onClick={() => navigate("/dashboard/notifications")} className="text-xs font-bold text-nature-600 hover:text-nature-800 uppercase tracking-wide">{t('common.viewAll')}</button>

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
                        <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-glass-hover flex items-center justify-center overflow-hidden transition-transform hover:scale-105 active:scale-95">
                            <img src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Farm User'}&background=16a34a&color=fff`} alt="User" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-4 w-72 glass-panel rounded-2xl overflow-hidden origin-top-right p-2 z-50"
                            >
                                <div className="p-4 border-b border-nature-200/50 mb-2">
                                    <h4 className="font-bold text-nature-900">{user?.fullName || "User"}</h4>
                                    <p className="text-xs text-nature-500 font-medium mt-0.5">{user?.phoneNumber || ""}</p>
                                </div>

                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            navigate("/dashboard/profile");
                                            setShowProfile(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/60 hover:shadow-sm text-nature-700 hover:text-nature-900 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-nature-100/50 rounded-lg group-hover:bg-nature-200/50 transition-colors text-nature-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold">{t('nav.profile')}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-nature-300" />
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50/60 hover:shadow-sm text-nature-600 hover:text-red-600 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-nature-100/50 rounded-lg group-hover:bg-red-100/50 transition-colors text-nature-600 group-hover:text-red-500">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold">{t('nav.logout')}</span>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const NotificationItem = ({ icon: Icon, title, isNew, warning }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer group border border-transparent hover:border-white/50 ${isNew ? "bg-nature-50/50" : ""}`}>
        <div className={`p-2 rounded-full ${warning ? "bg-red-100 text-red-500" : (isNew ? "bg-nature-100 text-nature-600" : "bg-slate-100 text-slate-400")}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
            <span className={`text-sm font-medium display-block ${isNew ? "text-nature-900 font-bold" : "text-nature-700"}`}>{title}</span>
            {isNew && <p className="text-[10px] text-nature-500 uppercase tracking-wider font-bold mt-0.5">New</p>}
        </div>
        {isNew && <span className="w-2 h-2 bg-nature-500 rounded-full shadow-sm shadow-nature-500/50"></span>}
    </div>
);


export default Header;
