// components/EmojiIcon.tsx
// Component to replace emojis with custom emoji images
// 
// This component takes a Unicode emoji and displays the corresponding custom image
// from the emoji mapping system. All emojis are mapped in lib/utils/emojiMapping.ts
// which uses the "best" set (4x4 grid) for primary pet and status emojis, with
// fallbacks to amojis (8x10 grid) and copilot_emojis (10x11 grid) sets.

import Image from 'next/image';
import { getEmojiImage } from '@/lib/utils/emojiMapping';

interface EmojiIconProps {
  emoji: string;
  size?: number;
  className?: string;
}

export default function EmojiIcon({ emoji, size = 24, className = '' }: EmojiIconProps) {
  const imagePath = getEmojiImage(emoji);
  
  return (
    <span 
      className={`inline-block align-middle ${className}`}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle',
        filter: 'none', // Force no filters
        color: 'unset', // Prevent text color inheritance
        mixBlendMode: 'normal', // Prevent blend mode issues
      }}
    >
      <Image
        src={imagePath}
        alt={emoji}
        width={size}
        height={size}
        className="inline-block align-middle"
        style={{ 
          display: 'inline-block', 
          verticalAlign: 'middle',
          imageRendering: 'crisp-edges', // Keep emoji sharp
          filter: 'none', // Prevent any CSS filters from inverting colors
          color: 'unset', // Prevent text color inheritance
          mixBlendMode: 'normal', // Prevent blend mode issues
          WebkitFilter: 'none', // Safari-specific
        }}
        unoptimized // For local images
      />
    </span>
  );
}

