import React, { useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2, Truck, CheckCircle2, Package, Clock, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import DynamicText from "../components/common/DynamicText"; // Import DynamicText
import authService from "../services/auth.service";
import negotiationService from "../services/negotiation.service";
import salesService from "../services/sales.service";
import cropService from "../services/crop.service";
import orderService from "../services/order.service";
import poolingService from "../services/pooling.service";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
// import { Globe, Users2, ChevronRight, LayoutDashboard, Search, HandCoins } from "lucide-react";
// import RotationAdvisoryCard from "../components/dashboard/RotationAdvisoryCard";

const Dashboard = () => {
  const { t } = useTranslation();
  const user = authService.getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || user?.role || "User";
  const isFarmer = user?.role?.toLowerCase() === "farmer";
  const isLogistics = user?.role?.toLowerCase() === "logistics";

  const [stats, setStats] = useState({
    totalCrops: 0,
    totalRevenue: 0,
    activeBids: 0,
    marketTrends: "+15%"
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
      labels: [],
      datasets: []
  });
  // const [activePools, setActivePools] = useState([]);
  // const [myCrops, setMyCrops] = useState([]);

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
        
        // Logistics Activity Logs
        let newActivities = [];

        // 1. New Available Requests
        if (availableOrders.length > 0) {
            newActivities = [...newActivities, ...availableOrders.map(order => ({
                id: `new-${order.id}`,
                 type: 'new_request',
                 title: 'New Service Request',
                 message: `${order.crop} (${order.quantity}kg) from ${order.farmerName}`,
                 date: new Date(order.date),
                 icon: Package,
                 color: 'text-blue-500 bg-blue-50'
            }))];
        }

        // 2. My Order Status Updates
        if (myOrders.length > 0) {
            myOrders.forEach(order => {
                // If timeline exists, use it for granular updates
                if (order.timeline && Array.isArray(order.timeline) && order.timeline.length > 0) {
                     order.timeline.forEach(event => {
                         newActivities.push({
                             id: `status-${order.id}-${event.status}`,
                             type: 'status_change',
                             title: `Order Status Updated`, 
                             message: `Order #${order.id.slice(-4)} is now ${event.status}`,
                             date: new Date(event.timestamp || order.date), // Fallback to order date if timestamp missing
                             icon: event.status === 'DELIVERED' ? CheckCircle2 : Truck,
                             color: event.status === 'DELIVERED' ? 'text-green-500 bg-green-50' : 'text-orange-500 bg-orange-50'
                         });
                     });
                } else {
                     // Fallback: Just show current status as "Latest Update"
                     newActivities.push({
                         id: `update-${order.id}`,
                         type: 'status_change',
                         title: `Order Update`,
                         message: `Order #${order.id.slice(-4)}: ${order.status}`,
                         date: new Date(order.date),
                         icon: order.status === 'DELIVERED' ? CheckCircle2 : Truck,
                         color: 'text-nature-600 bg-nature-50'
                     });
                }
            });
        }

        // Sort by date (newest first) and take top 5
        newActivities.sort((a, b) => b.date - a.date);
        setActivities(newActivities.slice(0, 5));

        // Calculate Revenue for Chart
        const revenueByDate = {};
        myOrders.forEach(order => {
             if(["DELIVERED", "COMPLETED"].includes(order.status)){
                 const dateObj = new Date(order.date);
                 const dateKey = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                 const revenue = (Number(order.totalPrice) || 0) * 0.10;
                 revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + revenue;
             }
        });

        // Ensure at least some dummy data if empty to show the chart structure
        const labels = Object.keys(revenueByDate).length > 0 ? Object.keys(revenueByDate) : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const data = Object.keys(revenueByDate).length > 0 ? Object.values(revenueByDate) : [0, 0, 0, 0];

        setChartData({
            labels: labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: data,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                borderColor: '#10b981',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        });

        setStats({
          activeDeliveries: activeCount,
          completedDeliveries: completedCount,
          newRequests: availableOrders.length,
          marketTrends: "+10%"
        });
        return;
      }

      const promises = [
        negotiationService.getMyNegotiations(),
      ];

      if (isFarmer) {
        promises.push(salesService.getSalesHistory());
        promises.push(cropService.getMyCrops());
      }

      const results = await Promise.all(promises);

      const negotiations = results[0] || [];
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
        // setMyCrops(crops);
        cropsCount = crops.length;

        if (crops.length > 0) {
          const district = crops[0].location?.district;
          if (district) {
            await poolingService.getActivePools(district);
          }
        }
        
        // Farmer Chart Data
        const revenueByDate = {};
        const revenueSales = sales.filter(order => order.currentStatus !== 'CANCELLED');
        revenueSales.forEach(order => {
             const dateObj = new Date(order.createdAt); // user order.createdAt from backend
             const dateKey = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
             revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + (order.totalAmount || 0);
        });
        
        const labels = Object.keys(revenueByDate);
        const data = Object.values(revenueByDate);

        setChartData({
            labels: labels.length > 0 ? labels : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Revenue (₹)',
                data: data.length > 0 ? data : [0, 0, 0, 0],
                // Simple color fallback if context unavailable during init
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        });
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

  // eslint-disable-next-line no-unused-vars
  const handleJoinPool = async (poolId, cropId, quantity) => {
    try {
      const amount = prompt(t('dashboard.enterQuantity'), quantity);
      if (!amount || isNaN(amount)) return;

      await poolingService.joinPool(poolId, cropId, parseFloat(amount));
      alert(t('dashboard.joinedPool'));
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || t('dashboard.failedToJoin'));
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-nature-600 animate-spin mx-auto mb-4" />
          <p className="text-nature-500 font-medium">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-nature-800 to-nature-600 p-8 shadow-xl shadow-nature-900/20 text-white">
        <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight mb-2">{t('nav.dashboard')}</h1>
            <p className="text-nature-100/90 text-lg font-medium max-w-2xl">
               {t('dashboard.welcome', { name: firstName })}
               <span className="block text-sm opacity-80 font-normal mt-1">{t('dashboard.welcomeSub')}</span>
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
              title={t('dashboard.totalCrops')}
              value={stats.totalCrops}
              change={t('dashboard.posted')}
              icon={ShoppingBag}
              variant="nature"
            />
            <StatCard
              title={t('dashboard.totalRevenue')}
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              change={t('dashboard.earned')}
              icon={DollarSign}
              variant="secondary"
            />
          </>
        )}
        {isLogistics && (
          <>
            <StatCard
              title={t('dashboard.activeDeliveries')}
              value={stats.activeDeliveries}
              change={t('dashboard.inTransit')}
              icon={Truck}
              variant="blue"
            />
            <StatCard
              title={t('dashboard.completed')}
              value={stats.completedDeliveries || 0}
              change={t('dashboard.success')}
              icon={CheckCircle2}
              variant="nature"
            />
            <StatCard
              title={t('dashboard.newRequests')}
              value={stats.newRequests || 0}
              change={t('nav.marketplace')}
              icon={ShoppingBag}
              variant="subtle"
            />
          </>
        )}
        {!isLogistics && (
          <StatCard
            title={t('dashboard.activeBids')}
            value={stats.activeBids}
            change={t('dashboard.ongoing')}
            icon={Users}
            variant="subtle"
          />
        )}
        <StatCard
          title={t('dashboard.marketTrends')}
          value={stats.marketTrends}
          change={t('dashboard.highDemand')}
          icon={TrendingUp}
          variant="accent"
        />
      </div>


      {/* Charts/Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl min-h-[400px] flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-nature-800">{t('dashboard.revenueAnalytics')}</h3>
                <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-nature-500"></span>
                    <span className="w-3 h-3 rounded-full bg-secondary-light"></span>
                </div>
            </div>
          
            <div className="w-full h-80 relative z-10 mt-4">
                {chartData && chartData.datasets && chartData.datasets.length > 0 ? (
                    <Line 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#fff',
                                    titleColor: '#1f2937',
                                    bodyColor: '#1f2937',
                                    borderColor: '#e5e7eb',
                                    borderWidth: 1,
                                    padding: 12,
                                    displayColors: false,
                                }
                            },
                            scales: {
                                x: {
                                    grid: { display: false },
                                    ticks: { font: { family: "sans-serif", size: 10 }, color: '#9ca3af' }
                                },
                                y: {
                                    beginAtZero: true,
                                    grid: { color: '#f3f4f6' },
                                    ticks: { font: { family: "sans-serif", size: 10 }, color: '#9ca3af', callback: (value) => '₹' + value }
                                }
                            }
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                        <div className="bg-nature-50 p-6 rounded-full mb-4 shadow-inner">
                           <TrendingUp className="w-12 h-12 text-nature-300 mb-4" />
                        </div>
                        <p className="text-nature-800 font-bold">{t('dashboard.analyticsLoading')}</p>
                    </div>
                )}
            </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl min-h-[400px] relative overflow-hidden">
            <h3 className="font-bold text-xl text-nature-800 mb-6">{t('dashboard.recentActivity')}</h3>
            
            {activities.length > 0 ? (
                <div className="space-y-6">
                    {activities.map((activity, index) => {
                        const Icon = activity.icon || Activity;
                        return (
                            <div key={index} className="flex gap-4 items-start group">
                                <div className={`p-3 rounded-xl ${activity.color || 'bg-nature-50 text-nature-600'} shrink-0 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-nature-800 text-sm truncate">{activity.title}</p>
                                    <p className="text-nature-500 text-xs mt-0.5 line-clamp-1">{activity.message}</p>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-nature-400 font-medium uppercase tracking-wider">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center h-64">
                    <div className="bg-nature-50 p-6 rounded-full mb-4 shadow-inner">
                        <Users className="w-12 h-12 text-nature-300" />
                    </div>
                    <DynamicText 
                        text={t('dashboard.noRecentActivity')} 
                        as="p" 
                        className="text-nature-800 font-bold"
                    />
                    <DynamicText 
                        text={t('dashboard.latestActions')} 
                        as="p" 
                        className="text-nature-500 text-sm mt-1"
                    />
                </div>
            )}
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
