'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface PetVillageWidgetProps {
  initialStreak?: number;
  onStreakChange?: (streak: number) => void;
  className?: string;
}

type VillagePhase = 'struggle' | 'suburbs' | 'paradise' | 'utopia' | 'legendary' | 'mythical' | 'eternal' | 'cosmic' | 'infinite' | 'divine';

const PetVillageWidget: React.FC<PetVillageWidgetProps> = ({
  initialStreak = 0,
  onStreakChange,
  className = ''
}) => {
  const [streak, setStreak] = useState(initialStreak);

  // Calculate current phase
  const getCurrentPhase = (currentStreak: number): VillagePhase => {
    if (currentStreak < 10) return 'struggle';
    if (currentStreak < 20) return 'suburbs';
    if (currentStreak < 30) return 'paradise';
    if (currentStreak < 40) return 'utopia';
    if (currentStreak < 50) return 'legendary';
    if (currentStreak < 60) return 'mythical';
    if (currentStreak < 70) return 'eternal';
    if (currentStreak < 80) return 'cosmic';
    if (currentStreak < 90) return 'infinite';
    return 'divine';
  };

  const phase = getCurrentPhase(streak);

  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    onStreakChange?.(newStreak);
  };

  const decrementStreak = () => {
    const newStreak = Math.max(0, streak - 1);
    setStreak(newStreak);
    onStreakChange?.(newStreak);
  };

  // Get village representation based on phase
  const getVillageDisplay = () => {
    switch (phase) {
      case 'struggle':
        return { emoji: '🏠', color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'suburbs':
        return { emoji: '🏘️', color: 'text-green-600', bg: 'bg-green-50' };
      case 'paradise':
        return { emoji: '🏰', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'utopia':
        return { emoji: '🏛️', color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'legendary':
        return { emoji: '⚔️', color: 'text-red-600', bg: 'bg-red-50' };
      case 'mythical':
        return { emoji: '🐉', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'eternal':
        return { emoji: '⏳', color: 'text-cyan-600', bg: 'bg-cyan-50' };
      case 'cosmic':
        return { emoji: '🌌', color: 'text-violet-600', bg: 'bg-violet-50' };
      case 'infinite':
        return { emoji: '♾️', color: 'text-pink-600', bg: 'bg-pink-50' };
      case 'divine':
        return { emoji: '👑', color: 'text-gold-600', bg: 'bg-yellow-100' };
      default:
        return { emoji: '🏠', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const village = getVillageDisplay();

  return (
    <div className={`flex flex-col items-center justify-center p-2 ${village.bg} rounded-lg border ${className}`}>
      {/* Village Icon */}
      <div className={`text-2xl mb-1 ${village.color}`}>
        {village.emoji}
      </div>

      {/* Streak Counter */}
      <div className="text-center">
        <div className="text-lg font-bold text-gray-800">{streak}</div>
        <div className="text-xs text-gray-600">meals</div>
      </div>

      {/* Phase Indicator */}
      <div className="text-xs font-medium text-gray-700 mt-1 capitalize">
        {phase}
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
        <div
          className="bg-primary-600 h-1 rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(((streak % 10) / 10) * 100, 100)}%`
          }}
        />
      </div>

      {/* Control Buttons */}
      <div className="mt-2 flex gap-1">
        <button
          onClick={decrementStreak}
          className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
          title="Remove meal"
        >
          <Minus size={10} />
        </button>
        <button
          onClick={incrementStreak}
          className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors text-xs"
          title="Save meal"
        >
          <Plus size={10} />
        </button>
      </div>
    </div>
  );
};

export default PetVillageWidget;