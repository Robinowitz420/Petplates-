'use client';

import { useEffect, useState } from 'react';

export default function FireworksAnimation() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; colorClass: string; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate 30 particles in a circle pattern
    const newParticles = Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const colorClasses = ['bg-yellow-400', 'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
      const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
      
      return {
        id: i,
        x,
        y,
        colorClass,
        delay: Math.random() * 0.2,
        duration: 0.6 + Math.random() * 0.4,
      };
    });
    
    setParticles(newParticles);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: particles.map(particle => `
          @keyframes firework-${particle.id} {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px)) scale(1.5);
              opacity: 0;
            }
          }
        `).join('\n')
      }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full ${particle.colorClass}`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `firework-${particle.id} ${particle.duration}s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
