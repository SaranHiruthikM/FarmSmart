import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendWelcomeMessage, sendLoginAlert } from '../services/notificationService';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';

import { uploadToCloudinary } from '../utils/cloudinary';

export const uploadKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, "Unauthorized");
      return;
    }

    if (!req.file) {
      sendResponse(res, 400, "KYC document image is required");
      return;
    }

    const result = await uploadToCloudinary(req.file.buffer, 'kyc_documents');
    const kycDocumentUrl = result.secure_url;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        kycDocumentUrl,
        kycStatus: "PENDING",
        isVerified: false
      },
      { new: true }
    ).select('-passwordHash');

    sendResponse(res, 200, "KYC document uploaded successfully. Verification pending.", { user });
  } catch (error) {
    console.error("Upload KYC Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, "Unauthorized");
      return;
    }

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      sendResponse(res, 404, "User not found");
      return;
    }

    sendResponse(res, 200, "User profile fetched", { user });
  } catch (error) {
    console.error("GetMe Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 401, "Unauthorized");
      return;
    }

    const { fullName, email, preferredLanguage, state, district, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        preferredLanguage,
        state,
        district,
        address
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      sendResponse(res, 404, "User not found");
      return;
    }

    sendResponse(res, 200, "Profile updated successfully", { user: updatedUser });
  } catch (error: any) {
    console.error("UpdateProfile Error:", error);
    if (error.code === 11000) {
      sendResponse(res, 400, "Email already in use");
    } else {
      sendResponse(res, 500, "Internal Server Error");
    }
  }
};



export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password, role, fullName, email, preferredLanguage, state, district, address } = req.body;

    // 1. Validate required fields
    if (!phoneNumber || !password || !state || !district) {
      sendResponse(res, 400, "Phone number, password, state, and district are required");
      return;
    }

    const phoneStr = String(phoneNumber);
    const userRole = role ? role.toUpperCase() : 'FARMER';

    // Optional: Validate Role against known values
    const validRoles = ['FARMER', 'BUYER', 'COOPERATIVE', 'ADMIN', 'LOGISTICS'];
    if (!validRoles.includes(userRole)) {
      sendResponse(res, 400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
      return;
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: phoneStr });

    if (existingUser) {
      sendResponse(res, 409, "User with this phone number already exists");
      return;
    }

    // 3. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create User (Verified initially)
    const newUser = await User.create({
      phoneNumber: phoneStr,
      passwordHash,
      role: userRole,
      fullName,
      email,
      state,
      district,
      address,
      preferredLanguage: preferredLanguage || 'en',
      isVerified: true // Verify by default
    });

    // 5. Generate Token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome SMS
    await sendWelcomeMessage(phoneStr, fullName);

    const userObject = newUser.toObject();
    const { passwordHash: _, ...userWithoutPassword } = userObject;

    sendResponse(res, 201, "User registered successfully", {
      user: userWithoutPassword,
      token,
      requiresOtp: false
    });

  } catch (error) {
    console.error("Register Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    // 1. Validate required fields
    if (!phoneNumber || !password) {
      sendResponse(res, 400, "Phone number and password are required");
      return;
    }

    const phoneStr = String(phoneNumber);

    // 2. Find User
    const user = await User.findOne({ phoneNumber: phoneStr });

    if (!user) {
      sendResponse(res, 401, "Invalid phone number or password");
      return;
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      sendResponse(res, 401, "Invalid phone number or password");
      return;
    }

    // 4. Generate Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Login Alert SMS
    await sendLoginAlert(phoneStr, user.fullName || 'User');

    const userObject = user.toObject();
    const { passwordHash: _, ...userWithoutPassword } = userObject;

    sendResponse(res, 200, "Login successful", {
      user: userWithoutPassword,
      token,
      requiresOtp: false
    });

  } catch (error) {
    console.error("Login Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

