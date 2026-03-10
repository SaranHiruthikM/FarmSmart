import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';
import { sendResponse } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';

/**
 * Handle Admin bypass login
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (email === 'admin@farmsmart.in' && password === '1234') {
      // Find or create the admin user
      let admin = await User.findOne({ email: 'admin@farmsmart.in' });

      if (!admin) {
        // Create an admin user to act as a reference if it doesn't exist
        const adminId = new mongoose.Types.ObjectId();
        admin = await User.create({
          _id: adminId,
          phoneNumber: '0000000000', // dummy
          email: 'admin@farmsmart.in',
          passwordHash: 'bypassed',
          role: 'ADMIN',
          fullName: 'Cooperative Official',
          state: 'All',
          district: 'All',
          preferredLanguage: 'en',
          kycStatus: "APPROVED",
          isVerified: true
        });
      }

      // Generate a token
      const token = jwt.sign(
        { userId: admin._id, role: admin.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userObject = admin.toObject();
      const { passwordHash: _, ...userWithoutPassword } = userObject;

      sendResponse(res, 200, 'Admin login successful', {
        user: userWithoutPassword,
        token,
      });
      return;
    }

    sendResponse(res, 401, 'Invalid credentials for admin login');
    return;
  } catch (error) {
    console.error("Admin Login Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

/**
 * Get Pending Verifications
 */
export const getPendingVerifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const pendingUsers = await User.find({ kycStatus: "PENDING" }).select('-passwordHash');
        sendResponse(res, 200, "Pending verifications fetched", { users: pendingUsers });
    } catch (error) {
        console.error("Get Pending Verifications Error:", error);
        sendResponse(res, 500, "Internal Server Error");
    }
};

/**
 * Update KYC Status
 */
export const verifyUserKYC = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            sendResponse(res, 400, "Invalid status");
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            sendResponse(res, 404, "User not found");
            return;
        }

        user.kycStatus = status;
        if (status === 'APPROVED') {
            user.isVerified = true;
        }

        await user.save();

        const updatedUser = user.toObject();
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;

        sendResponse(res, 200, `User KYC ${status.toLowerCase()} successfully`, { user: userWithoutPassword });
    } catch (error) {
        console.error("Verify User KYC Error:", error);
        sendResponse(res, 500, "Internal Server Error");
    }
};

/**
 * Get Dashboard Stats
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { Dispute } = await import('../models/Dispute');
        const { Order } = await import('../models/Order');
        const { Crop } = await import('../models/Crop');
        const { Negotiation } = await import('../models/Negotiation');

        // Parallel counts and aggregations
        const [
            totalUsers,
            farmerCount,
            buyerCount,
            pendingKycCount,
            activeDisputes,
            totalOrders,
            crops,
            negotiations
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'FARMER' }),
            User.countDocuments({ role: 'BUYER' }),
            User.countDocuments({ kycStatus: 'PENDING' }),
            Dispute.countDocuments({ status: 'OPEN' }),
            Order.countDocuments(),
            Crop.find({ status: 'AVAILABLE' }),
            Negotiation.find({ status: 'PENDING' })
        ]);

        const supplyData: Record<string, number> = {};
        const cropIdToName: Record<string, string> = {};
        
        crops.forEach(c => {
            supplyData[c.name] = (supplyData[c.name] || 0) + c.quantity;
            cropIdToName[c._id.toString()] = c.name;
        });

        const demandData: Record<string, number> = {};
        negotiations.forEach(n => {
            const cropName = cropIdToName[n.cropId.toString()] || 'Unknown';
            demandData[cropName] = (demandData[cropName] || 0) + 1; 
        });

        const supplyDemandData = Object.keys(supplyData).map(name => ({
            name,
            supply: supplyData[name],
            demandIndex: demandData[name] || 0
        })).sort((a, b) => b.supply - a.supply).slice(0, 5);

        sendResponse(res, 200, "Dashboard stats fetched", {
            totalUsers,
            farmerCount,
            buyerCount,
            pendingKycCount,
            activeDisputes,
            totalOrders,
            supplyDemandData
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        sendResponse(res, 500, "Internal Server Error");
    }
};
