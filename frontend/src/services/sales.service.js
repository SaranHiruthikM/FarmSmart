import api from "./api";

const salesService = {
    // Get all sales (orders where user is farmer)
    getSalesHistory: async () => {
        // Reusing the existing endpoint which filters by role on the backend
        const response = await api.get("/orders/my");
        return response.data;
    },

    // Calculate stats from sales data
    getSalesStats: (orders) => {
        if (!orders || orders.length === 0) {
            return {
                totalSales: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                completedOrders: 0
            };
        }

        const totalSales = orders.length;

        // Calculate total revenue
        // usage: 'CREATED' orders are now included to reflect potential revenue immediately in the dashboard
        const revenueOrders = orders.filter(order =>
            ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.currentStatus)
        );

        const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const pendingOrders = orders.filter(order =>
            ['CREATED', 'CONFIRMED', 'SHIPPED'].includes(order.currentStatus)
        ).length;

        const completedOrders = orders.filter(order =>
            ['DELIVERED', 'COMPLETED'].includes(order.currentStatus)
        ).length;

        return {
            totalSales,
            totalRevenue,
            pendingOrders,
            completedOrders
        };
    }
};

export default salesService;
