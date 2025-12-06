'use client';

import React from 'react';
import MascotAnimation from './MascotAnimation';

export interface FarmerFluffProps {
  size?: number;
  activity?: 'idle' | 'active';
  className?: string;
}

/**
 * Farmer Fluff - Ingredient Provider & Farm Manager
 * Role: Grows, gathers, and secures all ingredients, manages supply flow & freshness
 * Accessories: Gardening hoe, suspenders, little basket (NO hat per brand bible)
 * Personality: ADHD, upbeat, impulsive, very productive in bursts
 * Color: Dark brown
 * Activity: Rapid harvesting, organizing
 */
export default function FarmerFluff({
  size = 120,
  activity = 'idle',
  className = ''
}: FarmerFluffProps) {
  return (
    <MascotAnimation
      activity={activity}
      personality="hyperactive"
      className={className}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Farmer Fluff, the hamster farmer mascot"
      >
        {/* Hamster body - round, fluffy */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #D2B48C 0%, #BC9A6A 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Suspenders */}
        <div
          className="absolute"
          style={{
            top: size * 0.3,
            left: size * 0.2,
            width: size * 0.1,
            height: size * 0.4,
            background: '#8B4513',
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.3,
            right: size * 0.2,
            width: size * 0.1,
            height: size * 0.4,
            background: '#8B4513',
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        />
        {/* Suspenders cross */}
        <div
          className="absolute"
          style={{
            top: size * 0.3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.2,
            height: size * 0.1,
            background: '#8B4513',
            borderRadius: '2px'
          }}
        />
        
        {/* Eyes - bright, energetic */}
        <div
          className="absolute"
          style={{
            top: size * 0.35,
            left: size * 0.3,
            width: size * 0.1,
            height: size * 0.1,
            background: '#000',
            borderRadius: '50%'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.35,
            right: size * 0.3,
            width: size * 0.1,
            height: size * 0.1,
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
            width: size * 0.08,
            height: size * 0.06,
            background: '#FF69B4',
            borderRadius: '50%'
          }}
        />
        
        {/* Mouth - happy, energetic */}
        <div
          className="absolute"
          style={{
            top: size * 0.52,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.2,
            height: size * 0.1,
            borderBottom: '3px solid #000',
            borderRadius: '0 0 50% 50%'
          }}
        />
        
        {/* Garden hoe - when active */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              top: size * 0.4,
              right: -size * 0.1,
              width: size * 0.15,
              height: size * 0.4,
              background: '#654321',
              borderRadius: '2px',
              transform: 'rotate(-15deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: size * 0.2,
                height: size * 0.08,
                background: '#C0C0C0',
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                borderRadius: '2px'
              }}
            />
          </div>
        )}
        
        {/* Basket - when active */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              bottom: -size * 0.05,
              left: size * 0.1,
              width: size * 0.3,
              height: size * 0.2,
              background: '#8B4513',
              borderRadius: '50% 50% 0 0',
              border: '2px solid #654321',
              transform: 'rotate(-10deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {/* Basket handle */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"
              style={{
                width: size * 0.15,
                height: size * 0.08,
                border: '2px solid #654321',
                borderRadius: '50%',
                background: 'transparent'
              }}
            />
            {/* Basket contents */}
            <div
              className="absolute bottom-2 left-2 right-2"
              style={{
                height: size * 0.1,
                background: 'linear-gradient(135deg, #90EE90 0%, #228B22 100%)',
                borderRadius: '4px'
              }}
            />
          </div>
        )}
      </div>
    </MascotAnimation>
  );
}

