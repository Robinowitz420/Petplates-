'use client';

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
  const offset = circumference - (clampedScore / 100) * circumference;

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

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="relative">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(148,163,184,0.35)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
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
          <span className={`font-bold ${baseTextClass} ${computedSizeClass}`}>{clampedScore}</span>
          {label ? (
            <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CompatibilityRadial;
