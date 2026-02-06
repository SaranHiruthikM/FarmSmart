import { Request, Response } from "express";
/**
 * POST /quality/evaluate
 * Validate grade & compute final price
 */
export declare const evaluateQuality: (req: Request, res: Response) => Promise<void>;
/**
 * GET /quality/price-impact
 * Preview price impact for live updates
 */
export declare const getPriceImpact: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=qualityController.d.ts.map