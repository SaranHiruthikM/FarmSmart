import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import VerificationCode, { VerificationType } from '../models/VerificationCode';
import { sendResponse } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const saveOTP = async (contact: string, type: VerificationType) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete existing codes for this user/type
  await VerificationCode.deleteMany({ contact, type });

  await VerificationCode.create({
    contact,
    code,
    type,
    expiresAt
  });

  // In a real app, send SMS here
  console.log(`\n----------------------------------------`);
  console.log(`[OTP] GENERATED FOR ${contact}: ${code}`);
  console.log(`----------------------------------------\n`);
  return code;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password, role, fullName, email, preferredLanguage } = req.body;

    // 1. Validate required fields
    if (!phoneNumber || !password) {
      sendResponse(res, 400, "Phone number and password are required");
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

    // 4. Create User (Unverified initially)
    await User.create({
      phoneNumber: phoneStr,
      passwordHash,
      role: userRole,
      fullName,
      email,
      preferredLanguage: preferredLanguage || 'en',
      isVerified: false // Explicitly unverified
    });

    // 5. Generate and Save OTP
    const otp = await saveOTP(phoneStr, VerificationType.PHONE);

    sendResponse(res, 201, "User registered successfully. Please verify OTP.", {
      requiresOtp: true,
      phoneNumber: phoneStr,
      debugOtp: otp
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

    // 4. Generate and Save OTP
    const otp = await saveOTP(phoneStr, VerificationType.PHONE);

    sendResponse(res, 200, "Credentials valid. Please verify OTP.", {
      requiresOtp: true,
      phoneNumber: phoneStr,
      debugOtp: otp
    });

  } catch (error) {
    console.error("Login Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contact, code } = req.body;

    if (!contact || !code) {
      sendResponse(res, 400, "Contact and code are required");
      return;
    }

    // 1. Find the OTP record
    const record = await VerificationCode.findOne({
      contact: contact,
      code: code,
      type: VerificationType.PHONE,
      expiresAt: { $gt: new Date() } // check if not expired
    });

    if (!record) {
      sendResponse(res, 400, "Invalid or expired OTP");
      return;
    }

    // 2. Find the user
    const user = await User.findOne({ phoneNumber: contact });
    if (!user) {
      sendResponse(res, 404, "User not found");
      return;
    }

    // 3. Mark user as verified
    user.isVerified = true;
    await user.save();

    // 4. Delete the OTP record (prevent reuse)
    await VerificationCode.deleteOne({ _id: record._id });

    // 5. Generate Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password from response
    const userObject = user.toObject();
    const { passwordHash: _, ...userWithoutPassword } = userObject;

    sendResponse(res, 200, "Verification successful", {
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error("Verify Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contact } = req.body;

    if (!contact) {
      sendResponse(res, 400, "Contact is required");
      return;
    }

    // 1. Check if user exists
    const user = await User.findOne({ phoneNumber: contact });
    if (!user) {
      sendResponse(res, 404, "User not found");
      return;
    }

    // 2. Generate and Save OTP
    const otp = await saveOTP(contact, VerificationType.PHONE);

    sendResponse(res, 200, "OTP resent successfully", {
      debugOtp: otp
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};