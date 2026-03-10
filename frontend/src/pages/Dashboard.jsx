import React, { useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2, Truck, CheckCircle2 } from "lucide-react";
import authService from "../services/auth.service";
import negotiationService from "../services/negotiation.service";
import salesService from "../services/sales.service";
import cropService from "../services/crop.service";
import orderService from "../services/order.service";

const Dashboard = () => {
  const user = authService.getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || user?.role || "User";
  const isFarmer = user?.role?.toLowerCase() === "farmer";
  const isLogistics = user?.role?.toLowerCase() === "logistics";

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

      const role = user?.role?.toLowerCase();
      const isLogistics = role === "logistics";

      if (isLogistics) {
        const [myOrders, availableOrders] = await Promise.all([
          orderService.getMyOrders(),
          orderService.getAvailableOrders()
        ]);

        const activeCount = myOrders.filter(o => ["CONFIRMED", "SHIPPED"].includes(o.status)).length;
        const completedCount = myOrders.filter(o => ["DELIVERED", "COMPLETED"].includes(o.status)).length;

        setStats({
          activeDeliveries: activeCount,
          completedDeliveries: completedCount,
          newRequests: availableOrders.length,
          marketTrends: "+10%"
        });
        return;
      }

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-nature-600 animate-spin mx-auto mb-4" />
          <p className="text-nature-500 font-medium">Cultivating your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-nature-800 to-nature-600 p-8 shadow-xl shadow-nature-900/20 text-white">
        <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight mb-2">Dashboard</h1>
            <p className="text-nature-100/90 text-lg font-medium max-w-2xl">
                Welcome back, {firstName}! 
                <span className="block text-sm opacity-80 font-normal mt-1">Here's a summary of your agricultural activities and market insights.</span>
            </p>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-nature-400/20 rounded-full blur-2xl"></div>
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
              variant="nature"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              change="Earned"
              icon={DollarSign}
              variant="secondary"
            />
          </>
        )}
        {isLogistics && (
          <>
            <StatCard
              title="Active Deliveries"
              value={stats.activeDeliveries || 0}
              change="In Transit"
              icon={Truck}
              variant="blue"
            />
            <StatCard
              title="Completed"
              value={stats.completedDeliveries || 0}
              change="Success"
              icon={CheckCircle2}
              variant="nature"
            />
            <StatCard
              title="New Requests"
              value={stats.newRequests || 0}
              change="Marketplace"
              icon={ShoppingBag}
              variant="subtle"
            />
          </>
        )}
        {!isLogistics && (
          <StatCard
            title="Active Bids"
            value={stats.activeBids}
            change="Ongoing"
            icon={Users}
            variant="subtle"
          />
        )}
        <StatCard
          title="Market Trends"
          value={stats.marketTrends}
          change="High Demand"
          icon={TrendingUp}
          variant="accent"
        />
      </div>


      {/* Charts/Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-nature-800">Revenue Analytics</h3>
                <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-nature-500"></span>
                    <span className="w-3 h-3 rounded-full bg-secondary-light"></span>
                </div>
            </div>
          
            {/* Future: Chart Placeholder with improved look */}
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="bg-nature-50 p-6 rounded-full mb-4 shadow-inner">
                    <TrendingUp className="w-12 h-12 text-nature-300" />
                </div>
                <p className="text-nature-800 font-bold">Analytics Module Loading...</p>
                <p className="text-nature-500 text-sm mt-1">Detailed charts coming soon to this view.</p>
            </div>
            
            {/* Fake chart lines for visual fill */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10 pointer-events-none flex items-end justify-around px-8">
                {[40, 70, 45, 90, 60, 80, 50, 75, 60].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="w-8 bg-nature-600 rounded-t-lg mx-1"></div>
                ))}
            </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl min-h-[400px] relative overflow-hidden">
            <h3 className="font-bold text-xl text-nature-800 mb-6">Recent Activity</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center h-64">
                <div className="bg-nature-50 p-6 rounded-full mb-4 shadow-inner">
                    <Users className="w-12 h-12 text-nature-300" />
                </div>
                <p className="text-nature-800 font-bold">No Recent Activity</p>
                <p className="text-nature-500 text-sm mt-1">Your latest actions will appear here.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon, variant = 'nature' }) => {
    
    const variants = {
        nature: "bg-nature-50 text-nature-600 ring-nature-100",
        secondary: "bg-amber-50 text-amber-600 ring-amber-100",
        blue: "bg-sky-50 text-sky-600 ring-sky-100",
        subtle: "bg-slate-50 text-slate-600 ring-slate-100",
        accent: "bg-rose-50 text-rose-600 ring-rose-100",
    };

    const iconBg = variants[variant] || variants.nature;

    return (
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3.5 rounded-2xl ring-1 ring-inset ${iconBg} shadow-sm transition-colors duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-nature-800 border border-white/60">
                    {change}
                </span>
            </div>
            
            <div className="relative z-10">
                <h3 className="text-3xl font-black text-nature-900 tracking-tight">{value}</h3>
                <p className="text-sm font-bold text-nature-500 mt-1 uppercase tracking-wide">{title}</p>
            </div>
            
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
};

export default Dashboard;
