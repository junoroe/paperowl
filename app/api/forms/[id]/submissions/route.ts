import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getCurrentUser } from '../../../../../lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formId = parseInt(params.id);
    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    // Verify form ownership
    const formCheck = await query(
      'SELECT id FROM forms WHERE id = $1 AND user_id = $2',
      [formId, user.id]
    );

    if (formCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Get submissions
    const result = await query(
      `SELECT id, type, signer_name, signer_email, subject_name, minor_age, 
              signature_url, pdf_url, ip_address, signed_at, status
       FROM submissions
       WHERE form_id = $1
       ORDER BY signed_at DESC`,
      [formId]
    );

    return NextResponse.json({ submissions: result.rows });
  } catch (error: any) {
    console.error('Get submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
