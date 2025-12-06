'use client';

import React from 'react';
import MascotAnimation from './MascotAnimation';

export interface SherlockShellsProps {
  size?: number;
  activity?: 'idle' | 'active';
  className?: string;
}

/**
 * Sherlock Shells - Explorer & Risk Inspector
 * Role: Discovers existing recipes, catalogs new meals, inspects ingredients for problems
 * Accessories: Deerstalker hat, monocle, magnifying glass
 * Personality: Soft-spoken, melancholy, overly thoughtful
 * Color: Green
 * Activity: Slow investigation, examining
 */
export default function SherlockShells({
  size = 120,
  activity = 'idle',
  className = ''
}: SherlockShellsProps) {
  return (
    <MascotAnimation
      activity={activity}
      personality="thoughtful"
      className={className}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Sherlock Shells, the turtle detective mascot"
      >
        {/* Turtle shell - rounded, textured */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #228B22 0%, #006400 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            border: '3px solid #2F4F2F'
          }}
        />
        
        {/* Shell pattern */}
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 72}deg)`,
              width: size * 0.3,
              height: '2px',
              background: '#2F4F2F'
            }}
          />
        ))}
        
        {/* Head */}
        <div
          className="absolute"
          style={{
            top: -size * 0.15,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.4,
            height: size * 0.3,
            background: 'linear-gradient(135deg, #8B7355 0%, #6B5B4D 100%)',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Deerstalker hat */}
        <div
          className="absolute"
          style={{
            top: -size * 0.2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.5,
            height: size * 0.15,
            background: '#4A4A4A',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        <div
          className="absolute"
          style={{
            top: -size * 0.25,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.4,
            height: size * 0.1,
            background: '#4A4A4A',
            borderRadius: '50%'
          }}
        />
        {/* Hat flaps */}
        <div
          className="absolute"
          style={{
            top: -size * 0.15,
            left: -size * 0.1,
            width: size * 0.15,
            height: size * 0.2,
            background: '#4A4A4A',
            borderRadius: '50%',
            transform: 'rotate(-20deg)'
          }}
        />
        <div
          className="absolute"
          style={{
            top: -size * 0.15,
            right: -size * 0.1,
            width: size * 0.15,
            height: size * 0.2,
            background: '#4A4A4A',
            borderRadius: '50%',
            transform: 'rotate(20deg)'
          }}
        />
        
        {/* Monocle */}
        <div
          className="absolute"
          style={{
            top: size * 0.05,
            right: size * 0.15,
            width: size * 0.12,
            height: size * 0.12,
            border: '3px solid #333',
            borderRadius: '50%',
            background: 'rgba(200, 200, 200, 0.3)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.05,
            right: size * 0.15,
            width: size * 0.12,
            height: size * 0.12,
            borderRight: '2px solid #333'
          }}
        />
        
        {/* Eye in monocle */}
        <div
          className="absolute"
          style={{
            top: size * 0.08,
            right: size * 0.18,
            width: size * 0.06,
            height: size * 0.06,
            background: '#4A90E2',
            borderRadius: '50%',
            border: '2px solid #000'
          }}
        />
        
        {/* Other eye */}
        <div
          className="absolute"
          style={{
            top: size * 0.08,
            left: size * 0.2,
            width: size * 0.06,
            height: size * 0.06,
            background: '#4A90E2',
            borderRadius: '50%',
            border: '2px solid #000'
          }}
        />
        
        {/* Mouth - thoughtful expression */}
        <div
          className="absolute"
          style={{
            top: size * 0.2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.15,
            height: size * 0.05,
            borderBottom: '2px solid #000',
            borderRadius: '0 0 50% 50%'
          }}
        />
        
        {/* Magnifying glass - when active */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              top: size * 0.1,
              right: -size * 0.1,
              width: size * 0.2,
              height: size * 0.2,
              border: '3px solid #654321',
              borderRadius: '50%',
              background: 'rgba(200, 200, 200, 0.2)',
              transform: 'rotate(-10deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <div
              className="absolute bottom-0 right-0"
              style={{
                width: size * 0.15,
                height: size * 0.05,
                background: '#654321',
                borderRadius: '2px',
                transform: 'rotate(45deg) translate(20%, -20%)'
              }}
            />
          </div>
        )}
      </div>
    </MascotAnimation>
  );
}

