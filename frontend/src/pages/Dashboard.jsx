import React from "react";
import { TrendingUp, Users, DollarSign, ShoppingBag } from "lucide-react";
import authService from "../services/auth.service";

const Dashboard = () => {
  const user = authService.getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || "Farmer";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#1a1f1b]">Dashboard</h1>
        <p className="text-[#5C715E] mt-1">Welcome back, {firstName}! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Crops" value="12" change="+2.5%" icon={ShoppingBag} />
        <StatCard title="Total Revenue" value="₹45,231" change="+12%" icon={DollarSign} />
        <StatCard title="Active Bids" value="5" change="-1" icon={Users} />
        <StatCard title="Market Trends" value="+15%" change="High" icon={TrendingUp} />
      </div>

      {/* Placeholder for Charts/Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex items-center justify-center text-gray-400">
          Chart Placeholder
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex items-center justify-center text-gray-400">
          Recent Activity Placeholder
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-green-50 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-green-50 rounded-xl">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{change}</span>
    </div>
    <h3 className="text-3xl font-bold text-[#1a1f1b]">{value}</h3>
    <p className="text-sm text-[#5C715E] font-medium mt-1">{title}</p>
  </div>
);

export default Dashboard;
