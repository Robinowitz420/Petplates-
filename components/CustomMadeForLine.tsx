'use client';

interface CustomMadeForLineProps {
  petName: string;
}

export default function CustomMadeForLine({ petName }: CustomMadeForLineProps) {
  return (
    <div className="-mt-2 mb-6 text-3xl font-semibold text-orange-300 pl-2 sm:pl-40">
      <span className="text-orange-300">Custom made for:</span>{' '}
      <span className="text-foreground">{petName}</span>
    </div>
  );
}
