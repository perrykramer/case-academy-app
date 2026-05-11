'use client';

import { useEffect, useRef, useState } from 'react';

interface LessonPlayerProps {
  lessonSlug: string;
  youtubeId: string;
  alreadyCompleted: boolean;
}

// Type declarations for YouTube IFrame API
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function LessonPlayer({ lessonSlug, youtubeId, alreadyCompleted }: LessonPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [marking, setMarking] = useState(false);

  // Tracking state
  const watchSecondsRef = useRef(0);
  const maxPositionRef = useRef(0);
  const lastTickTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const sessionSentRef = useRef(false);

  useEffect(() => {
    // Load YouTube IFrame API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    function createPlayer() {
      if (!containerRef.current) return;

      const YTGlobal = window.YT;
      if (!YTGlobal) return;

      playerRef.current = new YTGlobal.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (event: any) => {
            const state = event.data;

            if (state === YTGlobal.PlayerState.PLAYING) {
              isPlayingRef.current = true;
              lastTickTimeRef.current = Date.now();
            } else {
              // Paused, ended, buffering, etc.
              accumulateWatchTime();
              isPlayingRef.current = false;
            }

            // Track max position reached
            if (playerRef.current) {
              const currentTime = playerRef.current.getCurrentTime();
              if (currentTime > maxPositionRef.current) {
                maxPositionRef.current = currentTime;
              }
            }
          },
        },
      });
    }

    function accumulateWatchTime() {
      if (lastTickTimeRef.current && isPlayingRef.current) {
        const delta = (Date.now() - lastTickTimeRef.current) / 1000;
        watchSecondsRef.current += delta;
        lastTickTimeRef.current = null;
      }
    }

    // Periodically update max position while playing
    const interval = setInterval(() => {
      if (playerRef.current && isPlayingRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime > maxPositionRef.current) {
            maxPositionRef.current = currentTime;
          }
          // Accumulate watch time periodically (in case user closes tab)
          if (lastTickTimeRef.current) {
            const delta = (Date.now() - lastTickTimeRef.current) / 1000;
            watchSecondsRef.current += delta;
            lastTickTimeRef.current = Date.now();
          }
        } catch {
          // Player might not be ready yet
        }
      }
    }, 2000);

    // Wait for API to load, then create player
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    // Send session data when user leaves the page
    function sendSession() {
      if (sessionSentRef.current) return;
      if (watchSecondsRef.current < 1) return; // Don't log empty sessions

      accumulateWatchTime();

      const payload = JSON.stringify({
        lessonSlug,
        watchSeconds: watchSecondsRef.current,
        maxPositionSeconds: maxPositionRef.current,
      });

      // Use sendBeacon for reliable delivery on page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/video-session', blob);
      } else {
        fetch('/api/video-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      }

      sessionSentRef.current = true;
    }

    window.addEventListener('beforeunload', sendSession);
    window.addEventListener('pagehide', sendSession);

    return () => {
      clearInterval(interval);
      sendSession();
      window.removeEventListener('beforeunload', sendSession);
      window.removeEventListener('pagehide', sendSession);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Already destroyed
        }
      }
    };
  }, [youtubeId, lessonSlug]);

  async function markComplete() {
    if (marking || completed) return;
    setMarking(true);
    try {
        const res = await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug }),
      });
      if (res.ok) {
        setCompleted(true);
      } else {
        alert('Could not mark complete. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
    setMarking(false);
  }

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          backgroundColor: 'black',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div
          ref={containerRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      </div>

      <button
        onClick={markComplete}
        disabled={completed || marking}
        style={{
          padding: '12px 24px',
          backgroundColor: completed ? '#10b981' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: completed ? 'default' : 'pointer',
          opacity: marking ? 0.6 : 1,
        }}
      >
        {completed ? '✓ Completed' : marking ? 'Marking...' : 'Mark as Complete'}
      </button>
    </div>
  );
}