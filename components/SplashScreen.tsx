"use client";

import { useEffect, useMemo, useState } from "react";

const MESSAGES = [
  "Initializing CreatorOS Studio AI...",
  "Connecting Secure Database...",
  "Loading AI Models...",
  "Preparing Workspace...",
  "Almost Ready...",
];

const TOTAL_DURATION_MS = 2500;
const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [percent, setPercent] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  // Stable random particle layout — computed once, not on every render.
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    const start = Date.now();
    const messageStep = TOTAL_DURATION_MS / MESSAGES.length;

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / TOTAL_DURATION_MS) * 100));
      setPercent(pct);
      setMessageIndex(Math.min(MESSAGES.length - 1, Math.floor(elapsed / messageStep)));

      if (elapsed >= TOTAL_DURATION_MS) {
        clearInterval(tick);
        setFadingOut(true);
        setTimeout(onComplete, 500); // matches the CSS fade transition duration
      }
    }, 40);

    return () => clearInterval(tick);
  }, [onComplete]);

  const dashOffset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;

  return (
    <div className={`splash-overlay ${fadingOut ? "splash-hidden" : ""}`} role="status" aria-live="polite" aria-label="Loading CreatorOS Studio AI">
      <div className="splash-bg" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="splash-particle"
          style={{
            left: `${p.left}%`,
            bottom: "-20px",
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <div className="splash-card">
        <div className="splash-logo">CreatorOS Studio AI</div>
        <div className="splash-ring-wrap">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <defs>
              <linearGradient id="splashRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <circle className="splash-ring-track" cx="48" cy="48" r={RING_RADIUS} />
            <circle
              className="splash-ring-progress"
              cx="48"
              cy="48"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="splash-percent">{percent}%</span>
        </div>
        <div className="splash-message">{MESSAGES[messageIndex]}</div>
      </div>
    </div>
  );
}
