'use client';

import AlphabetText from '@/components/AlphabetText';

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
        <AlphabetText text={petName} size={36} className="text-foreground" />
      </div>
    </div>
  );
}
