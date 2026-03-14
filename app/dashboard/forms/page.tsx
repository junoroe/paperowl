'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [legalText, setLegalText] = useState('I agree to the terms and conditions stated above.');
  const [introText, setIntroText] = useState('');
  const [thankYouText, setThankYouText] = useState('');

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/forms', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setForms(data.forms);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          legal_text: legalText,
          intro_text: introText || null,
          thank_you_text: thankYouText || null,
        }),
      });

      if (res.ok) {
        setShowCreate(false);
        setTitle('');
        setLegalText('I agree to the terms and conditions stated above.');
        setIntroText('');
        setThankYouText('');
        await loadForms();
      } else {
        alert('Failed to create form');
      }
    } catch (err) {
      alert('Failed to create form');
    } finally {
      setCreating(false);
    }
  }

  async function viewQR(formId: number) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/forms/${formId}/qr`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        
        // Show QR modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:#141414;border-radius:12px;padding:32px;text-align:center;max-width:400px;';
        content.innerHTML = `
          <h2 style="color:#fff;margin-bottom:16px;">Scan to Sign</h2>
          <img src="${data.qr}" style="width:100%;max-width:300px;margin-bottom:16px;"/>
          <p style="color:#999;font-size:14px;margin-bottom:16px;">${data.url}</p>
          <button onclick="this.closest('[style*=fixed]').remove()" style="padding:12px 24px;background:#F26522;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">Close</button>
        `;
        
        modal.appendChild(content);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
      }
    } catch (err) {
      alert('Failed to load QR code');
    }
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
            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Forms</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Create and manage your signing forms
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
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
            + New Form
          </button>
        </div>

        {showCreate && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Create New Form</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: 'var(--muted)' }}>
                  Form Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Event Release Form"
                  style={{
                    width: '100%',
                    background: '#1a1a1a',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: 'var(--muted)' }}>
                  Intro Text (optional)
                </label>
                <textarea
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
                  rows={2}
                  placeholder="Welcome message shown at the top"
                  style={{
                    width: '100%',
                    background: '#1a1a1a',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: 'var(--muted)' }}>
                  Legal Text *
                </label>
                <textarea
                  value={legalText}
                  onChange={(e) => setLegalText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Legal agreement text that signers must accept"
                  style={{
                    width: '100%',
                    background: '#1a1a1a',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', color: 'var(--muted)' }}>
                  Thank You Message (optional)
                </label>
                <textarea
                  value={thankYouText}
                  onChange={(e) => setThankYouText(e.target.value)}
                  rows={2}
                  placeholder="Message shown after successful submission"
                  style={{
                    width: '100%',
                    background: '#1a1a1a',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '12px 24px',
                    background: creating ? '#666' : 'var(--orange)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: creating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {creating ? 'Creating...' : 'Create Form'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {forms.length === 0 ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>No forms yet</p>
            <button
              onClick={() => setShowCreate(true)}
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
              Create Your First Form
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {forms.map((form: any) => (
              <div
                key={form.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>{form.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => window.location.href = `/dashboard/forms/${form.id}/submissions`}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    View Submissions
                  </button>
                  <button
                    onClick={() => viewQR(form.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--orange)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
