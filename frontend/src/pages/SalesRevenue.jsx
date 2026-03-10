import React, { useState, useEffect } from 'react';
import salesService from '../services/sales.service';
import {
    TrendingUp,
    Package,
    CheckCircle,
    Clock,
    Search,
    Filter,
    DollarSign,
    Calendar
} from 'lucide-react';

const SalesRevenue = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0
    });

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [filteredSales, setFilteredSales] = useState([]);

    const loadSalesData = async () => {
        try {
            setLoading(true);
            const data = await salesService.getSalesHistory();
            setSales(data);
            setStats(salesService.getSalesStats(data));
            setLoading(false);
        } catch (error) {
            console.error("Error loading sales data:", error);
            setLoading(false);
        }
    };

    const filterSales = React.useCallback(() => {
        let result = [...sales];

        // Search by Crop Name or Buyer Name
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(sale =>
                sale.cropId?.name?.toLowerCase().includes(lowerTerm) ||
                sale.buyerId?.fullName?.toLowerCase().includes(lowerTerm)
            );
        }

        // Filter by Status
        if (statusFilter !== 'ALL') {
            result = result.filter(sale => sale.currentStatus === statusFilter);
        }

        setFilteredSales(result);
    }, [sales, searchTerm, statusFilter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadSalesData();
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        filterSales();
    }, [filterSales]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'DELIVERED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SHIPPED': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'CREATED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales & Revenue</h1>
                    <p className="text-gray-500">Track your sales history and revenue performance</p>
                </div>
                <div className="flex gap-2">
                    {/* Export button could go here */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-50 text-green-600"
                />
                <StatsCard
                    title="Total Sales"
                    value={stats.totalSales}
                    icon={TrendingUp}
                    color="bg-blue-50 text-blue-600"
                />
                <StatsCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={Clock}
                    color="bg-yellow-50 text-yellow-600"
                />
                <StatsCard
                    title="Completed"
                    value={stats.completedOrders}
                    icon={CheckCircle}
                    color="bg-purple-50 text-purple-600"
                />
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by crop or buyer..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="CREATED">Created</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Crop</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-500">#{sale._id.slice(-6)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(sale.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                                                    {sale.cropId?.name?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{sale.cropId?.name || 'Unknown Crop'}</p>
                                                    <p className="text-xs text-gray-500">{sale.quantity} units</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{sale.buyerId?.fullName || 'Unknown Buyer'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sale.currentStatus)}`}>
                                                {sale.currentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-bold text-gray-800">₹{sale.totalAmount.toLocaleString()}</p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p>No sales records found matching your filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

export default SalesRevenue;
