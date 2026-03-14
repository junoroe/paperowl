import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

// GET /api/forms - List user's forms
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, title, slug, template_type, status, created_at, updated_at
       FROM forms
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ forms: result.rows });
  } catch (error: any) {
    console.error('List forms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/forms - Create new form
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, template_type, legal_text, intro_text, thank_you_text } = await req.json();

    if (!title || !legal_text) {
      return NextResponse.json(
        { error: 'Title and legal text are required' },
        { status: 400 }
      );
    }

    // Generate slug from title with cryptographically random suffix
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + crypto.randomBytes(4).toString('hex');

    const result = await query(
      `INSERT INTO forms (user_id, title, slug, template_type, legal_text, intro_text, thank_you_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING id, title, slug, template_type, status, created_at`,
      [user.id, title, slug, template_type || null, legal_text, intro_text || null, thank_you_text || null]
    );

    return NextResponse.json({ form: result.rows[0] });
  } catch (error: any) {
    console.error('Create form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
