import authService from "./auth.service";

class NotificationService {
    constructor() {
        this.STORAGE_KEY = "farmsmart_notifications";
    }

    // Helper to get current user
    _getUser() {
        return authService.getCurrentUser();
    }

    // Get notifications for the current user
    async getNotifications() {
        const user = this._getUser();
        if (!user) return [];

        const allNotifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");

        // DEBUG LOGGING
        console.log("Fetching notifications for user:", user);
        console.log("All notifications in storage:", allNotifications);

        // Filter notifications meant for this user
        // Handle both id and _id, and ensure string comparison
        const userId = user.id || user._id;

        const filtered = allNotifications.filter(n => {
            const notifUserId = n.userId;
            // Loose comparison or string conversion to be safe
            return String(notifUserId) === String(userId);
        });

        console.log("Filtered notifications:", filtered);

        return filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // Add a notification
    // targetUserId: ID of the user who should receive this
    // message: text
    // type: 'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PRICE', 'SYSTEM'
    // link: optional link to redirect
    async addNotification(targetUserId, message, type = 'INFO', link = null) {
        if (!targetUserId) {
            console.error("NotificationService: No targetUserId provided!");
            return;
        }

        // Normalize ID to string to avoid object/id mismatches
        const normalizedTargetId = typeof targetUserId === 'object' ? (targetUserId._id || targetUserId.id) : targetUserId;

        console.log(`Adding notification for ${normalizedTargetId}: ${message}`);

        const newNotification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: String(normalizedTargetId), // Ensure string
            message,
            type,
            link,
            read: false,
            time: new Date().toISOString()
        };

        const allNotifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
        allNotifications.push(newNotification);

        // Limit storage to last 50 notifications per user (clean up old ones)
        // This is a naive cleanup for simplicity
        if (allNotifications.length > 200) {
            allNotifications.splice(0, allNotifications.length - 200);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
        return newNotification;
    }

    // Mark as read
    async markAsRead(id) {
        const allNotifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
        const index = allNotifications.findIndex(n => n.id === id);

        if (index !== -1) {
            allNotifications[index].read = true;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
        }
    }

    // Mark all as read for current user
    async markAllAsRead() {
        const user = this._getUser();
        if (!user) return;

        const allNotifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
        const updated = allNotifications.map(n =>
            n.userId === user.id ? { ...n, read: true } : n
        );

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }

    // Get unread count
    async getUnreadCount() {
        const notifications = await this.getNotifications();
        return notifications.filter(n => !n.read).length;
    }

    // Alias for createNotification
    createNotification(targetUserId, message, type = 'INFO', link = null) {
        return this.addNotification(targetUserId, message, type, link);
    }
}

export default new NotificationService();
