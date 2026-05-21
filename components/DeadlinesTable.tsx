'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { C } from '@/lib/tokens';

type Deadline = {
  id: string;
  firm: string;
  program: string;
  deadline: string;
  applyUrl: string;
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function deadlinePillStyle(days: number): CSSProperties {
  if (days <= 14) return { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' };
  if (days <= 30) return { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
  return { background: '#F0F3FB', color: C.muted, border: `1px solid ${C.hairline}` };
}

export function DeadlinesTable({ deadlines }: { deadlines: Deadline[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? deadlines : deadlines.slice(0, 5);
  const remaining = deadlines.length - 5;

  if (deadlines.length === 0) {
    return (
      <div style={{
        background: '#ffffff', border: `1px solid ${C.hairline}`, borderRadius: 10,
        padding: '28px 24px', color: C.muted, fontSize: 14, textAlign: 'center',
      }}>
        Deadlines loading soon
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', border: `1px solid ${C.hairline}`, borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.hairline}` }}>
            {['Firm', 'Program', 'Deadline', 'Apply'].map((h) => (
              <th key={h} style={{
                padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((d, i) => {
            const days = daysUntil(d.deadline);
            const pillStyle = deadlinePillStyle(days);
            return (
              <tr key={d.id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.hairline}` : 'none' }}>
                <td style={{ padding: '13px 16px', fontWeight: 500, color: C.ink }}>{d.firm}</td>
                <td style={{ padding: '13px 16px', color: C.body }}>{d.program}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ ...pillStyle, display: 'inline-block', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20 }}>
                    {d.deadline} · {days}d
                  </span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  {d.applyUrl ? (
                    <a href={d.applyUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: C.ink, fontSize: 18, textDecoration: 'none', lineHeight: 1 }}>
                      ↗
                    </a>
                  ) : (
                    <span style={{ color: C.muted }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {remaining > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', padding: '12px 16px', background: 'transparent',
            border: 'none', borderTop: `1px solid ${C.hairline}`, cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: C.ink,
          }}
        >
          {expanded ? 'Show less' : `Show ${remaining} more`}
        </button>
      )}
    </div>
  );
}