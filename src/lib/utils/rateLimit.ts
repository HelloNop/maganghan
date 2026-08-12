/**
 * Simple in-memory rate limiter for login attempts.
 * Tracks failed attempts per email and blocks after threshold.
 */

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes block

// Cleanup old entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now - entry.lastAttempt > WINDOW_MS * 2) {
      loginAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

export function checkLoginRateLimit(email: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const key = email.toLowerCase().trim();
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently blocked
  if (entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Reset if window expired
  if (now - entry.lastAttempt > WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  return { allowed: remainingAttempts > 0, remainingAttempts, retryAfterSeconds: remainingAttempts <= 0 ? Math.ceil((entry.blockedUntil - now) / 1000) : undefined };
}

export function recordLoginFailure(email: string): void {
  const key = email.toLowerCase().trim();
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.lastAttempt > WINDOW_MS) {
    loginAttempts.set(key, {
      attempts: 1,
      lastAttempt: now,
      blockedUntil: 0,
    });
    return;
  }

  entry.attempts++;
  entry.lastAttempt = now;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
  }
}

export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase().trim());
}
