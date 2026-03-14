import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { hashPassword, generateToken } from '../../../../lib/auth';
import { validateSignupInput, sanitizeInput } from '../../../../lib/validation';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate input
    const validationErrors = validateSignupInput(email, password, name);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, errors: validationErrors },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      // Generic message to prevent user enumeration
      return NextResponse.json(
        { error: 'Unable to create account. Please try a different email or log in.' },
        { status: 400 }
      );
    }

    // Create user (sanitize name input)
    const passwordHash = await hashPassword(password);
    const sanitizedName = name ? sanitizeInput(name, 100) : null;
    const result = await query(
      `INSERT INTO users (email, password_hash, name, plan)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, company_name, plan`,
      [email.toLowerCase(), passwordHash, sanitizedName, 'free']
    );

    const user = result.rows[0];
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
