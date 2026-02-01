import crypto from 'crypto';

export function generateOtpCode() {
  // 6-digit numeric OTP
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  return code;
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}
