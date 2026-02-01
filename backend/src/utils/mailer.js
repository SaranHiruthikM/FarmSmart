import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  // If SMTP is not configured, we fall back to a "console transport".
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    transporterPromise = Promise.resolve(null);
    return transporterPromise;
  }

  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  );
  return transporterPromise;
}

export async function sendOtpEmail({ to, name, otp }) {
  const transporter = await getTransporter();

  const subject = 'Your FarmSmart verification code';
  const text = `Hi ${name || ''}\n\nYour OTP is: ${otp}\n\nThis code expires soon. If you didn't request this, ignore this email.`;

  if (!transporter) {
    // Dev-friendly fallback
    console.log(`\n[DEV OTP] Email to ${to}: ${otp}\n`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text
  });
}
