// components/PetBadges.tsx
// Badge display component for pet profile cards

'use client';

import { useEffect, useState } from 'react';
import type { PetBadges as PetBadgesType, BadgeType } from '@/lib/types/badges';
import { getPetBadges } from '@/lib/utils/badgeStorage';
import { getBadgeDefinition, getTierDefinition } from '@/lib/data/badgeDefinitions';
import Image from 'next/image';
import Tooltip from './Tooltip';

interface PetBadgesProps {
  petId: string;
  userId: string;
  className?: string;
}

export default function PetBadges({ petId, userId, className = '' }: PetBadgesProps) {
  const [badges, setBadges] = useState<PetBadgesType>({ badges: [] });

  useEffect(() => {
    if (!petId || !userId) return;
    
    const loadedBadges = getPetBadges(userId, petId);
    setBadges(loadedBadges);
    
    // Listen for badge updates
    const handleBadgeUpdate = () => {
      const updatedBadges = getPetBadges(userId, petId);
      setBadges(updatedBadges);
    };
    
    window.addEventListener('badgesUpdated', handleBadgeUpdate);
    return () => window.removeEventListener('badgesUpdated', handleBadgeUpdate);
  }, [petId, userId]);

  if (!badges.badges || badges.badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap justify-center gap-6 px-2 ${className}`}>
      {badges.badges.map((badge) => {
        const definition = getBadgeDefinition(badge.type);
        if (!definition) return null;

        // Get icon path (use tier-specific for progressive badges)
        let iconPath = definition.iconPath;
        if (definition.isProgressive && badge.tier) {
          const tierDef = getTierDefinition(badge.type, badge.tier);
          if (tierDef) {
            iconPath = tierDef.iconPath;
          }
        }

        // Get display name
        let displayName = definition.name;
        if (definition.isProgressive && badge.tier) {
          const tierDef = getTierDefinition(badge.type, badge.tier);
          if (tierDef) {
            displayName = tierDef.name;
          }
        }

        // Build tooltip content
        let tooltipContent = `${displayName}\n\n${definition.description}`;
        if (definition.isProgressive && badge.progress !== undefined) {
          tooltipContent += `\n\nProgress: ${badge.progress}`;
          if (badge.nextTierThreshold) {
            tooltipContent += ` / ${badge.nextTierThreshold}`;
          }
        }

        return (
          <Tooltip key={`${badge.type}-${badge.tier || 'single'}`} content={tooltipContent} wide={true}>
            <div className="relative group">
              <div className="w-[141px] h-[141px] rounded-full bg-surface-highlight border border-white/10 flex items-center justify-center hover:scale-110 transition-transform cursor-help">
                <Image
                  src={iconPath}
                  alt={displayName}
                  width={117}
                  height={117}
                  className="object-contain no-invert-badge"
                  unoptimized
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    (e.target as HTMLImageElement).src = '/images/badges/placeholder.png';
                  }}
                />
              </div>
              {/* Progress indicator for progressive badges */}
              {definition.isProgressive && badge.progress !== undefined && badge.nextTierThreshold && (
                <div className="absolute -bottom-2 left-1 right-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 transition-all"
                    style={{
                      width: `${Math.min(100, (badge.progress / badge.nextTierThreshold) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

/**
 * Badge preview grid component (optional, for profile editor)
 */
export function BadgePreviewGrid({ className = '' }: { className?: string }) {
  const { BADGE_DEFINITIONS } = require('@/lib/data/badgeDefinitions');
  const definitions = Object.values(BADGE_DEFINITIONS);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {definitions.map((def: any) => {
        if (def.isProgressive && def.tiers) {
          return def.tiers.map((tier: any) => (
            <div key={`${def.type}-${tier.tier}`} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-surface-highlight border border-white/10 flex items-center justify-center">
                <Image
                  src={tier.iconPath}
                  alt={tier.name}
                  width={48}
                  height={48}
                  className="object-contain opacity-50 no-invert-badge"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/badges/placeholder.png';
                  }}
                />
              </div>
              <p className="text-xs text-gray-400">{tier.name}</p>
            </div>
          ));
        } else {
          return (
            <div key={def.type} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-surface-highlight border border-white/10 flex items-center justify-center">
                <Image
                  src={def.iconPath}
                  alt={def.name}
                  width={48}
                  height={48}
                  className="object-contain opacity-50 no-invert-badge"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/badges/placeholder.png';
                  }}
                />
              </div>
              <p className="text-xs text-gray-400">{def.name}</p>
            </div>
          );
        }
      })}
    </div>
  );
}

