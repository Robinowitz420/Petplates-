'use client';

import React from 'react';
import MascotAnimation, { MascotAnimationProps } from './MascotAnimation';

export interface PuppyPreperProps {
  size?: number;
  activity?: 'idle' | 'active';
  className?: string;
}

/**
 * Puppy Prepper - The Chef & Meal-Prep Lead
 * Role: Cooks meals, assembles final bowls, oversees kitchen operations
 * Accessories: Chef hat, wooden spoon, metal mixing bowl
 * Personality: Serious chef energy, impatient, slightly Gordon Ramsay; secretly soft-hearted
 * Color: Light gold
 * Activity: Cooking/stirring motion
 */
export default function PuppyPreper({
  size = 120,
  activity = 'idle',
  className = ''
}: PuppyPreperProps) {
  return (
    <MascotAnimation
      activity={activity}
      personality="stern"
      className={className}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Puppy Prepper, the chef & meal-prep lead mascot"
      >
        {/* Dog body - rounded, friendly shape */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #F4A460 0%, #D2691E 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Chef hat */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2"
          style={{
            width: size * 0.6,
            height: size * 0.3,
            background: 'white',
            borderRadius: '50% 50% 0 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: size * 0.5,
            height: size * 0.15,
            background: 'white',
            borderRadius: '50%'
          }}
        />
        
        {/* Eyes - intense, focused */}
        <div
          className="absolute"
          style={{
            top: size * 0.35,
            left: size * 0.3,
            width: size * 0.08,
            height: size * 0.08,
            background: '#000',
            borderRadius: '50%'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.35,
            right: size * 0.3,
            width: size * 0.08,
            height: size * 0.08,
            background: '#000',
            borderRadius: '50%'
          }}
        />
        
        {/* Nose */}
        <div
          className="absolute"
          style={{
            top: size * 0.45,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.1,
            height: size * 0.08,
            background: '#000',
            borderRadius: '50%'
          }}
        />
        
        {/* Mouth - stern expression */}
        <div
          className="absolute"
          style={{
            top: size * 0.55,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.2,
            height: size * 0.05,
            borderBottom: '2px solid #000',
            borderRadius: '0 0 50% 50%'
          }}
        />
        
        {/* Spoon - held in front */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              top: size * 0.6,
              left: size * 0.7,
              width: size * 0.15,
              height: size * 0.3,
              background: '#C0C0C0',
              borderRadius: '2px',
              transform: 'rotate(-20deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: size * 0.08,
                height: size * 0.08,
                background: '#C0C0C0',
                borderRadius: '50%'
              }}
            />
          </div>
        )}
        
        {/* Mixing bowl - on ground */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              bottom: -size * 0.1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: size * 0.4,
              height: size * 0.15,
              background: '#E8E8E8',
              borderRadius: '0 0 50% 50%',
              border: '2px solid #C0C0C0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        )}
      </div>
    </MascotAnimation>
  );
}

