// ⚖️ MOCK DISPUTE SERVICE — TEMPORARY FOR UI persistence
const MOCK_DISPUTES_KEY = "farmsmart_mock_disputes";

const initialDisputes = [
    {
        id: "DISP-MOCK-001",
        orderId: "ORD001",
        raisedBy: "Mock Buyer",
        raisedByRole: "BUYER",
        farmerName: "Mock Farmer",
        reason: "Quantity Discrepancy",
        description: "The weight delivered is 10kg less than what was ordered.",
        status: "OPEN",
        createdAt: new Date().toISOString(),
        adminRemarks: ""
    }
];

const mockDisputeService = {
    getAllDisputes: () => {
        const stored = localStorage.getItem(MOCK_DISPUTES_KEY);

        try {
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                // If it's an empty array, and we have initial data, maybe we should show it
                if (Array.isArray(parsed) && parsed.length === 0 && initialDisputes.length > 0) {
                    localStorage.setItem(MOCK_DISPUTES_KEY, JSON.stringify(initialDisputes));
                    return initialDisputes;
                }
            }
        } catch (e) {
            console.error("Error parsing mock disputes:", e);
        }

        // Default to initial if nothing stored or error
        localStorage.setItem(MOCK_DISPUTES_KEY, JSON.stringify(initialDisputes));
        return initialDisputes;
    },

    getMyDisputes: (userName) => {
        const disputes = mockDisputeService.getAllDisputes();
        return disputes.filter(d => d.raisedBy === userName || d.farmerName === userName);
    },

    getDisputeById: (id) => {
        const disputes = mockDisputeService.getAllDisputes();
        return disputes.find(d => d.id === id);
    },

    getDisputeByOrderId: (orderId) => {
        const disputes = mockDisputeService.getAllDisputes();
        return disputes.find(d => d.orderId === orderId);
    },

    createDispute: (disputeData) => {
        const disputes = mockDisputeService.getAllDisputes();
        const newDispute = {
            id: `DISP${String(disputes.length + 1).padStart(3, '0')}`,
            status: "OPEN",
            createdAt: new Date().toISOString(),
            adminRemarks: "",
            ...disputeData
        };
        const updatedDisputes = [...disputes, newDispute];
        localStorage.setItem(MOCK_DISPUTES_KEY, JSON.stringify(updatedDisputes));
        return newDispute;
    },

    updateDisputeStatus: (id, status, adminRemarks) => {
        const disputes = mockDisputeService.getAllDisputes();
        const updatedDisputes = disputes.map(d =>
            d.id === id ? { ...d, status, adminRemarks: adminRemarks || d.adminRemarks } : d
        );
        localStorage.setItem(MOCK_DISPUTES_KEY, JSON.stringify(updatedDisputes));
        return updatedDisputes.find(d => d.id === id);
    }
};

export default mockDisputeService;
