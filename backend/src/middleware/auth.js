import { env } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';

// Attaches req.user if cookie token is present and valid.
export function attachUser(req, res, next) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, role, language }
  } catch {
    // ignore invalid tokens (treat as logged out)
  }
  return next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: req.t('auth.unauthorized') });
  }
  return next();
}

export function checkRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: req.t('auth.unauthorized') });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: req.t('auth.forbidden') });
    }
    return next();
  };
}
