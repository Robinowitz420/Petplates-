// components/MascotAvatar.tsx
// Component for displaying medium-size mascot avatars
// Used in compatibility panels, recipe results, ingredient detail pages

import Image from 'next/image';
import { getMascotFaceImage } from '@/lib/utils/emojiMapping';

export type MascotName = 
  | 'puppy-prepper' 
  | 'professor-purrfessor' 
  | 'sherlock-shells' 
  | 'farmer-fluff' 
  | 'robin-redroute';

interface MascotAvatarProps {
  mascot: MascotName;
  size?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

/**
 * Medium-size mascot avatar for compatibility panels, recipe results, etc.
 * Larger than MascotIcon, used for more prominent displays
 */
export default function MascotAvatar({ 
  mascot, 
  size = 48, 
  className = '',
  showLabel = false,
  label
}: MascotAvatarProps) {
  const imagePath = getMascotFaceImage(mascot);
  
  const mascotLabels: Record<MascotName, string> = {
    'puppy-prepper': 'Puppy Prepper',
    'professor-purrfessor': 'Professor Purrfessor',
    'sherlock-shells': 'Sherlock Shells',
    'farmer-fluff': 'Farmer Fluff',
    'robin-redroute': 'Robin Redroute',
  };
  
  const displayLabel = label || mascotLabels[mascot];
  
  if (!imagePath) {
    // Fallback to emoji if image not found
    const emojiMap: Record<MascotName, string> = {
      'puppy-prepper': '🐕',
      'professor-purrfessor': '🐱',
      'sherlock-shells': '🐢',
      'farmer-fluff': '🐹',
      'robin-redroute': '🐦',
    };
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <span className="text-4xl">{emojiMap[mascot]}</span>
        {showLabel && <span className="text-xs text-gray-600 mt-1">{displayLabel}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span
        style={{ 
          display: 'inline-block', 
          verticalAlign: 'middle',
        }}
      >
        <Image
          src={imagePath}
          alt={`${displayLabel} mascot`}
          width={size}
          height={size}
          className="inline-block align-middle"
          style={{ 
            display: 'inline-block', 
            verticalAlign: 'middle',
            imageRendering: 'crisp-edges',
          }}
          unoptimized
        />
      </span>
      {showLabel && (
        <span className="text-xs text-gray-600 mt-1 text-center">{displayLabel}</span>
      )}
    </div>
  );
}

