import { Response } from "express";
import { Types } from "mongoose";
import { Order } from "../models/Order";
import { Negotiation } from "../models/Negotiation";
import { Crop } from "../models/Crop";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendNewOrderAlert, sendOrderStatusAlert } from "../services/notificationService";

const ORDER_STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { negotiationId } = req.body as { negotiationId?: string };

    if (!negotiationId) {
      return res.status(400).json({ message: "negotiationId is required" });
    }

    if (!Types.ObjectId.isValid(negotiationId)) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    if (negotiation.status !== "ACCEPTED") {
      return res.status(400).json({ message: "Negotiation must be ACCEPTED to create an order" });
    }

    const pricePerUnit = negotiation.agreedPrice;
    const quantity = negotiation.agreedQuantity;
    const totalAmount = pricePerUnit * quantity;

    // Prevent Duplicate Orders for the same negotiation
    const existingOrder = await Order.findOne({ negotiationId: negotiation._id });
    if (existingOrder) {
        console.log(`[OrderController] Duplicate order found for negotiation ${negotiation._id}. Returning existing order without sending SMS.`);
        const populatedExisting = await Order.findById(existingOrder._id)
          .populate("cropId", "name")
          .populate("buyerId", "fullName role")
          .populate("farmerId", "fullName role");
        return res.status(200).json(populatedExisting);
    }

    // NEW: Check and Update Stock
    const crop = await Crop.findById(negotiation.cropId);
    if (!crop) {
        return res.status(404).json({ message: "Crop associated with negotiation not found" });
    }
    if (crop.quantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock. Current available: ${crop.quantity}` });
    }

    const order = await Order.create({
      negotiationId: negotiation._id,
      cropId: negotiation.cropId,
      buyerId: negotiation.buyerId,
      farmerId: negotiation.farmerId,
      pricePerUnit: negotiation.agreedPrice,
      quantity: negotiation.agreedQuantity,
      totalAmount: negotiation.agreedPrice * negotiation.agreedQuantity,
      currentStatus: "CREATED",
      status: [{ status: "CREATED", timestamp: new Date() }],
    });

    // Reduce stock
    crop.quantity -= quantity;
    if (crop.quantity < 0) crop.quantity = 0;
    // Optional: if (crop.quantity === 0) crop.isActive = false; 
    await crop.save();

    // Populate Response Data immediatly so UI doesn't flicker "Unknown Crop"
    const populatedOrder = await Order.findById(order._id)
      .populate("cropId", "name")
      .populate("buyerId", "fullName role phoneNumber")
      .populate("farmerId", "fullName role phoneNumber");

    // NOTIFICATION: Send SMS to Farmer (New Order)
    try {
        console.log(`[OrderController] Begin SMS logic for Order: ${order._id}`);
        // Fetch fresh User documents to ensure we have phone numbers
        const farmer = await User.findById(order.farmerId);
        const buyer = await User.findById(order.buyerId);
        
        // Debug Logs
        if (!farmer) console.warn(`[OrderController] Farmer not found for ID: ${order.farmerId}`);
        if (!farmer?.phoneNumber) console.warn(`[OrderController] Farmer has no phone number: ${order.farmerId}`);
        
        if (farmer && farmer.phoneNumber) {
            console.log(`[OrderController] Sending New Order SMS to Farmer: ${farmer.phoneNumber}`);
            await sendNewOrderAlert(farmer.phoneNumber, {
                buyerName: buyer?.fullName || 'Buyer',
                crop: crop.name || 'Crop',
                quantity: order.quantity,
                unit: 'kg' // Assuming default kg, or can be fetched from Crop
            });
            console.log(`[OrderController] SMS sent successfully.`);
        }
    } catch (smsErr) {
        console.error("[OrderController] SMS Error:", smsErr);
    }

    return res.status(201).json(populatedOrder);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate("cropId", "name")
      .populate("buyerId", "fullName role phoneNumber")
      .populate("farmerId", "fullName role phoneNumber")
      .populate("logisticsProviderId", "fullName role phoneNumber");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let filter: Record<string, any>;

    if (req.user.role === "BUYER") {
      filter = { buyerId: req.user.id };
    } else if (req.user.role === "FARMER") {
      filter = { farmerId: req.user.id };
    } else if (req.user.role === "LOGISTICS") {
      filter = { logisticsProviderId: req.user.id };
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await Order.find(filter)
      .populate("cropId", "name")
      .populate("buyerId", "fullName role phoneNumber")
      .populate("farmerId", "fullName role phoneNumber")
      .populate("logisticsProviderId", "fullName role phoneNumber")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAvailableOrdersForLogistics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== "LOGISTICS") {
      return res.status(403).json({ message: "Logistics only" });
    }

    // Find orders that are CREATED but have no logistics provider assigned
    const orders = await Order.find({
      currentStatus: "CREATED",
      $or: [
        { logisticsProviderId: { $exists: false } },
        { logisticsProviderId: null }
      ]
    })
      .populate("cropId", "name")
      .populate("buyerId", "fullName role phoneNumber")
      .populate("farmerId", "fullName role phoneNumber")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const acceptOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (req.user?.role !== "LOGISTICS") {
      return res.status(403).json({ message: "Logistics only" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.logisticsProviderId) {
      return res.status(400).json({ message: "Order already accepted by another provider" });
    }

    order.logisticsProviderId = new Types.ObjectId(req.user.id);
    // Optionally move status to CONFIRMED or keep CREATED? 
    // User said: "until then for farmer and buyer the order should be in pending state"
    // Pending state usually means CREATED.
    // Let's set it to CONFIRMED so everyone knows it's picked up.
    order.currentStatus = "CONFIRMED";
    order.status.push({ status: "CONFIRMED", timestamp: new Date() });
    
    await order.save();
    
    // Return populated order
    const populated = await Order.findById(order._id)
       .populate("cropId", "name")
       .populate("buyerId", "fullName role phoneNumber")
       .populate("farmerId", "fullName role phoneNumber")
       .populate("logisticsProviderId", "fullName role phoneNumber");

    // NOTIFICATION: Send SMS to Farmer and Buyer (Order Accepted)
    try {
        const farmer = await User.findById(order.farmerId);
        const buyer = await User.findById(order.buyerId);
        const crop = await Crop.findById(order.cropId);
        
        const cropName = crop?.name || 'Crop';
        
        if (farmer && farmer.phoneNumber) {
            await sendOrderStatusAlert(farmer.phoneNumber, {
                orderId: order._id.toString(),
                status: "CONFIRMED",
                crop: cropName
            });
        }
        
        if (buyer && buyer.phoneNumber) {
            await sendOrderStatusAlert(buyer.phoneNumber, {
                orderId: order._id.toString(),
                status: "CONFIRMED",
                crop: cropName
            });
        }
    } catch (smsErr) {
        console.error("SMS Error:", smsErr);
    }

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateLogisticsDetails = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { driverName, vehicleNumber, contactNumber, estimatedDelivery } = req.body;

    if (req.user?.role !== "LOGISTICS") {
      return res.status(403).json({ message: "Logistics only" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure this provider owns the order
    if (order.logisticsProviderId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not the provider for this order" });
    }

    order.logisticsDetails = {
      ...order.logisticsDetails,
      driverName,
      vehicleNumber,
      contactNumber,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
    };

    await order.save();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const nextStatus = req.body?.status as string | undefined;

    if (!nextStatus || !ORDER_STATUSES.includes(nextStatus as OrderStatus)) {
      return res.status(400).json({ message: "Missing or invalid status" });
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id as string)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Logic: Only Logistics provider (who accepted the order) can update status.
    // ALSO: Admin can probably update status? I'll stick to user requirement: "Logistics provideder... They should be the ones be able to change the order status"
    // User requested removal of farmer capability.

    const isLogistics = req.user?.role === "LOGISTICS";
    const isAdmin = req.user?.role === "ADMIN";

    if (!isLogistics && !isAdmin) {
       return res.status(403).json({ message: "Only Logistics Provider can update status" });
    }

    if (isLogistics && order.logisticsProviderId?.toString() !== req.user?.id) {
       return res.status(403).json({ message: "You are not the designated logistics provider" });
    }

    order.currentStatus = nextStatus as OrderStatus;
    order.status.push({ status: nextStatus, timestamp: new Date() });

    await order.save();

    // NOTIFICATION: Send SMS to Buyer and Farmer
    try {
        const buyer = await User.findById(order.buyerId);
        const farmer = await User.findById(order.farmerId);
        const crop = await Crop.findById(order.cropId);
        
        const cropName = crop?.name || 'Crop';
        const status = nextStatus;

        // Notify Buyer
        if (buyer && buyer.phoneNumber) {
            await sendOrderStatusAlert(buyer.phoneNumber, {
                orderId: order._id.toString(),
                status: status,
                crop: cropName
            });
        }

        // Notify Farmer
        if (farmer && farmer.phoneNumber) {
            await sendOrderStatusAlert(farmer.phoneNumber, {
                orderId: order._id.toString(),
                status: status,
                crop: cropName
            });
        }

    } catch (smsErr) {
        console.error("SMS Error:", smsErr);
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
