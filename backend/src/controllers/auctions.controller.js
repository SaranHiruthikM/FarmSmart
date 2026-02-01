import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const placeBidSchema = z.object({
  bidAmount: z.number().positive(),
  notes: z.string().optional()
});

const manageBidSchema = z.object({
  status: z.enum(['ACCEPTED','REJECTED'])
});

export async function placeBid(req, res, next) {
  try {
    const cropId = Number(req.params.cropId);
    if (!Number.isFinite(cropId)) {
      return res.status(400).json({ error: 'cropId must be a number.' });
    }
    const data = placeBidSchema.parse(req.body);

    const crop = await prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) return res.status(404).json({ error: 'Crop not found.' });
    if (crop.status !== 'AVAILABLE') return res.status(409).json({ error: 'Crop is not available.' });

    const bid = await prisma.bid.create({
      data: {
        cropId,
        buyerId: req.user.id,
        bidAmount: data.bidAmount,
        notes: data.notes,
        status: 'PENDING'
      }
    });

    return res.status(201).json(bid);
  } catch (err) {
    return next(err);
  }
}

export async function manageBid(req, res, next) {
  try {
    const bidId = Number(req.params.bidId);
    if (!Number.isFinite(bidId)) {
      return res.status(400).json({ error: 'bidId must be a number.' });
    }
    const data = manageBidSchema.parse(req.body);

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { crop: true }
    });
    if (!bid) return res.status(404).json({ error: 'Bid not found.' });

    // Only the farmer who owns the crop can accept/reject
    if (bid.crop.farmerId !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed.' });
    }

    const updates = [
      prisma.bid.update({ where: { id: bidId }, data: { status: data.status } })
    ];

    // If accepted, mark crop SOLD and reject other pending bids (optional but practical)
    if (data.status === 'ACCEPTED') {
      updates.push(prisma.crop.update({ where: { id: bid.cropId }, data: { status: 'SOLD' } }));
      updates.push(
        prisma.bid.updateMany({
          where: { cropId: bid.cropId, status: 'PENDING', NOT: { id: bidId } },
          data: { status: 'REJECTED' }
        })
      );
    }

    const [updatedBid] = await prisma.$transaction(updates);

    return res.status(200).json(updatedBid);
  } catch (err) {
    return next(err);
  }
}
