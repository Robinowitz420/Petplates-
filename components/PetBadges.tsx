// components/PetBadges.tsx
// Badge display component for pet profile cards

'use client';

import { useEffect, useState } from 'react';
import type { PetBadges as PetBadgesType, BadgeType } from '@/lib/types/badges';
import { getPetBadges } from '@/lib/utils/badgeStorage';
import { BADGE_DEFINITIONS, getBadgeDefinition, getTierDefinition } from '@/lib/data/badgeDefinitions';
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

  const unlockedByType = new Map<BadgeType, (typeof badges.badges)[number]>();
  for (const b of badges.badges || []) {
    unlockedByType.set(b.type, b);
  }

  const badgeDefinitions = Object.values(BADGE_DEFINITIONS);
  const topRowBadges = badgeDefinitions.slice(0, 8);
  const bottomRowBadges = badgeDefinitions.slice(8);

  const renderBadge = (definition: any) => {
    const unlockedBadge = unlockedByType.get(definition.type) || null;
    const isUnlocked = Boolean(unlockedBadge);

    const baseTier = definition.isProgressive ? definition.tiers?.[0]?.tier : undefined;
    const effectiveTier = (unlockedBadge?.tier || baseTier) as any;

    const tierDef =
      definition.isProgressive && effectiveTier
        ? getTierDefinition(definition.type, effectiveTier)
        : null;

    const iconPath = tierDef?.iconPath || definition.iconPath;
    const displayName = tierDef?.name || definition.name;

    let tooltipContent = `${displayName}\n\n${definition.description}`;
    if (isUnlocked) {
      if (definition.isProgressive && unlockedBadge?.progress !== undefined) {
        tooltipContent += `\n\nProgress: ${unlockedBadge.progress}`;
        if (unlockedBadge.nextTierThreshold) {
          tooltipContent += ` / ${unlockedBadge.nextTierThreshold}`;
        }
      }
    } else {
      tooltipContent += `\n\nLocked`;
    }

    const key = `${definition.type}-${tierDef?.tier || 'base'}-${isUnlocked ? 'unlocked' : 'locked'}`;

    return (
      <Tooltip key={key} content={tooltipContent} wide={true}>
        <div className="relative group">
          <div
            className={`w-12 h-12 rounded-full bg-surface-highlight border flex items-center justify-center transition-transform cursor-help ${
              isUnlocked
                ? 'border-emerald-200 hover:scale-105'
                : 'border-gray-600 opacity-60'
            }`}
          >
            <Image
              src={iconPath}
              alt={displayName}
              width={28}
              height={28}
              className={`object-contain no-invert-badge ${isUnlocked ? '' : 'grayscale opacity-60'}`}
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/badges/placeholder.png';
              }}
            />
          </div>

          {isUnlocked &&
            definition.isProgressive &&
            unlockedBadge?.progress !== undefined &&
            unlockedBadge?.nextTierThreshold && (
              <div className="absolute -bottom-2 left-1 right-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 transition-all"
                  style={{
                    width: `${Math.min(100, (unlockedBadge.progress / unlockedBadge.nextTierThreshold) * 100)}%`,
                  }}
                />
              </div>
            )}
        </div>
      </Tooltip>
    );
  };

  return (
    <div className={`flex flex-col gap-3 px-2 ${className}`}>
      <div className="flex flex-wrap justify-start gap-3">
        {topRowBadges.map(renderBadge)}
      </div>
      <div className="flex flex-wrap justify-start gap-3" style={{ marginLeft: '31px' }}>
        {bottomRowBadges.map(renderBadge)}
      </div>
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

