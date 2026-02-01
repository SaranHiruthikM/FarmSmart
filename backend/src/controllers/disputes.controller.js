import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const raiseDisputeSchema = z.object({
  orderId: z.number().int().positive(),
  reason: z.string().min(3)
});

export async function raiseDispute(req, res, next) {
  try {
    const data = raiseDisputeSchema.parse(req.body);

    const dispute = await prisma.dispute.create({
      data: {
        orderId: data.orderId,
        reason: data.reason,
        userId: req.user.id,
        status: 'OPEN'
      }
    });

    return res.status(201).json(dispute);
  } catch (err) {
    return next(err);
  }
}
