'use client';

import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';

export interface MascotAnimationProps {
  children: React.ReactNode;
  activity?: 'idle' | 'active';
  personality?: 'stern' | 'anxious' | 'excitable' | 'thoughtful' | 'hyperactive';
  className?: string;
}

/**
 * Base animation component for mascots
 * Handles idle and activity states with React Spring animations
 * Uses GPU-accelerated transforms for performance
 */
export default function MascotAnimation({
  children,
  activity = 'idle',
  personality = 'thoughtful',
  className = ''
}: MascotAnimationProps) {
  // Breathing animation for idle state
  const breathing = useSpring({
    from: { scale: 1 },
    to: { scale: 1.02 },
    loop: { reverse: true },
    config: { duration: 2000 },
    pause: activity !== 'idle'
  });

  // Activity animations based on personality
  const getActivityProps = () => {
    switch (personality) {
      case 'stern':
        return {
          from: { y: 0, rotate: 0 },
          to: [
            { y: -2, rotate: -1 },
            { y: 0, rotate: 0 },
            { y: -2, rotate: 1 },
            { y: 0, rotate: 0 }
          ],
          config: { duration: 1000 }
        };
      case 'anxious':
        return {
          from: { x: 0, y: 0 },
          to: [
            { x: -1, y: -1 },
            { x: 1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: 0 }
          ],
          config: { duration: 600 }
        };
      case 'excitable':
        return {
          from: { y: 0, scale: 1 },
          to: [
            { y: -4, scale: 1.05 },
            { y: 0, scale: 1 },
            { y: -4, scale: 1.05 },
            { y: 0, scale: 1 }
          ],
          config: { duration: 800 }
        };
      case 'thoughtful':
        return {
          from: { y: 0, rotate: 0 },
          to: [
            { y: -1, rotate: -0.5 },
            { y: 0, rotate: 0 },
            { y: -1, rotate: 0.5 },
            { y: 0, rotate: 0 }
          ],
          config: { duration: 2000 }
        };
      case 'hyperactive':
        return {
          from: { y: 0, rotate: 0, scale: 1 },
          to: [
            { y: -3, rotate: -2, scale: 1.03 },
            { y: 0, rotate: 2, scale: 1 },
            { y: -3, rotate: -2, scale: 1.03 },
            { y: 0, rotate: 0, scale: 1 }
          ],
          config: { duration: 500 }
        };
      default:
        return { from: {}, to: {} };
    }
  };

  const activityAnim = useSpring({
    ...getActivityProps(),
    loop: true,
    pause: activity !== 'active'
  });

  // Build transform string based on activity
  if (activity === 'idle') {
    return (
      <animated.div
        style={{
          scale: breathing.scale,
          willChange: 'transform',
          transformOrigin: 'center center'
        }}
        className={`inline-block ${className}`}
      >
        {children}
      </animated.div>
    );
  }

  // Activity animations - use optional chaining and provide defaults
  const style: any = {
    willChange: 'transform',
    transformOrigin: 'center center'
  };

  if ('y' in activityAnim) style.y = activityAnim.y;
  if ('x' in activityAnim) style.x = activityAnim.x;
  if ('rotate' in activityAnim) style.rotate = activityAnim.rotate;
  if ('scale' in activityAnim) style.scale = activityAnim.scale;
  if (!('scale' in activityAnim)) style.scale = 1;

  return (
    <animated.div
      style={style}
      className={`inline-block ${className}`}
    >
      {children}
    </animated.div>
  );
}


