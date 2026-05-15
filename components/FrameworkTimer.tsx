'use client';

import { useState, useEffect, useRef } from 'react';

type Props = {
  isVisible: boolean;
};

export default function FrameworkTimer({ isVisible }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [secondsLeft]);

  if (!isVisible) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  const isWarning = secondsLeft <= 30 && secondsLeft > 0;
  const isDone = secondsLeft === 0;

  if (!isRunning) {
    return (
      <button
        onClick={() => setIsRunning(true)}
        className="framework-timer-start"
      >
        ▶ Start 2-min framework timer
      </button>
    );
  }

  return (
    <div className={`framework-timer ${isWarning ? 'framework-timer-warning' : ''} ${isDone ? 'framework-timer-done' : ''}`}>
      <span className="framework-timer-icon">⏱</span>
      <span className="framework-timer-display">{display}</span>
    </div>
  );
}
