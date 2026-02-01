import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateOtpCode, hashOtp } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { signToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['FARMER', 'BUYER', 'ADMIN']).default('FARMER'),
  language: z.string().optional()
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: passwordHash,
        role: data.role,
        language: data.language || req.lang || 'English',
        isVerified: false
      }
    });

    const otp = generateOtpCode();
    await prisma.emailOTP.create({
      data: {
        userId: user.id,
        codeHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000)
      }
    });

    await sendOtpEmail({ to: user.email, name: user.name, otp });

    return res.status(201).json({ message: req.t('auth.register_success') });
  } catch (err) {
    // Prisma unique constraint
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    return next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const data = verifyOtpSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const otpRecord = await prisma.emailOTP.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) return res.status(400).json({ error: req.t('auth.otp_invalid') });
    if (otpRecord.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: req.t('auth.otp_invalid') });

    if (otpRecord.codeHash !== hashOtp(data.otp)) {
      return res.status(400).json({ error: req.t('auth.otp_invalid') });
    }

    await prisma.$transaction([
      prisma.emailOTP.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      })
    ]);

    return res.status(200).json({ message: req.t('auth.verified') });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: req.t('auth.invalid_credentials') });

    const ok = await verifyPassword(data.password, user.password);
    if (!ok) return res.status(401).json({ error: req.t('auth.invalid_credentials') });

    if (!user.isVerified) {
      return res.status(403).json({ error: req.t('auth.not_verified') });
    }

    const token = signToken({ id: user.id, role: user.role, language: user.language });
    setAuthCookie(res, token);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        language: user.language
      }
    });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production'
  });
  return res.status(200).json({ message: 'Logged out' });
}

export async function me(req, res) {
  if (!req.user) return res.status(200).json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, role: true, language: true }
  });
  return res.status(200).json({ user });
}
