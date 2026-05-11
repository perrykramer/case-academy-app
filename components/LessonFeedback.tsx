'use client';

import { useEffect, useState } from 'react';

interface LessonFeedbackProps {
  lessonSlug: string;
}

export default function LessonFeedback({ lessonSlug }: LessonFeedbackProps) {
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Load existing feedback on mount
  useEffect(() => {
    async function loadFeedback() {
      try {
        const res = await fetch(`/api/lesson-feedback?lessonSlug=${lessonSlug}`);
        if (res.ok) {
          const data = await res.json();
          const existing = data.feedback?.feedback_text ?? '';
          setText(existing);
          setOriginalText(existing);
        }
      } catch (err) {
        console.error('Failed to load feedback:', err);
      }
      setLoading(false);
    }
    loadFeedback();
  }, [lessonSlug]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/lesson-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug, feedbackText: text }),
      });
      if (res.ok) {
        setOriginalText(text);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setSaving(false);
  }

  const hasChanges = text !== originalText;

  return (
    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
      <label
        htmlFor="lesson-feedback"
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: '#0f172a',
          marginBottom: '8px',
        }}
      >
        Lesson feedback
      </label>
      <textarea
        id="lesson-feedback"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="(Optional) What worked? What was confusing? What could be improved?"
        disabled={loading}
        rows={4}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          color: '#0f172a',
          backgroundColor: loading ? '#f8fafc' : 'white',
          resize: 'vertical',
          minHeight: '80px',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
        <button
          onClick={save}
          disabled={!hasChanges || saving || loading}
          style={{
            padding: '8px 18px',
            backgroundColor: hasChanges && !saving ? '#0f172a' : '#cbd5e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: hasChanges && !saving ? 'pointer' : 'default',
          }}
        >
          {saving ? 'Saving...' : 'Save feedback'}
        </button>
        {status === 'saved' && (
          <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
            ✓ Saved
          </span>
        )}
        {status === 'error' && (
          <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>
            Could not save — try again
          </span>
        )}
      </div>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
        Only Perry can see your feedback. You can update it anytime by editing and saving again.
      </p>
    </div>
  );
}