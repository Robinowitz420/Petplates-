'use client';

interface CompatibilityRadialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function CompatibilityRadial({
  score,
  size = 120,
  strokeWidth = 10,
  label = 'Compatibility',
}: CompatibilityRadialProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clampedScore / 100) * circumference;

  const colorClass =
    clampedScore >= 80 ? 'text-emerald-400' : clampedScore >= 60 ? 'text-amber-300' : 'text-rose-400';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-500 ease-out`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass}`}>{clampedScore}%</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default CompatibilityRadial;
