'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SubmissionPrintPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmission() {
      try {
        // This would need a public API endpoint to fetch submission by ID
        // For now, just show a simple print-ready page
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
    loadSubmission();
  }, [submissionId]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      color: '#000'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      `}} />
      
      <div className="no-print" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '12px 24px',
            background: '#F26522',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Print / Save as PDF
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img src="/logo.png" alt="PaperOwl" style={{ width: '120px' }} />
        <h1 style={{ fontSize: '24px', marginTop: '20px' }}>Signed Document</h1>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p><strong>Submission ID:</strong> {submissionId}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      <p style={{ fontSize: '12px', color: '#666', marginTop: '40px' }}>
        This document was signed electronically via PaperOwl and is legally binding.
      </p>
    </div>
  );
}
