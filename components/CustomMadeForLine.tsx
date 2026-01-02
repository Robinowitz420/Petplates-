'use client';

interface CustomMadeForLineProps {
  petName: string;
}

export default function CustomMadeForLine({ petName }: CustomMadeForLineProps) {
  return (
    <div className="mt-2 mb-4 w-full max-w-full">
      <div className="inline-flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-xl sm:text-2xl font-semibold text-orange-300 leading-snug">
        <span className="uppercase tracking-wide text-sm sm:text-base text-orange-200/90">
          Custom made for
        </span>
        <span className="text-foreground text-2xl sm:text-3xl font-bold break-words">
          {petName}
        </span>
      </div>
    </div>
  );
}
