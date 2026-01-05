export {
  buildPlatformUrl,
  CREATORS,
  type Creator,
  type CreatorFlag,
  type Platform,
} from './creatorDirectory';

import type { Creator, Platform } from './creatorDirectory';

function getFirstUnavatarHint(creator: Creator): string | null {
  for (const p of creator.platforms) {
    const handle = typeof p.handle === 'string' ? p.handle.trim() : '';
    if (!handle) continue;

    // User-requested format: platform + handle
    // Example: https://unavatar.io/tiktok/rodneyhabib
    return `${p.platform}/${handle}`;
  }
  return null;
}

export function getCreatorAvatarFallbackUrl(creator: Pick<Creator, 'id' | 'displayName'>): string {
  const seed = encodeURIComponent(creator.id || creator.displayName || 'creator');
  return `https://avatar.vercel.sh/${seed}?size=256`;
}

export function getCreatorAvatarUrl(creator: Creator): string {
  const fallback = getCreatorAvatarFallbackUrl(creator);

  const hint = getFirstUnavatarHint(creator);
  if (!hint) return fallback;

  const fallbackParam = encodeURIComponent(fallback);
  return `https://unavatar.io/${hint}?ttl=7d&fallback=${fallbackParam}`;
}

export const PLATFORM_ORDER: Platform[] = ['tiktok', 'instagram', 'youtube', 'pinterest'];
