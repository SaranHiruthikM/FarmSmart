"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.verify = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const VerificationCode_1 = __importStar(require("../models/VerificationCode"));
const response_1 = require("../utils/response");
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const saveOTP = async (contact, type) => {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    // Delete existing codes for this user/type
    await VerificationCode_1.default.deleteMany({ contact, type });
    await VerificationCode_1.default.create({
        contact,
        code,
        type,
        expiresAt
    });
    // In a real app, send SMS here
    console.log(`[OTP] Generated for ${contact}: ${code}`);
    return code;
};
const register = async (req, res) => {
    try {
        const { phoneNumber, password, role, fullName, email, preferredLanguage } = req.body;
        // 1. Validate required fields
        if (!phoneNumber || !password) {
            (0, response_1.sendResponse)(res, 400, "Phone number and password are required");
            return;
        }
        const phoneStr = String(phoneNumber);
        const userRole = role ? role.toUpperCase() : 'FARMER';
        // Optional: Validate Role against known values
        const validRoles = ['FARMER', 'BUYER', 'COOPERATIVE', 'ADMIN', 'LOGISTICS'];
        if (!validRoles.includes(userRole)) {
            (0, response_1.sendResponse)(res, 400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
            return;
        }
        // 2. Check if user already exists
        const existingUser = await User_1.default.findOne({ phoneNumber: phoneStr });
        if (existingUser) {
            (0, response_1.sendResponse)(res, 409, "User with this phone number already exists");
            return;
        }
        // 3. Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        // 4. Create User (Unverified initially)
        await User_1.default.create({
            phoneNumber: phoneStr,
            passwordHash,
            role: userRole,
            fullName,
            email,
            preferredLanguage: preferredLanguage || 'en',
            isVerified: false // Explicitly unverified
        });
        // 5. Generate and Save OTP
        await saveOTP(phoneStr, VerificationCode_1.VerificationType.PHONE);
        (0, response_1.sendResponse)(res, 201, "User registered successfully. Please verify OTP.", {
            requiresOtp: true,
            phoneNumber: phoneStr
        });
    }
    catch (error) {
        console.error("Register Error:", error);
        (0, response_1.sendResponse)(res, 500, "Internal Server Error");
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        // 1. Validate required fields
        if (!phoneNumber || !password) {
            (0, response_1.sendResponse)(res, 400, "Phone number and password are required");
            return;
        }
        const phoneStr = String(phoneNumber);
        // 2. Find User
        const user = await User_1.default.findOne({ phoneNumber: phoneStr });
        if (!user) {
            (0, response_1.sendResponse)(res, 401, "Invalid phone number or password");
            return;
        }
        // 3. Verify Password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            (0, response_1.sendResponse)(res, 401, "Invalid phone number or password");
            return;
        }
        // 4. Generate and Save OTP
        await saveOTP(phoneStr, VerificationCode_1.VerificationType.PHONE);
        (0, response_1.sendResponse)(res, 200, "Credentials valid. Please verify OTP.", {
            requiresOtp: true,
            phoneNumber: phoneStr
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        (0, response_1.sendResponse)(res, 500, "Internal Server Error");
    }
};
exports.login = login;
const verify = async (req, res) => {
    try {
        const { contact, code } = req.body;
        if (!contact || !code) {
            (0, response_1.sendResponse)(res, 400, "Contact and code are required");
            return;
        }
        // 1. Find the OTP record
        const record = await VerificationCode_1.default.findOne({
            contact: contact,
            code: code,
            type: VerificationCode_1.VerificationType.PHONE,
            expiresAt: { $gt: new Date() } // check if not expired
        });
        if (!record) {
            (0, response_1.sendResponse)(res, 400, "Invalid or expired OTP");
            return;
        }
        // 2. Find the user
        const user = await User_1.default.findOne({ phoneNumber: contact });
        if (!user) {
            (0, response_1.sendResponse)(res, 404, "User not found");
            return;
        }
        // 3. Mark user as verified
        user.isVerified = true;
        await user.save();
        // 4. Delete the OTP record (prevent reuse)
        await VerificationCode_1.default.deleteOne({ _id: record._id });
        // 5. Generate Token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        // Exclude password from response
        const userObject = user.toObject();
        const { passwordHash: _, ...userWithoutPassword } = userObject;
        (0, response_1.sendResponse)(res, 200, "Verification successful", {
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        console.error("Verify Error:", error);
        (0, response_1.sendResponse)(res, 500, "Internal Server Error");
    }
};
exports.verify = verify;
const resendOtp = async (req, res) => {
    try {
        const { contact } = req.body;
        if (!contact) {
            (0, response_1.sendResponse)(res, 400, "Contact is required");
            return;
        }
        // 1. Check if user exists
        const user = await User_1.default.findOne({ phoneNumber: contact });
        if (!user) {
            (0, response_1.sendResponse)(res, 404, "User not found");
            return;
        }
        // 2. Generate and Save OTP
        await saveOTP(contact, VerificationCode_1.VerificationType.PHONE);
        (0, response_1.sendResponse)(res, 200, "OTP resent successfully");
    }
    catch (error) {
        console.error("Resend OTP Error:", error);
        (0, response_1.sendResponse)(res, 500, "Internal Server Error");
    }
};
exports.resendOtp = resendOtp;
//# sourceMappingURL=authController.js.map