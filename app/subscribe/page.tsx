'use client';

import { useState } from 'react';

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Checkout failed');
      }

      const { url } = await res.json();
      if (!url) throw new Error('No checkout URL returned');

      window.location.href = url;
    } catch (err) {
      console.error('Subscribe error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
        <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          Unlock Case Academy
        </h1>
        <p style={{ color: '#475569', marginBottom: '24px', lineHeight: '1.6' }}>
          The complete consulting interview prep platform — courses, community, and case practice library.
        </p>

        <ul style={{ textAlign: 'left', color: '#334155', lineHeight: '1.8', marginBottom: '28px', paddingLeft: '20px' }}>
          <li>Full case interview methodology course</li>
          <li>50+ practice cases from top MBA programs</li>
          <li>Live Slack community for practice partners</li>
          <li>MBB recruiting deadlines tracker</li>
          <li>Cancel anytime</li>
        </ul>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a' }}>$29<span style={{ fontSize: '16px', fontWeight: 400, color: '#64748b' }}> / month</span></div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: loading ? '#94a3b8' : '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Subscribe — $29/month'}
        </button>

        {error && (
          <p style={{ color: '#dc2626', marginTop: '16px', fontSize: '14px' }}>{error}</p>
        )}

        <p style={{ marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Already a member? <a href="/dashboard" style={{ color: '#0f172a', fontWeight: 500 }}>Go to dashboard</a>
        </p>
      </div>
    </div>
  );
}