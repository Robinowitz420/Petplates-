'use client';

import React from 'react';
import { VillageLevel } from '@/lib/data/villageLevels';
import PuppyPreper from './mascots/PuppyPreper';
import ProfessorPurrfessor from './mascots/ProfessorPurrfessor';
import RobinRedroute from './mascots/RobinRedroute';
import SherlockShells from './mascots/SherlockShells';
import FarmerFluff from './mascots/FarmerFluff';

export interface VillageBuildingsProps {
  villageLevel: VillageLevel;
  activity?: 'idle' | 'active';
  className?: string;
}

/**
 * Renders buildings appropriate for current level
 * Positions mascots near their "work areas"
 */
export default function VillageBuildings({
  villageLevel,
  activity = 'idle',
  className = ''
}: VillageBuildingsProps) {
  const { buildings, mascotStates } = villageLevel;

  // Building positions in a grid layout
  const buildingPositions = [
    { id: 'dog', x: '10%', y: '60%' },
    { id: 'cat', x: '30%', y: '60%' },
    { id: 'bird', x: '50%', y: '50%' },
    { id: 'turtle', x: '70%', y: '60%' },
    { id: 'hamster', x: '90%', y: '60%' }
  ];

  const getMascotComponent = (id: string) => {
    switch (id) {
      case 'dog':
        return <PuppyPreper size={100} activity={activity} />;
      case 'cat':
        return <ProfessorPurrfessor size={100} activity={activity} />;
      case 'bird':
        return <RobinRedroute size={100} activity={activity} />;
      case 'turtle':
        return <SherlockShells size={100} activity={activity} />;
      case 'hamster':
        return <FarmerFluff size={100} activity={activity} />;
      default:
        return null;
    }
  };

  const getBuildingStyle = (level: number) => {
    // Building size and complexity increases with level
    const baseSize = 80 + (level * 10);
    const height = baseSize + (level * 20);
    
    return {
      width: `${baseSize}px`,
      height: `${height}px`,
      borderRadius: level > 2 ? '8px' : '4px',
      boxShadow: level > 1 
        ? '0 8px 16px rgba(0,0,0,0.3)' 
        : '0 4px 8px rgba(0,0,0,0.2)'
    };
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {buildingPositions.map((pos) => {
        // Get building type from buildings array (use first building as default)
        const buildingType = buildings[0] || 'strawHut';
        // Get mascot activity state
        const activityDesc = mascotStates[pos.id] || 'idle';
        const level = villageLevel.id;
        
        return (
          <div
            key={pos.id}
            className="absolute"
            style={{
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Building structure */}
            <div
              className="relative"
              style={getBuildingStyle(level)}
            >
              {/* Building base */}
              <div
                className="absolute inset-0"
                style={{
                  background: level > 2
                    ? 'linear-gradient(135deg, #8B7355 0%, #6B5B4D 100%)'
                    : level > 0
                    ? 'linear-gradient(135deg, #A0826D 0%, #8B7355 100%)'
                    : 'linear-gradient(135deg, #C4A484 0%, #A0826D 100%)',
                  border: '2px solid rgba(0,0,0,0.2)',
                  borderRadius: level > 2 ? '8px' : '4px'
                }}
              />
              
              {/* Building roof/window details based on level */}
              {level > 0 && (
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    height: '30%',
                    background: level > 2
                      ? 'linear-gradient(135deg, #654321 0%, #4A2C1A 100%)'
                      : 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
                    borderRadius: level > 2 ? '8px 8px 0 0' : '4px 4px 0 0'
                  }}
                />
              )}
              
              {/* Windows for higher levels */}
              {level > 1 && (
                <>
                  <div
                    className="absolute"
                    style={{
                      top: '40%',
                      left: '20%',
                      width: '20%',
                      height: '20%',
                      background: 'rgba(255, 255, 200, 0.8)',
                      borderRadius: '2px',
                      border: '1px solid rgba(0,0,0,0.2)'
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      top: '40%',
                      right: '20%',
                      width: '20%',
                      height: '20%',
                      background: 'rgba(255, 255, 200, 0.8)',
                      borderRadius: '2px',
                      border: '1px solid rgba(0,0,0,0.2)'
                    }}
                  />
                </>
              )}
              
              {/* Mascot positioned in front of building */}
              <div
                className="absolute"
                style={{
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10
                }}
                title={activityDesc}
              >
                {getMascotComponent(pos.id)}
              </div>
            </div>
            
            {/* Building label */}
            <div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/80 font-semibold whitespace-nowrap"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {buildingType.split(' ')[0]} {/* First word of building type */}
            </div>
          </div>
        );
      })}
    </div>
  );
}

