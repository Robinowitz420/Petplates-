'use client';

import React from 'react';
import MascotAnimation from './MascotAnimation';

export interface ProfessorPurrfessorProps {
  size?: number;
  activity?: 'idle' | 'active';
  className?: string;
}

/**
 * Professor Purrfessor - The Researcher & Recipe Tester
 * Role: Tests ingredients, analyzes compatibility, develops new formulas
 * Accessories: Lab coat, glasses, clipboard
 * Personality: Nerdy, anxious, brilliant, catastrophizes constantly
 * Color: Black/charcoal
 * Activity: Writing notes, examining ingredients
 */
export default function ProfessorPurrfessor({
  size = 120,
  activity = 'idle',
  className = ''
}: ProfessorPurrfessorProps) {
  return (
    <MascotAnimation
      activity={activity}
      personality="anxious"
      className={className}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Professor Purrfessor, the cat scientist mascot"
      >
        {/* Cat body - angular, sleek */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #8B7355 0%, #6B5B4D 100%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Lab coat */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: size * 0.6,
            background: 'white',
            borderRadius: '50% 50% 0 0',
            border: '2px solid #E0E0E0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        
        {/* Glasses */}
        <div
          className="absolute"
          style={{
            top: size * 0.35,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.5,
            height: size * 0.15,
            border: '3px solid #333',
            borderRadius: '20%',
            background: 'rgba(200, 200, 200, 0.3)'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.35,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.2,
            height: size * 0.15,
            borderRight: '2px solid #333'
          }}
        />
        
        {/* Eyes - anxious, wide */}
        <div
          className="absolute"
          style={{
            top: size * 0.38,
            left: size * 0.28,
            width: size * 0.1,
            height: size * 0.1,
            background: '#4A90E2',
            borderRadius: '50%',
            border: '2px solid #000'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.38,
            right: size * 0.28,
            width: size * 0.1,
            height: size * 0.1,
            background: '#4A90E2',
            borderRadius: '50%',
            border: '2px solid #000'
          }}
        />
        
        {/* Nose */}
        <div
          className="absolute"
          style={{
            top: size * 0.5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.08,
            height: size * 0.06,
            background: '#FF69B4',
            borderRadius: '50%'
          }}
        />
        
        {/* Mouth - anxious expression */}
        <div
          className="absolute"
          style={{
            top: size * 0.58,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.15,
            height: size * 0.08,
            borderBottom: '2px solid #000',
            borderRadius: '0 0 50% 50%'
          }}
        />
        
        {/* Clipboard - held in front */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              top: size * 0.5,
              left: size * 0.65,
              width: size * 0.2,
              height: size * 0.35,
              background: '#FFF',
              border: '2px solid #333',
              borderRadius: '4px',
              transform: 'rotate(-10deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {/* Clipboard lines */}
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute left-1 right-1"
                style={{
                  top: `${20 + i * 25}%`,
                  height: '2px',
                  background: '#E0E0E0'
                }}
              />
            ))}
            {/* Clipboard clip */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: size * 0.08,
                height: size * 0.05,
                background: '#C0C0C0',
                borderRadius: '2px'
              }}
            />
          </div>
        )}
      </div>
    </MascotAnimation>
  );
}

