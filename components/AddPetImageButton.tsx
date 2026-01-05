'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import AddPetButtonUnclicked from '@/public/images/Buttons/PetShopImage.png';
import AddPetButtonClicked from '@/public/images/Buttons/addpetclicked.png';

interface AddPetImageButtonProps {
  onClick?: () => void;
  interactive?: boolean;
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
  interactive = true,
  size = 'sm',
  width,
  height,
  className = '',
}: AddPetImageButtonProps) {
  const targetSize = SIZE_MAP[size];
  const buttonWidth = width ?? targetSize.width;
  const buttonHeight = height ?? targetSize.height;

  const handleClick = useCallback(() => {
    if (!interactive) return;
    onClick?.();
  }, [interactive, onClick]);

  const containerClassName = `group relative inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40 rounded-2xl border-[4px] border-green-800/80 shadow-lg ${className}`;

  const content = (
    <>
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
    </>
  );

  if (!interactive) {
    return (
      <div className={containerClassName} style={{ width: buttonWidth, height: buttonHeight }} aria-hidden="true">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={containerClassName}
      style={{ width: buttonWidth, height: buttonHeight }}
      aria-label="Add Pet"
    >
      {content}
    </button>
  );
}
