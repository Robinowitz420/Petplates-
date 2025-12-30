'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface PetCompatibilityBlockProps {
  avatarSrc: string;
  avatarAlt: string;
  spacerClassName: string;
  right: ReactNode;
}

export default function PetCompatibilityBlock({
  avatarSrc,
  avatarAlt,
  spacerClassName,
  right,
}: PetCompatibilityBlockProps) {
  return (
    <div className="flex items-center gap-5">
      <div className="-ml-44 w-[158px] h-[158px] rounded-2xl overflow-hidden border-2 border-green-800 bg-surface-highlight shrink-0">
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          width={158}
          height={158}
          className="w-full h-full object-cover"
        />
      </div>
      <div className={spacerClassName} />
      {right}
    </div>
  );
}
