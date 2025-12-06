'use client';

import React from 'react';
import { VillageLevel } from '@/lib/data/villageLevels';

export interface VillageBackgroundProps {
  villageLevel: VillageLevel;
  className?: string;
}

/**
 * Renders background based on village level
 * Handles parallax scrolling effects
 */
export default function VillageBackground({
  villageLevel,
  className = ''
}: VillageBackgroundProps) {
  const { palette, environment } = villageLevel;
  
  // Create gradient from palette colors
  const gradientColors = `${palette.background}, ${palette.accent}, ${palette.neutral}`;
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${gradientColors})`,
    minHeight: '400px'
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={backgroundStyle}
      role="img"
      aria-label={`Village background: ${environment}`}
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(to bottom, ${palette.accent} 0%, ${palette.background} 100%)`
        }}
      />
      
      {/* Ground/landscape */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, ${palette.neutral} 0%, transparent 100%)`
        }}
      />
      
      {/* Environmental features as decorative elements */}
      <div className="absolute inset-0 flex items-end justify-center pb-8">
        <div className="text-center text-white/60 text-sm font-semibold">
          {villageLevel.buildings.map((building, idx) => (
            <span key={idx} className="mx-2">
              {building}
            </span>
          ))}
        </div>
      </div>
      
      {/* Parallax layers for depth */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          animation: 'float 20s ease-in-out infinite'
        }}
      />
    </div>
  );
}

