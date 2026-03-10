import authService from "./auth.service";
import negotiationService from "./negotiation.service";
import orderService from "./order.service";
import cropService from "./crop.service";

class NotificationService {
    constructor() {
        this.READ_STORAGE_KEY = "farmsmart_notifications_read_v2";
    }

    // Helper to get current user
    _getUser() {
        return authService.getCurrentUser();
    }

    // Get the list of IDs that have been "read"
    _getReadIds() {
        return JSON.parse(localStorage.getItem(this.READ_STORAGE_KEY) || "[]");
    }

    // Mark an ID as read locally
    async markAsRead(id) {
        const readIds = this._getReadIds();
        if (!readIds.includes(id)) {
            readIds.push(id);
            localStorage.setItem(this.READ_STORAGE_KEY, JSON.stringify(readIds));
        }
    }

    // Mark all currently visible notifications as read
    async markAllAsRead() {
        const notifications = await this.getNotifications();
        const readIds = this._getReadIds();
        const newReadIds = [...readIds];

        notifications.forEach(n => {
            if (!newReadIds.includes(n.id)) {
                newReadIds.push(n.id);
            }
        });

        localStorage.setItem(this.READ_STORAGE_KEY, JSON.stringify(newReadIds));
    }

    /**
     * Settings Management (Local Storage for now)
     */
    async getSettings() {
        const defaultSettings = {
            sms: false,
            call: false,
            priceAlerts: false,
            auctionAlerts: false,
            deliveryAlerts: false
        };
        const settings = localStorage.getItem("farmsmart_notification_settings");
        return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    }

    async updateSettings(newSettings) {
        const currentCheck = await this.getSettings();
        const updated = { ...currentCheck, ...newSettings };
        localStorage.setItem("farmsmart_notification_settings", JSON.stringify(updated));
        return updated;
    }

    /**
     * DERIVE NOTIFICATIONS from Negotiations, Orders, and Crops
     */
    async getNotifications() {
        const user = this._getUser();
        if (!user) return [];

        const readIds = this._getReadIds();
        const derivedNotifications = [];

        try {
            // 1. Fetch Negotiations, Orders, and Crops
            const [negotiations, orders, crops] = await Promise.all([
                negotiationService.getMyNegotiations(),
                orderService.getMyOrders(),
                cropService.getAllCrops()
            ]);

            // const currentRole = user.role ? user.role.toUpperCase() : (user.userType ? user.userType.toUpperCase() : "");

            // --- PROCESS NEGOTIATIONS ---
            negotiations.forEach(neg => {
                const isFarmer = String(neg.farmerId) === String(user.id);
                const otherPartyName = isFarmer ? neg.buyerName : neg.farmerName;
                const lastOfferBy = neg.lastOfferBy ? neg.lastOfferBy.toUpperCase() : "";

                // Logic:
                // If Status is PENDING/COUNTER_OFFER and lastOffer is NOT by me, I need to respond -> Notify Me
                // If Status is ACCEPTED/REJECTED, it means the *responder* made the decision.
                // - If lastOffer was by ME, and status is ACCEPTED/REJECTED, it means OTHER party decided -> Notify Me
                // - If lastOffer was by OTHER, and status is ACCEPTED/REJECTED, it means *I* decided -> Don't Notify Me

                // My side check:
                const didIMakeLastOffer = (isFarmer && lastOfferBy === 'FARMER') || (!isFarmer && lastOfferBy === 'BUYER');

                // Case A: NEW OFFER / COUNTER OFFER (Action Required)
                // Logic: Notify the recipient of the offer.
                if (neg.status === 'pending' || neg.status === 'counter_offer') {
                    // 1. Buyer Placed Bid -> Notify Farmer
                    if (lastOfferBy === 'BUYER' && isFarmer) {
                        derivedNotifications.push({
                            id: `neg_${neg._id}_${neg.updatedAt}`,
                            type: 'PRICE',
                            message: `${neg.buyerName} has placed a bid of ₹${neg.price}/${neg.unit} on your ${neg.cropName}.`,
                            time: neg.updatedAt || neg.createdAt,
                            link: `/dashboard/negotiations/${neg._id}`,
                            read: readIds.includes(`neg_${neg._id}_${neg.updatedAt}`)
                        });
                    }
                    // 2. Farmer Countered -> Notify Buyer
                    else if (lastOfferBy === 'FARMER' && !isFarmer) {
                        derivedNotifications.push({
                            id: `neg_${neg._id}_${neg.updatedAt}`,
                            type: 'PRICE',
                            message: `${neg.farmerName} has countered your offer for ${neg.cropName} at ₹${neg.price}/${neg.unit}.`,
                            time: neg.updatedAt || neg.createdAt,
                            link: `/dashboard/negotiations/${neg._id}`,
                            read: readIds.includes(`neg_${neg._id}_${neg.updatedAt}`)
                        });
                    }
                }

                // Case B: ACCEPTED
                // User Request: "deal accepted should be notified only to the concerned buyer"
                if (neg.status === 'accepted' && !isFarmer) {
                    derivedNotifications.push({
                        id: `neg_accept_${neg._id}`,
                        type: 'SUCCESS',
                        message: `Deal Accepted! Your negotiation for ${neg.cropName} with ${neg.farmerName} has been finalized.`,
                        time: neg.updatedAt,
                        link: `/dashboard/negotiations/${neg._id}`,
                        read: readIds.includes(`neg_accept_${neg._id}`)
                    });
                }

                // Case C: REJECTED (Keep existing logic: Notify the one who made the offer)
                if (neg.status === 'rejected' && didIMakeLastOffer) {
                    derivedNotifications.push({
                        id: `neg_reject_${neg._id}`,
                        type: 'ERROR',
                        message: `Deal Rejected. Your offer for ${neg.cropName} was declined by ${otherPartyName}.`,
                        time: neg.updatedAt,
                        link: `/dashboard/negotiations/${neg._id}`,
                        read: readIds.includes(`neg_reject_${neg._id}`)
                    });
                }
            });

            // --- PROCESS ORDERS ---
            orders.forEach(order => {
                const isSeller = String(order.farmerId) === String(user.id);
                const otherPartyName = isSeller ? order.buyerName : order.farmerName;

                // Case A: NEW ORDER (Status: CREATED)
                // User Request: "buyer should not get notified... only the farmer"
                if (order.status === 'CREATED' && isSeller) {
                    derivedNotifications.push({
                        id: `ord_create_${order._id}`,
                        type: 'SYSTEM',
                        message: `New Order Received! ${otherPartyName} has placed an order for ${order.crop}.`,
                        time: order.date,
                        link: `/dashboard/orders`,
                        read: readIds.includes(`ord_create_${order._id}`)
                    });
                }

                // Case B: STATUS UPDATES
                // If status changed from CREATED, notify BOTH (or primarily the one who didn't change it).
                // Since we don't track *who* changed it easily in the order object without logs, we'll notify both regarding the status.
                // Ideally, prevent notifying self if possible, but status updates like "SHIPPED" are usually done by Seller, so Buyer needs non-notif.
                // "DELIVERED" might be system or courier.
                if (order.status !== 'CREATED') {
                    derivedNotifications.push({
                        id: `ord_update_${order._id}_${order.status}`,
                        type: 'INFO',
                        message: `Order Update: Status for ${order.crop} is now ${order.status}.`,
                        time: order.date,
                        link: `/dashboard/orders`,
                        read: readIds.includes(`ord_update_${order._id}_${order.status}`)
                    });
                }
            });

            // --- PROCESS CROPS (NEW LISTINGS) ---
            // Broadcast to everyone: "Farmer X has created this crop at this price"
            // Filter: Don't notify the creator.
            // Limit: Only recent crops (last 48 hours) to avoid spamming old stuff.
            const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
            const now = Date.now();

            crops.forEach(crop => {
                // Skip my own crops
                if (String(crop.farmer) === String(user.id)) return;

                const createdAt = new Date(crop.createdAt || crop.updatedAt).getTime(); // Fallback to update if create missing

                if (now - createdAt < TWO_DAYS_MS) {
                    derivedNotifications.push({
                        id: `new_crop_${crop._id}`,
                        type: 'INFO',
                        message: `New Arrival: ${crop.farmerName} listed ${crop.name} at ₹${crop.basePrice}/${crop.unit} in ${crop.location?.district || 'your area'}.`,
                        time: crop.createdAt || new Date().toISOString(),
                        link: `/dashboard/marketplace/${crop._id}`,
                        read: readIds.includes(`new_crop_${crop._id}`)
                    });
                }
            });

        } catch (error) {
            console.error("Failed to derive notifications", error);
        }

        // Sort by time (Newest first)
        return derivedNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // Unused but kept for compatibility
    createNotification(targetUserId, message, _type = 'INFO', _link = null) {
        return Promise.resolve();
    }

    // Alias
    addNotification(targetUserId, message, type = 'INFO', link = null) {
        return this.createNotification(targetUserId, message, type, link);
    }

    // Get unread count
    async getUnreadCount() {
        const notifications = await this.getNotifications();
        return notifications.filter(n => !n.read).length;
    }
}

export default new NotificationService();
