'use client';

import React from 'react';
import MascotAnimation from './MascotAnimation';

export interface RobinRedrouteProps {
  size?: number;
  activity?: 'idle' | 'active';
  className?: string;
}

/**
 * Robin Redroute - Packaging & Delivery Specialist
 * Role: Packs orders, prints labels, organizes deliveries, handles inventory and logistics
 * Accessories: Delivery satchel, goggles, tiny pilot cap
 * Personality: Hyper, chatty, easily excited
 * Color: Red
 * Activity: Flying/delivering packages
 */
export default function RobinRedroute({
  size = 120,
  activity = 'idle',
  className = ''
}: RobinRedrouteProps) {
  return (
    <MascotAnimation
      activity={activity}
      personality="excitable"
      className={className}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Robin Redroute, the bird delivery mascot"
      >
        {/* Bird body - round, compact */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Hat */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"
          style={{
            width: size * 0.5,
            height: size * 0.2,
            background: '#4A4A4A',
            borderRadius: '50% 50% 0 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: size * 0.4,
            height: size * 0.12,
            background: '#4A4A4A',
            borderRadius: '50%'
          }}
        />
        
        {/* Goggles */}
        <div
          className="absolute"
          style={{
            top: size * 0.3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.4,
            height: size * 0.12,
            background: '#1A1A1A',
            borderRadius: '50%',
            border: '2px solid #333'
          }}
        />
        <div
          className="absolute"
          style={{
            top: size * 0.32,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.35,
            height: size * 0.1,
            background: 'rgba(100, 150, 200, 0.3)',
            borderRadius: '50%'
          }}
        />
        
        {/* Eyes - excited, wide */}
        <div
          className="absolute"
          style={{
            top: size * 0.33,
            left: size * 0.3,
            width: size * 0.08,
            height: size * 0.08,
            background: '#FFF',
            borderRadius: '50%',
            border: '2px solid #000'
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: '#000',
              borderRadius: '50%',
              transform: 'scale(0.6)'
            }}
          />
        </div>
        <div
          className="absolute"
          style={{
            top: size * 0.33,
            right: size * 0.3,
            width: size * 0.08,
            height: size * 0.08,
            background: '#FFF',
            borderRadius: '50%',
            border: '2px solid #000'
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: '#000',
              borderRadius: '50%',
              transform: 'scale(0.6)'
            }}
          />
        </div>
        
        {/* Beak */}
        <div
          className="absolute"
          style={{
            top: size * 0.45,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.12,
            height: size * 0.08,
            background: '#FFA500',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        />
        
        {/* Wings - spread when active */}
        {activity === 'active' && (
          <>
            <div
              className="absolute"
              style={{
                top: size * 0.4,
                left: -size * 0.15,
                width: size * 0.3,
                height: size * 0.2,
                background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
                borderRadius: '50%',
                transform: 'rotate(-20deg)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
            <div
              className="absolute"
              style={{
                top: size * 0.4,
                right: -size * 0.15,
                width: size * 0.3,
                height: size * 0.2,
                background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
                borderRadius: '50%',
                transform: 'rotate(20deg)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          </>
        )}
        
        {/* Messenger bag */}
        {activity === 'active' && (
          <div
            className="absolute"
            style={{
              bottom: size * 0.2,
              left: size * 0.6,
              width: size * 0.25,
              height: size * 0.3,
              background: '#8B4513',
              borderRadius: '4px',
              border: '2px solid #654321',
              transform: 'rotate(10deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: size * 0.15,
                height: size * 0.08,
                background: '#654321',
                borderRadius: '2px'
              }}
            />
          </div>
        )}
      </div>
    </MascotAnimation>
  );
}

