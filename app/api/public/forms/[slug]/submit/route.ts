import { NextResponse } from 'next/server';
import { query } from '../../../../../../lib/db';
import { generatePDF } from '../../../../../../lib/pdf';
import { sendSubmissionEmail } from '../../../../../../lib/email';
import { validateFormSubmission, sanitizeInput } from '../../../../../../lib/validation';

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { signer_name, signer_email, signature } = await req.json();

    if (!signer_name || !signer_email || !signature) {
      return NextResponse.json(
        { error: 'Name, email, and signature are required' },
        { status: 400 }
      );
    }

    // Validate all inputs
    const validationErrors = validateFormSubmission(signer_name, signer_email, signature);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, errors: validationErrors },
        { status: 400 }
      );
    }

    // Get form
    const formResult = await query(
      'SELECT id, title, legal_text FROM forms WHERE slug = $1 AND status = \'active\'',
      [params.slug]
    );

    if (formResult.rows.length === 0) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const form = formResult.rows[0];

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create submission record first (sanitize inputs)
    const sanitizedName = sanitizeInput(signer_name, 200);
    const sanitizedEmail = signer_email.toLowerCase().trim();
    
    const result = await query(
      `INSERT INTO submissions 
       (form_id, type, signer_name, signer_email, signature_url, pdf_url, ip_address, user_agent, status)
       VALUES ($1, 'adult', $2, $3, $4, $5, $6, $7, 'processing')
       RETURNING id, signed_at`,
      [form.id, sanitizedName, sanitizedEmail, signature, 'pending', ip, userAgent]
    );

    const submission = result.rows[0];

    // Mark as completed immediately (PDF generation disabled for MVP)
    // TODO: Re-enable PDF generation with proper font paths in Next.js
    await query(
      'UPDATE submissions SET status = $1 WHERE id = $2',
      ['completed', submission.id]
    );

    // Send email notification (if Brevo is configured)
    if (process.env.BREVO_API_KEY) {
      sendSubmissionEmail({
        to: signer_email,
        toName: signer_name,
        subject: `Signature received: ${form.title}`,
        formTitle: form.title,
        pdfUrl: '/submissions/pending', // Placeholder for MVP
        signedAt: new Date(submission.signed_at),
      }).catch((err) => console.error('Email send failed:', err));
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        signed_at: submission.signed_at,
      },
    });
  } catch (error: any) {
    console.error('Submit form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
