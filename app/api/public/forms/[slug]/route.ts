import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await query(
      `SELECT title, slug, intro_text, legal_text, thank_you_text
       FROM forms
       WHERE slug = $1 AND status = 'active'`,
      [params.slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Don't expose internal ID to public
    return NextResponse.json({ form: result.rows[0] });
  } catch (error: any) {
    console.error('Get public form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
