'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [formId]);

  async function loadSubmissions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/forms/${formId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  function exportCSV() {
    const headers = ['ID', 'Name', 'Email', 'Signed At', 'Status', 'PDF URL'];
    const rows = submissions.map((sub: any) => [
      sub.id,
      sub.signer_name,
      sub.signer_email,
      new Date(sub.signed_at).toLocaleString(),
      sub.status,
      sub.pdf_url || 'pending',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${formId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <button
              onClick={() => router.push('/dashboard/forms')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              ← Back to Forms
            </button>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Submissions</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {submissions.length > 0 && (
            <button
              onClick={exportCSV}
              style={{
                padding: '12px 24px',
                background: 'var(--orange)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Export CSV
            </button>
          )}
        </div>

        {submissions.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>No submissions yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Share your form QR code to start collecting signatures
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1a1a', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Name
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Email
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Signed At
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    PDF
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub: any) => (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '16px', fontSize: '0.875rem' }}>
                      {sub.signer_name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--muted)' }}>
                      {sub.signer_email}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--muted)' }}>
                      {new Date(sub.signed_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: sub.status === 'completed' ? '#10b981' : '#666',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {sub.pdf_url && sub.pdf_url !== 'pending' ? (
                        <a
                          href={sub.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--orange)',
                            color: '#fff',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          Download
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Generating...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
