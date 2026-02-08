import React, { useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2 } from "lucide-react";
import authService from "../services/auth.service";
import negotiationService from "../services/negotiation.service";
import salesService from "../services/sales.service";
import cropService from "../services/crop.service";

const Dashboard = () => {
  const user = authService.getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || "Farmer";
  const isFarmer = user?.role?.toLowerCase() === "farmer";

  const [stats, setStats] = useState({
    totalCrops: 0,
    totalRevenue: 0,
    activeBids: 0,
    marketTrends: "+15%" // Placeholder for now as per requirements only focused on Bids, Revenue, Crops
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel data fetching for performance
      const promises = [
        negotiationService.getMyNegotiations(),
      ];

      if (isFarmer) {
        promises.push(salesService.getSalesHistory());
        promises.push(cropService.getMyCrops());
      }

      const results = await Promise.all(promises);

      const negotiations = results[0] || [];
      // Active Bids: Negotiations that are PENDING or have active counter offers
      // Filter out those that are strictly REJECTED or ACCEPTED and old
      const activeBidsCount = negotiations.filter(n =>
        n.status === 'pending' || n.status === 'counter_offer' ||
        (n.status !== 'accepted' && n.status !== 'rejected')
      ).length;

      let revenue = 0;
      let cropsCount = 0;

      if (isFarmer) {
        const sales = results[1] || [];
        const salesStats = salesService.getSalesStats(sales);
        revenue = salesStats.totalRevenue;

        const crops = results[2] || [];
        cropsCount = crops.length;
      }

      setStats(prev => ({
        ...prev,
        activeBids: activeBidsCount,
        totalRevenue: revenue,
        totalCrops: cropsCount
      }));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#1a1f1b]">Dashboard</h1>
        <p className="text-[#5C715E] mt-1">Welcome back, {firstName}! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isFarmer && (
          <>
            <StatCard
              title="Total Crops"
              value={stats.totalCrops}
              change="Posted"
              icon={ShoppingBag}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              change="Earned"
              icon={DollarSign}
              color="bg-green-50 text-green-600"
            />
          </>
        )}
        <StatCard
          title="Active Bids"
          value={stats.activeBids}
          change="Ongoing"
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Market Trends"
          value={stats.marketTrends}
          change="High Demand"
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Placeholder for Charts/Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex items-center justify-center text-gray-400">
          {/* Future: Revenue Chart */}
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-2" />
            <p>Revenue Analytics (Coming Soon)</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex items-center justify-center text-gray-400">
          {/* Future: Recent Activity List */}
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-2" />
            <p>Recent Activity (Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-green-50 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color || 'bg-gray-50 text-gray-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">{change}</span>
    </div>
    <h3 className="text-3xl font-bold text-[#1a1f1b]">{value}</h3>
    <p className="text-sm text-[#5C715E] font-medium mt-1">{title}</p>
  </div>
);

export default Dashboard;
