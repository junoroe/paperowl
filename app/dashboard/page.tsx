'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem('token');
    // Blacklist the token server-side before clearing locally
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (e) {
        // Continue with local cleanup even if API call fails
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="PaperOwl" style={{ width: '40px' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0' }}>
              PaperOwl Dashboard
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </header>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Forms</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Create signing forms and generate QR codes
            </p>
            <a
              href="/dashboard/forms"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'var(--orange)',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Manage Forms
            </a>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            opacity: 0.5
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Submissions</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              View and export signed documents
            </p>
            <div style={{
              padding: '10px 20px',
              background: '#333',
              color: '#888',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              Coming Soon
            </div>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Account</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Plan: <strong style={{ color: 'var(--orange)' }}>{user.plan.toUpperCase()}</strong>
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
