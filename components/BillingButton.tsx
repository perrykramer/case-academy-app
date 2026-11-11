'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

type Props = {
  /** '/api/checkout' or '/api/billing-portal' — both return { url } */
  endpoint: '/api/checkout' | '/api/billing-portal';
  children: ReactNode;
  style?: CSSProperties;
  loadingLabel?: string;
};

export function BillingButton({ endpoint, children, style, loadingLabel = 'Redirecting…' }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Something went wrong. Please try again.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        style={{ ...style, opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? loadingLabel : children}
      </button>
      {error && (
        <p role="alert" style={{ color: '#B91C1C', marginTop: 10, fontSize: 13 }}>
          {error}
        </p>
      )}
    </>
  );
}
