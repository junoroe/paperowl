'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SignPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/public/forms/${slug}`);
        if (!res.ok) {
          setError('Form not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setForm(data.form);
        setLoading(false);
      } catch (err) {
        setError('Failed to load form');
        setLoading(false);
      }
    }
    loadForm();
  }, [slug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [form]);

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasSignature) {
      alert('Please sign the form');
      return;
    }

    if (!agreed) {
      alert('Please agree to the legal text');
      return;
    }

    setSubmitting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const signatureDataUrl = canvas.toDataURL('image/png');

      const res = await fetch(`/api/public/forms/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signer_name: signerName,
          signer_email: signerEmail,
          signature: signatureDataUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      // Show success page
      router.push(`/sign/${slug}/thank-you`);
    } catch (err: any) {
      alert(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #333',
          borderTop: '4px solid var(--orange)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <p style={{ color: 'var(--muted)' }}>Loading form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Form Not Found</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img src="/logo.png" alt="PaperOwl" style={{ width: '80px' }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{form.title}</h1>
        {form.intro_text && (
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
            {form.intro_text}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--muted)',
              marginBottom: '6px'
            }}>
              Your Name *
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#1a1a1a',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--white)',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--muted)',
              marginBottom: '6px'
            }}>
              Your Email *
            </label>
            <input
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#1a1a1a',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--white)',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{
            background: '#1a1a1a',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '12px' }}>
              {form.legal_text}
            </p>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '0.875rem' }}>I agree to the above terms</span>
            </label>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--muted)',
              marginBottom: '6px'
            }}>
              Signature *
            </label>
            <div style={{ position: 'relative' }}>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  width: '100%',
                  height: '150px',
                  border: '2px dashed var(--border)',
                  borderRadius: '8px',
                  cursor: 'crosshair',
                  touchAction: 'none',
                  background: '#fff'
                }}
              />
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '6px' }}>
              Sign above using your mouse or finger
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !agreed || !hasSignature}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting || !agreed || !hasSignature ? '#666' : 'var(--orange)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting || !agreed || !hasSignature ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Signature'}
          </button>
        </form>
      </div>
    </div>
  );
}
