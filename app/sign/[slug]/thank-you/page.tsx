'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ThankYouPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/public/forms/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setForm(data.form);
        }
      } catch (err) {
        console.error('Failed to load form');
      }
    }
    loadForm();
  }, [slug]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px'
      }}>
        <img src="/logo.png" alt="PaperOwl" style={{ width: '120px', marginBottom: '16px' }} />
        <h1 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Thank You!</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          {form?.thank_you_text || 'Your signature has been submitted successfully. A copy has been sent to your email.'}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
          You can close this page now.
        </p>
      </div>
    </div>
  );
}
