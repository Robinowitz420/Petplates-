'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import AddPetButtonUnclicked from '@/public/images/Buttons/AddPetButtonUnClicked.png';
import AddPetButtonClicked from '@/public/images/Buttons/AddPetButtonClicked.png';

interface AddPetImageButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md';
  width?: number;
  height?: number;
  className?: string;
}

const SIZE_MAP: Record<'sm' | 'md', { width: number; height: number }> = {
  sm: { width: 220, height: 150 },
  md: { width: 280, height: 190 },
};

export default function AddPetImageButton({
  onClick,
  size = 'sm',
  width,
  height,
  className = '',
}: AddPetImageButtonProps) {
  const targetSize = SIZE_MAP[size];
  const buttonWidth = width ?? targetSize.width;
  const buttonHeight = height ?? targetSize.height;

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative inline-flex focus:outline-none focus:ring-4 focus:ring-orange-500/40 rounded-2xl ${className}`}
      style={{ width: buttonWidth, height: buttonHeight }}
      aria-label="Add Pet"
    >
      <Image
        src={AddPetButtonUnclicked}
        alt="+ Add Pet"
        fill
        className="object-cover rounded-2xl shadow-lg transition-opacity duration-75 group-active:opacity-0"
        priority
        sizes={`${buttonWidth}px`}
      />
      <Image
        src={AddPetButtonClicked}
        alt="+ Add Pet (clicked)"
        fill
        className="object-cover rounded-2xl shadow-lg opacity-0 transition-opacity duration-75 group-active:opacity-100"
        priority
        sizes={`${buttonWidth}px`}
      />
      <span className="sr-only">Add Pet</span>
    </button>
  );
}
