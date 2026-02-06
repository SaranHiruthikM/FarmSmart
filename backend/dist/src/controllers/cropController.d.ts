import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
/**
 * POST /crops
 */
export declare const createCrop: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * PUT /crops/:id
 */
export declare const updateCrop: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * DELETE /crops/:id
 */
export declare const deleteCrop: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * PATCH /crops/:id/quantity
 */
export declare const updateQuantity: (req: AuthRequest, res: Response) => Promise<any>;
/**
 * GET /crops
 */
export declare const listCrops: (req: Request, res: Response) => Promise<any>;
/**
 * GET /crops/:id
 */
export declare const getCropById: (req: Request, res: Response) => Promise<any>;
/**
 * GET /crops/my
 */
export declare const myCrops: (req: AuthRequest, res: Response) => Promise<any>;
//# sourceMappingURL=cropController.d.ts.map