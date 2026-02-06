// 🚧 MOCK ORDER SERVICE — TEMPORARY FOR UI persistence
const MOCK_ORDERS_KEY = "farmsmart_mock_orders";

const initialOrders = [
    {
        id: "ORD001",
        crop: "Organic Basmati Rice",
        quantity: "500 kg",
        totalPrice: "₹35,000",
        status: "Shipped",
        date: "2024-02-05",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=100&h=100"
    },
    {
        id: "ORD002",
        crop: "Alphonso Mangoes",
        quantity: "200 kg",
        totalPrice: "₹45,000",
        status: "Confirmed",
        date: "2024-02-04",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=100&h=100"
    },
    {
        id: "ORD003",
        crop: "Fresh Turmeric",
        quantity: "100 kg",
        totalPrice: "₹12,000",
        status: "Delivered",
        date: "2024-01-30",
        image: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&w=100&h=100"
    }
];

const mockOrderService = {
    getAllOrders: () => {
        const stored = localStorage.getItem(MOCK_ORDERS_KEY);
        if (!stored) {
            localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(initialOrders));
            return initialOrders;
        }
        return JSON.parse(stored);
    },

    getOrderById: (id) => {
        const orders = mockOrderService.getAllOrders();
        return orders.find(o => o.id === id);
    },

    updateOrderStatus: (id, status) => {
        const orders = mockOrderService.getAllOrders();
        const updatedOrders = orders.map(o =>
            o.id === id ? { ...o, status } : o
        );
        localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(updatedOrders));
        return updatedOrders.find(o => o.id === id);
    }
};

export default mockOrderService;
