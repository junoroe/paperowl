import { query } from './db';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  successful: boolean
): Promise<void> {
  await query(
    `INSERT INTO login_attempts (email, ip_address, successful)
     VALUES ($1, $2, $3)`,
    [email.toLowerCase(), ipAddress, successful]
  );
}

export async function isAccountLocked(email: string): Promise<boolean> {
  const result = await query(
    `SELECT COUNT(*) as attempt_count
     FROM login_attempts
     WHERE email = $1
     AND successful = false
     AND attempted_at > NOW() - INTERVAL '${LOCKOUT_DURATION_MINUTES} minutes'`,
    [email.toLowerCase()]
  );

  const attemptCount = parseInt(result.rows[0]?.attempt_count || '0');
  return attemptCount >= MAX_ATTEMPTS;
}

export async function clearLoginAttempts(email: string): Promise<void> {
  // Mark old failed attempts as cleared by recording a successful login
  await query(
    `DELETE FROM login_attempts
     WHERE email = $1
     AND attempted_at < NOW() - INTERVAL '1 hour'`,
    [email.toLowerCase()]
  );
}

export async function getRemainingAttempts(email: string): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as attempt_count
     FROM login_attempts
     WHERE email = $1
     AND successful = false
     AND attempted_at > NOW() - INTERVAL '${LOCKOUT_DURATION_MINUTES} minutes'`,
    [email.toLowerCase()]
  );

  const attemptCount = parseInt(result.rows[0]?.attempt_count || '0');
  return Math.max(0, MAX_ATTEMPTS - attemptCount);
}
