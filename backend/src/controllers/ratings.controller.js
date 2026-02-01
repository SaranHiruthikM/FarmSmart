import { z } from 'zod';
import { prisma } from '../db/prisma.js';

const ratingSchema = z.object({
  targetUserId: z.number().int().positive(),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

export async function submitRating(req, res, next) {
  try {
    const data = ratingSchema.parse(req.body);

    if (data.targetUserId === req.user.id) {
      return res.status(400).json({ error: 'You cannot rate yourself.' });
    }

    const target = await prisma.user.findUnique({ where: { id: data.targetUserId } });
    if (!target) return res.status(404).json({ error: 'Target user not found.' });

    const rating = await prisma.rating.create({
      data: {
        scorerId: req.user.id,
        targetUserId: data.targetUserId,
        score: data.score,
        comment: data.comment
      }
    });

    return res.status(201).json(rating);
  } catch (err) {
    return next(err);
  }
}
