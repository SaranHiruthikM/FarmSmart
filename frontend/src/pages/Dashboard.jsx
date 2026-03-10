import React, { useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2, Truck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import authService from "../services/auth.service";
import negotiationService from "../services/negotiation.service";
import salesService from "../services/sales.service";
import cropService from "../services/crop.service";
import orderService from "../services/order.service";
import poolingService from "../services/pooling.service";
import { Globe, Users2, ChevronRight, LayoutDashboard, Search, HandCoins } from "lucide-react";
import RotationAdvisoryCard from "../components/dashboard/RotationAdvisoryCard";

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
  const [loading, setLoading] = useState(true);
  const [activePools, setActivePools] = useState([]);
  const [myCrops, setMyCrops] = useState([]);

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
        setMyCrops(crops);
        cropsCount = crops.length;

        if (crops.length > 0) {
          const district = crops[0].location?.district;
          if (district) {
            const pools = await poolingService.getActivePools(district);
            setActivePools(pools);
          }
        }
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
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#1a1f1b]">{t('nav.dashboard')}</h1>
        <p className="text-[#5C715E] mt-1">{t('dashboard.welcome', { name: firstName })}</p>
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
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              title={t('dashboard.totalRevenue')}
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              change={t('dashboard.earned')}
              icon={DollarSign}
              color="bg-green-50 text-green-600"
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
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              title={t('dashboard.completed')}
              value={stats.completedDeliveries}
              change={t('dashboard.success')}
              icon={CheckCircle2}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              title={t('dashboard.newRequests')}
              value={stats.newRequests}
              change={t('nav.marketplace')}
              icon={ShoppingBag}
              color="bg-purple-50 text-purple-600"
            />
          </>
        )}
        {!isLogistics && (
          <StatCard
            title={t('dashboard.activeBids')}
            value={stats.activeBids}
            change={t('dashboard.ongoing')}
            icon={Users}
            color="bg-purple-50 text-purple-600"
          />
        )}
        <StatCard
          title={t('dashboard.marketTrends')}
          value={stats.marketTrends}
          change={t('dashboard.highDemand')}
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600"
        />
      </div>


      {/* Cooperative Pooling Hub (Institutional Batches) */}
      {isFarmer && activePools.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
            <Globe className="w-64 h-64 rotate-12 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h2 className="text-xl font-bold text-[#1a1f1b]">{t('dashboard.cooperativeHub')}</h2>
              </div>
              <p className="text-xs text-[#5C715E] font-bold uppercase tracking-widest">{t('dashboard.activeBatches')} {activePools[0].district}</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-primary/20">
              {t('dashboard.viewAllPools')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activePools.map(pool => {
              const compatibleCrop = myCrops.find(c => c.name.toLowerCase() === pool.cropName.toLowerCase());
              return (
                <div key={pool._id} className="bg-neutral-light/10 border border-neutral-light/50 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all group/card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#1a1f1b] text-lg">{pool.cropName}</h4>
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('dashboard.target')}: {pool.targetQuantity} {pool.unit}</p>
                    </div>
                    <div className="px-2.5 py-1 bg-white border border-neutral-light rounded-lg shadow-sm">
                      <span className="text-xs font-bold text-primary italic">₹{pool.basePrice}/kg</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-accent/60">
                      <span>{t('dashboard.batchProgress')}</span>
                      <span>{pool.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-light/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${pool.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {compatibleCrop ? (
                    <button
                      onClick={() => handleJoinPool(pool._id, compatibleCrop._id, compatibleCrop.quantity)}
                      className="w-full py-3 bg-white border-2 border-primary/20 text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all group-hover/card:border-primary"
                    >
                      {t('dashboard.addYour')} {compatibleCrop.name}
                    </button>
                  ) : (
                    <button disabled className="w-full py-3 bg-neutral-light/30 text-accent/50 font-bold text-xs uppercase tracking-widest rounded-xl cursor-not-allowed italic">
                      {t('dashboard.noMatching')} {pool.cropName}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Strategies & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isFarmer ? (
            <RotationAdvisoryCard />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p>{t('dashboard.revenueComingSoon')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex items-center justify-center text-gray-400 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Users className="w-32 h-32 text-accent" />
          </div>
          {/* Future: Recent Activity List */}
          <div className="text-center relative z-10">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-2" />
            <p className="text-sm font-bold text-accent italic">{t('dashboard.activityComingSoon')}</p>
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
