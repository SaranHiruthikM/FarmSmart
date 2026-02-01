import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_only_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'token',
  DATABASE_URL: process.env.DATABASE_URL || null,
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 10),
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'FarmSmart <no-reply@farmsmart.local>'
};

export function assertEnvForProd() {
  if (env.NODE_ENV === 'production') {
    requireEnv('JWT_SECRET');
    requireEnv('DATABASE_URL');
  }
}
