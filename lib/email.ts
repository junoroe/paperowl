function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  formTitle: string;
  pdfUrl: string;
  signedAt: Date;
}

export async function sendSubmissionEmail(data: EmailData): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.warn('BREVO_API_KEY not set - skipping email');
    return false;
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const fullPdfUrl = `${baseUrl}${data.pdfUrl}`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'PaperOwl',
          email: 'noreply@paperowl.app',
        },
        to: [
          {
            email: data.to,
            name: data.toName,
          },
        ],
        subject: data.subject,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #F26522; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 24px; background: #F26522; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🦉 PaperOwl</h1>
                <p>Your Signed Document</p>
              </div>
              <div class="content">
                <h2>Thank you for signing!</h2>
                <p>Your signed document for <strong>${escapeHtml(data.formTitle)}</strong> has been processed.</p>
                <p><strong>Signed on:</strong> ${data.signedAt.toLocaleString('en-US', { 
                  dateStyle: 'long', 
                  timeStyle: 'short' 
                })}</p>
                <p>You can download your signed PDF document using the link below:</p>
                <p style="text-align: center;">
                  <a href="${fullPdfUrl}" class="button">Download PDF</a>
                </p>
                <p style="font-size: 14px; color: #666;">
                  Keep this email for your records. If you have any questions, please contact the form creator.
                </p>
              </div>
              <div class="footer">
                <p>Powered by PaperOwl | This is an automated message</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Brevo API error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
