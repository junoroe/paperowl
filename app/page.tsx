import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="PaperOwl" style={{ width: '200px', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.5rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          Scan. Sign. Done.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '2rem' }}>
          QR-first signing platform for creators, events, and small businesses
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: 'var(--orange)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none'
          }}
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
