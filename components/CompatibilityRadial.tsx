'use client';

import { useEffect, useId, useState } from 'react';

interface CompatibilityRadialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  textClassName?: string;
}

export function CompatibilityRadial({
  score,
  size = 120,
  strokeWidth = 10,
  label = '',
  textClassName,
}: CompatibilityRadialProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Smoothly animate the displayed score when the input score changes
  const [animatedScore, setAnimatedScore] = useState(clampedScore);

  useEffect(() => {
    const startValue = animatedScore;
    const targetValue = clampedScore;
    if (startValue === targetValue) return;

    const duration = 600; // ms
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = startValue + (targetValue - startValue) * eased;
      setAnimatedScore(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedScore]);

  const displayScore = Math.round(animatedScore);
  const animatedClamped = Math.max(0, Math.min(100, animatedScore));
  const offset = circumference - (animatedClamped / 100) * circumference;

  const color = clampedScore >= 80 ? '#34d399' : clampedScore >= 60 ? '#fbbf24' : '#fb7185';
  const baseTextClass =
    clampedScore >= 80 ? 'text-emerald-400' : clampedScore >= 60 ? 'text-amber-300' : 'text-rose-400';

  const computedSizeClass = (() => {
    if (textClassName) return textClassName;
    if (size <= 36) return 'text-xs';
    if (size <= 48) return 'text-sm';
    if (size <= 72) return 'text-lg';
    return 'text-2xl';
  })();

  const gradientId = useId();
  const strokeGradientId = `${gradientId}-stroke`;
  const bgGradientId = `${gradientId}-bg`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center rounded-full bg-surface/40 p-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="relative">
            <defs>
              <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <radialGradient id={bgGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(15,23,42,0.9)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0.4)" />
              </radialGradient>
            </defs>

            {/* Soft background disc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius + strokeWidth * 0.6}
              fill={`url(#${bgGradientId})`}
            />

            {/* Tick marks around the ring */}
            {Array.from({ length: 21 }).map((_, index) => {
              const ratio = index / 20;
              const angle = ratio * 360 - 90; // start at top
              const rad = (angle * Math.PI) / 180;
              const inner = radius - strokeWidth * 0.3;
              const outer = inner + (index % 5 === 0 ? 6 : 3);
              const x1 = size / 2 + inner * Math.cos(rad);
              const y1 = size / 2 + inner * Math.sin(rad);
              const x2 = size / 2 + outer * Math.cos(rad);
              const y2 = size / 2 + outer * Math.sin(rad);
              const isMajor = index % 5 === 0;

              return (
                <line
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(148,163,184,0.7)"
                  strokeWidth={isMajor ? 1.4 : 0.9}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Animated score ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth + 1.5}
              fill="transparent"
              opacity={0.25}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />

            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#${strokeGradientId})`}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold ${baseTextClass} ${computedSizeClass}`}>{displayScore}%</span>
            {label ? (
              <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompatibilityRadial;
