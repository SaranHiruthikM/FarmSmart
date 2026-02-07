import notificationData from "../mock/notifications.json";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class NotificationService {
    constructor() {
        // Initialize from mock data or local storage to persist changes in session
        const storedSettings = localStorage.getItem("notification_settings");
        this.settings = storedSettings ? JSON.parse(storedSettings) : notificationData.settings;

        // For notifications list, we just read from mock for now, but could be stateful
        this.notifications = notificationData.list;
    }

    async getNotifications() {
        await delay(300);
        return [...this.notifications];
    }

    async getSettings() {
        await delay(200);
        return { ...this.settings };
    }

    async updateSettings(newSettings) {
        await delay(300);
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem("notification_settings", JSON.stringify(this.settings));
        return { success: true, settings: this.settings };
    }

    async updateSMSSettings(enabled) {
        return this.updateSettings({ sms: enabled });
    }

    async createPriceAlert(cropId, priceThreshold) {
        await delay(500);
        console.log(`[Mock API] Price Alert Created: Crop ${cropId} >= ${priceThreshold}`);
        return {
            success: true,
            message: `Alert set for price ≥ ₹${priceThreshold}`,
            data: { cropId, priceThreshold, active: true }
        };
    }

    async markAsRead(id) {
        await delay(100);
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notifications[index].read = true;
        }
        return { success: true };
    }
}

export default new NotificationService();
