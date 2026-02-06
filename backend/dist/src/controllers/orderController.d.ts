import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
/**
 * POST /orders
 */
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * GET /orders/:id
 */
export declare const getOrderById: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * GET /orders/my
 */
export declare const getMyOrders: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * PATCH /orders/:id/status
 */
export declare const updateOrderStatus: (req: AuthRequest, res: Response) => Promise<any>;
//# sourceMappingURL=orderController.d.ts.map