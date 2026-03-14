import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '../../../../lib/db';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const user = verifyToken(token);
    if (!user) {
      // Token already invalid — still return success (idempotent logout)
      return NextResponse.json({ success: true });
    }

    // Hash the token for storage (never store raw tokens)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Calculate token expiry (7 days from now as upper bound)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Add to blacklist
    await query(
      `INSERT INTO token_blacklist (token_hash, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (token_hash) DO NOTHING`,
      [tokenHash, user.id, expiresAt]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
