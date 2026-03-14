import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { verifyPassword, generateToken } from '../../../../lib/auth';
import { isValidEmail } from '../../../../lib/validation';
import { isAccountLocked, recordLoginAttempt, clearLoginAttempts } from '../../../../lib/account-lockout';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    const locked = await isAccountLocked(email);
    if (locked) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Get IP address for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Find user
    const result = await query(
      `SELECT id, email, password_hash, name, company_name, plan
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Record failed attempt
      await recordLoginAttempt(email, ip, false);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      // Record failed attempt
      await recordLoginAttempt(email, ip, false);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Record successful login and clear failed attempts
    await recordLoginAttempt(email, ip, true);
    await clearLoginAttempts(email);

    const token = generateToken(user);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company_name: user.company_name,
        plan: user.plan,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
