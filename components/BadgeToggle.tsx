// components/BadgeToggle.tsx
// Badge toggle component for demonstrating badges in pet profile

'use client';

import { useState, useEffect } from 'react';
import { BadgeType, BadgeTier, type PetBadges } from '@/lib/types/badges';
import { getPetBadges, unlockBadge, removeBadge } from '@/lib/utils/badgeStorage';
import { BADGE_DEFINITIONS } from '@/lib/data/badgeDefinitions';
import Image from 'next/image';

interface BadgeToggleProps {
  petId: string;
  userId: string;
  onBadgeChange?: () => void;
}

export default function BadgeToggle({ petId, userId, onBadgeChange }: BadgeToggleProps) {
  const [badges, setBadges] = useState<PetBadges>({ badges: [] });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!petId || !userId) return;
    const loadedBadges = getPetBadges(userId, petId);
    setBadges(loadedBadges);
  }, [petId, userId]);

  const handleToggleBadge = (badgeType: BadgeType, tier?: BadgeTier) => {
    const existingBadge = badges.badges.find(b => b.type === badgeType);
    
    if (existingBadge) {
      // Remove badge
      removeBadge(userId, petId, badgeType);
    } else {
      // Add badge
      unlockBadge(userId, petId, badgeType, tier);
    }
    
    // Refresh badges
    const updatedBadges = getPetBadges(userId, petId);
    setBadges(updatedBadges);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('badgesUpdated'));
    
    // Trigger refresh in parent
    if (onBadgeChange) {
      onBadgeChange();
    }
  };

  const handleToggleTier = (badgeType: BadgeType, tier: BadgeTier) => {
    const existingBadge = badges.badges.find(b => b.type === badgeType);
    
    if (existingBadge && existingBadge.tier === tier) {
      // Remove badge if clicking the same tier
      removeBadge(userId, petId, badgeType);
    } else {
      // Unlock with specific tier
      unlockBadge(userId, petId, badgeType, tier);
    }
    
    // Refresh badges
    const updatedBadges = getPetBadges(userId, petId);
    setBadges(updatedBadges);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('badgesUpdated'));
    
    if (onBadgeChange) {
      onBadgeChange();
    }
  };

  const hasBadge = (badgeType: BadgeType, tier?: BadgeTier): boolean => {
    const badge = badges.badges.find(b => b.type === badgeType);
    if (!badge) return false;
    if (tier) {
      return badge.tier === tier;
    }
    return true;
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-orange-400 hover:text-orange-300 underline mb-2"
      >
        {isExpanded ? '▼ Hide Badge Demo' : '▶ Demo Badges'}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-3 p-3 bg-surface rounded border border-surface-highlight">
          <p className="text-xs text-gray-400 mb-2">Toggle badges on/off to see them displayed:</p>
          
          {Object.values(BADGE_DEFINITIONS).map((def) => {
            const badge = badges.badges.find(b => b.type === def.type);
            const isUnlocked = badge !== undefined;
            
            if (def.isProgressive && def.tiers) {
              // Progressive badge with tiers
              return (
                <div key={def.type} className="pb-2 border-b border-surface-highlight last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isUnlocked}
                      onChange={() => handleToggleBadge(def.type)}
                      className="w-4 h-4"
                    />
                    <label className="text-xs font-semibold text-gray-300 flex-1">
                      {def.name}
                    </label>
                    {isUnlocked && (
                      <span className="text-xs text-gray-500">
                        ({badge?.tier || 'bronze'})
                      </span>
                    )}
                  </div>
                  
                  {isUnlocked && (
                    <div className="ml-6 space-y-1">
                      <p className="text-xs text-gray-400 mb-1">Tiers:</p>
                      <div className="flex flex-wrap gap-2">
                        {def.tiers.map((tierDef) => (
                          <button
                            key={tierDef.tier}
                            onClick={() => handleToggleTier(def.type, tierDef.tier)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                              hasBadge(def.type, tierDef.tier)
                                ? 'bg-orange-900/30 border-orange-500/50 text-orange-300'
                                : 'bg-surface-highlight border-surface-highlight text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <div className="w-4 h-4 rounded bg-surface-highlight border border-white/10 flex items-center justify-center">
                              {hasBadge(def.type, tierDef.tier) && (
                                <span className="text-xs">✓</span>
                              )}
                            </div>
                            {tierDef.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              // Single-tier badge
              return (
                <div key={def.type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isUnlocked}
                    onChange={() => handleToggleBadge(def.type)}
                    className="w-4 h-4"
                  />
                  <div className="w-6 h-6 rounded bg-surface-highlight border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={def.iconPath}
                      alt={def.name}
                      width={20}
                      height={20}
                      className="object-contain no-invert-badge"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <label className="text-xs text-gray-300 flex-1 cursor-pointer">
                    {def.name}
                  </label>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

