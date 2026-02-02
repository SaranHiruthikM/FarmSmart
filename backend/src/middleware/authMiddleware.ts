import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Map userId from token to id in request user object
    req.user = { id: decoded.userId || decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const farmerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "FARMER") {
    return res.status(403).json({ message: "Farmers only" });
  }
  next();
};
