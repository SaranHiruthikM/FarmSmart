import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendResponse } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password, role, fullName, email, preferredLanguage } = req.body;

    console.log("Request came from: ", email ? email : phoneNumber);

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

    // 4. Create User
    const newUser = await User.create({
        phoneNumber: phoneStr,
        passwordHash,
        role: userRole, 
        fullName,
        email,
        preferredLanguage: preferredLanguage || 'en',
    });

    // 5. Generate Token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password from response
    const userObject = newUser.toObject();
    const { passwordHash: _, ...userWithoutPassword } = userObject;

    sendResponse(res, 201, "User registered successfully", {
      user: userWithoutPassword,
      token,
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

    // Exclude password from response
    const userObject = user.toObject();
    const { passwordHash: _, ...userWithoutPassword } = userObject;

    sendResponse(res, 200, "Login successful", {
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);
    sendResponse(res, 500, "Internal Server Error");
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
    try {
        const { contact, code } = req.body;
        // Logic to check VerificationCode model...
        sendResponse(res, 501, "Verification logic not yet implemented", { contact, code });
    } catch (error) {
        sendResponse(res, 500, "Internal Server Error");
    }
};
