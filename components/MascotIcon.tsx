// components/MascotIcon.tsx
// Component for displaying tiny mascot face icons (emoji-style)
// Used in navigation, tooltips, ingredient lists, etc.

import Image from 'next/image';
import { getMascotFaceImage } from '@/lib/utils/emojiMapping';

export type MascotName = 
  | 'puppy-prepper' 
  | 'professor-purrfessor' 
  | 'sherlock-shells' 
  | 'farmer-fluff' 
  | 'robin-redroute';

interface MascotIconProps {
  mascot: MascotName;
  size?: number;
  className?: string;
}

/**
 * Tiny mascot face icon for navigation, tooltips, etc.
 * Uses the mascot face images (not full illustrations)
 */
export default function MascotIcon({ 
  mascot, 
  size = 20, 
  className = '' 
}: MascotIconProps) {
  const imagePath = getMascotFaceImage(mascot);
  
  if (!imagePath) {
    // Fallback to emoji if image not found
    const emojiMap: Record<MascotName, string> = {
      'puppy-prepper': '🐕',
      'professor-purrfessor': '🐱',
      'sherlock-shells': '🐢',
      'farmer-fluff': '🐹',
      'robin-redroute': '🐦',
    };
    return <span className={className}>{emojiMap[mascot]}</span>;
  }
  
  // Determine if the mascot image should be inverted by CSS
  const isMascotInverted = mascot === 'puppy-prepper' || mascot === 'professor-purrfessor';
  
  // Conditionally apply filter: 'none' and WebkitFilter: 'none'
  // We remove the filter: none only for the inverted mascots so CSS can apply the invert filter
  const filterStyle = isMascotInverted ? {} : { filter: 'none', WebkitFilter: 'none' };
  
  return (
    <span 
      className={`inline-block align-middle ${className}`}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle',
        ...filterStyle,
        color: 'unset',
        mixBlendMode: 'normal',
      }}
    >
      <Image
        src={imagePath}
        alt={`${mascot} mascot`}
        width={size}
        height={size}
        className={`inline-block align-middle mascot-icon mascot-${mascot}`}
        style={{ 
          display: 'inline-block', 
          verticalAlign: 'middle',
          imageRendering: 'crisp-edges',
          ...filterStyle,
          color: 'unset',
          mixBlendMode: 'normal',
        }}
        unoptimized
      />
    </span>
  );
}

