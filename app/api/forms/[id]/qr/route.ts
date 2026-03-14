import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
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

    // Get form and verify ownership
    const result = await query(
      'SELECT slug FROM forms WHERE id = $1 AND user_id = $2',
      [formId, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const form = result.rows[0];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const signUrl = `${baseUrl}/sign/${form.slug}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(signUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({
      url: signUrl,
      qr: qrDataUrl,
    });
  } catch (error: any) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
