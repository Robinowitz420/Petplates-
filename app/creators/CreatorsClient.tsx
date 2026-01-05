'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  buildPlatformUrl,
  CREATORS,
  PLATFORM_ORDER,
  getCreatorAvatarFallbackUrl,
  getCreatorAvatarUrl,
  type Creator,
  type CreatorFlag,
  type Platform,
} from '@/lib/data/creators';

type ViewMode = 'grouped' | 'all';

type PlatformFilter = 'all' | Platform;

type SortMode = 'recommended' | 'partnership_desc' | 'name_asc';

const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
};

const ALL_TAGS = [
  'education',
  'DIY',
  'holistic',
  'raw-feeding',
  'budget',
  'cats',
  'dogs',
  'birds',
  'reptiles',
  'rabbits',
  'pocket-pets',
  'farm',
  'small-pet',
  'homestead',
  'vet',
  'training',
] as const;

type Tag = (typeof ALL_TAGS)[number];

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function getCreatorPlatforms(creator: Creator): Platform[] {
  const set = new Set<Platform>();
  for (const p of creator.platforms) set.add(p.platform);
  return Array.from(set);
}

function matchesPlatformFilter(creator: Creator, platformFilter: PlatformFilter): boolean {
  if (platformFilter === 'all') return true;
  return creator.platforms.some((p) => p.platform === platformFilter);
}

function matchesNicheFilter(creator: Creator, nicheFilter: string): boolean {
  if (!nicheFilter) return true;
  return normalizeText(creator.niche) === normalizeText(nicheFilter);
}

function matchesSearch(creator: Creator, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = [
    creator.displayName,
    creator.niche,
    creator.whyFollow,
    creator.whatYouLearn,
    creator.platforms.map((p) => p.handle || '').join(' '),
    creator.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

function shouldHideByFlag(creator: Creator, hideCompetitors: boolean, hideAvoid: boolean): boolean {
  if (creator.flag === 'competitor' && hideCompetitors) return true;
  if (creator.flag === 'avoid' && hideAvoid) return true;
  return false;
}

function matchesTagFilter(creator: Creator, tagFilter: Tag | ''): boolean {
  if (!tagFilter) return true;
  if (creator.tags.includes(tagFilter)) return true;
  if (tagFilter === 'small-pet') return creator.tags.includes('pocket-pets');
  if (tagFilter === 'homestead') return creator.tags.includes('farm');
  if (tagFilter === 'vet') {
    const niche = normalizeText(creator.niche);
    return niche.includes('vet') || niche.includes('veterinary');
  }
  if (tagFilter === 'training') {
    const niche = normalizeText(creator.niche);
    return niche.includes('training');
  }
  return false;
}

function sortCreators(creators: Creator[], sortMode: SortMode): Creator[] {
  const copy = [...creators];

  if (sortMode === 'name_asc') {
    copy.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return copy;
  }

  if (sortMode === 'partnership_desc') {
    copy.sort((a, b) => b.partnershipPotential - a.partnershipPotential);
    return copy;
  }

  // recommended: higher partnership first, then name
  copy.sort((a, b) => {
    const diff = b.partnershipPotential - a.partnershipPotential;
    if (diff !== 0) return diff;
    return a.displayName.localeCompare(b.displayName);
  });
  return copy;
}

function PlatformPill({ platform }: { platform: Platform }) {
  return (
    <span className="inline-flex items-center rounded-full border border-orange-400/40 bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-200">
      {PLATFORM_LABEL[platform]}
    </span>
  );
}

function FlagBadge({ flag }: { flag: CreatorFlag }) {
  if (flag === 'none') return null;

  const label = flag === 'competitor' ? 'Competitor' : 'Avoid/Misinformation';
  const className =
    flag === 'competitor'
      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
      : 'border-red-400/50 bg-red-500/15 text-red-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function TagPill({ tag }: { tag: Tag | string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
      [{tag}]
    </span>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  const [avatarSrc, setAvatarSrc] = useState(() => getCreatorAvatarUrl(creator));
  const fallbackAvatarSrc = getCreatorAvatarFallbackUrl(creator);

  return (
    <div className="rounded-2xl border border-surface-highlight bg-surface shadow-lg p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5 flex-shrink-0">
            <Image
              src={avatarSrc}
              alt={`${creator.displayName} avatar`}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => {
                setAvatarSrc(fallbackAvatarSrc);
              }}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground break-words">{creator.displayName}</h3>
            <div className="mt-1 text-sm text-white/70">{creator.niche}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <FlagBadge flag={creator.flag} />
          <div className="text-right">
            <div className="text-xs text-white/60">Partnership potential</div>
            <div className="text-xl font-extrabold text-orange-200">{creator.partnershipPotential}/10</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {getCreatorPlatforms(creator).map((platform) => (
          <PlatformPill key={platform} platform={platform} />
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-semibold tracking-wide text-orange-300">Why follow</div>
          <div className="mt-1 text-sm text-white/80">{creator.whyFollow}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {creator.platforms.map((p, idx) => {
            const url = p.url || buildPlatformUrl(p.platform, p.handle);
            if (!url) return null;

            return (
              <a
                key={`${creator.id}-${p.platform}-${idx}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-100 hover:bg-orange-500/15"
              >
                {PLATFORM_LABEL[p.platform]}
              </a>
            );
          })}
        </div>

        <div>
          <div className="text-xs font-semibold tracking-wide text-orange-300">What you’ll learn</div>
          <div className="mt-1 text-sm text-white/80">{creator.whatYouLearn}</div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-wide text-orange-300">Partnership note</div>
          <div className="mt-1 text-sm text-white/80">{creator.partnershipNote}</div>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap gap-2">
        {creator.tags.map((tag) => (
          <TagPill key={`${creator.id}-${tag}`} tag={tag} />
        ))}
      </div>
    </div>
  );
}

export default function CreatorsClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [nicheFilter, setNicheFilter] = useState('');
  const [minPartnershipPotential, setMinPartnershipPotential] = useState(0);
  const [hideCompetitors, setHideCompetitors] = useState(true);
  const [hideAvoid, setHideAvoid] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [tagFilter, setTagFilter] = useState<Tag | ''>('');

  const nicheOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of CREATORS) set.add(c.niche);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredCreators = useMemo(() => {
    return sortCreators(
      CREATORS.filter((creator) => {
        if (shouldHideByFlag(creator, hideCompetitors, hideAvoid)) return false;
        if (creator.partnershipPotential < minPartnershipPotential) return false;
        if (!matchesSearch(creator, search)) return false;
        if (!matchesPlatformFilter(creator, platformFilter)) return false;
        if (!matchesNicheFilter(creator, nicheFilter)) return false;
        if (!matchesTagFilter(creator, tagFilter)) return false;
        return true;
      }),
      sortMode
    );
  }, [hideAvoid, hideCompetitors, minPartnershipPotential, nicheFilter, platformFilter, search, sortMode, tagFilter]);

  const creatorsByPlatform = useMemo(() => {
    const map: Record<Platform, Creator[]> = {
      tiktok: [],
      instagram: [],
      youtube: [],
      pinterest: [],
    };

    for (const creator of filteredCreators) {
      const uniquePlatforms = getCreatorPlatforms(creator);
      for (const p of uniquePlatforms) {
        map[p].push(creator);
      }
    }

    return map;
  }, [filteredCreators]);

  const totalCount = filteredCreators.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Creators We Love</h1>
          <div className="mt-4 space-y-3 text-white/80 text-lg">
            <p>
              We built Paws &amp; Plates by learning from great educators, creators, and hands-on pet parents.
            </p>
            <p>
              This page is a thank you + discovery list — a place to find voices we’ve learned from, and to help you explore
              topics like nutrition, training, and species-specific care.
            </p>
            <p>
              We’re not affiliated with anyone here unless explicitly stated.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-4 text-sm text-orange-100">
            <div className="font-semibold text-orange-100">Disclaimer</div>
            <div className="mt-2 text-orange-100/90">
              Not affiliated. No endorsement implied. Creator names/avatars remain property of their owners. For edits/removal,
              contact us via{' '}
              <Link href="/contact" className="underline underline-offset-4 hover:text-orange-50">
                /contact
              </Link>
              .
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-surface-highlight bg-surface p-5 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4">
              <label className="block text-sm font-semibold text-white/80">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search creators, niches, tags, handles…"
                className="mt-1 w-full rounded-xl border border-surface-highlight bg-background/30 px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white/80">View</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="mt-1 w-full rounded-xl border border-surface-highlight bg-background/30 px-3 py-2 text-white focus:outline-none"
              >
                <option value="grouped">Grouped</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white/80">Platform</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
                className="mt-1 w-full rounded-xl border border-surface-highlight bg-background/30 px-3 py-2 text-white focus:outline-none"
              >
                <option value="all">All platforms</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="pinterest">Pinterest</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white/80">Species / Niche</label>
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-highlight bg-background/30 px-3 py-2 text-white focus:outline-none"
              >
                <option value="">All niches</option>
                {nicheOptions.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-white/80">Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value as Tag | '')}
                className="mt-1 w-full rounded-xl border border-surface-highlight bg-background/30 px-3 py-2 text-white focus:outline-none"
              >
                <option value="">All tags</option>
                {ALL_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-white/80">
                Min partnership score: <span className="text-orange-200 font-bold">{minPartnershipPotential}</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={minPartnershipPotential}
                onChange={(e) => setMinPartnershipPotential(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-white/80">Sorting</label>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="mt-1 w-full rounded-xl border border-surface-highlight bg-background/30 px-3 py-2 text-white focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="partnership_desc">Partnership potential (high → low)</option>
                <option value="name_asc">Name (A → Z)</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-white/80">Hide competitors</label>
                <button
                  type="button"
                  onClick={() => setHideCompetitors((v) => !v)}
                  className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    hideCompetitors
                      ? 'border-orange-400/50 bg-orange-500/15 text-orange-100'
                      : 'border-surface-highlight bg-background/30 text-white/70'
                  }`}
                >
                  {hideCompetitors ? 'On' : 'Off'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-white/80">Hide avoid/misinformation</label>
                <button
                  type="button"
                  onClick={() => setHideAvoid((v) => !v)}
                  className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    hideAvoid
                      ? 'border-orange-400/50 bg-orange-500/15 text-orange-100'
                      : 'border-surface-highlight bg-background/30 text-white/70'
                  }`}
                >
                  {hideAvoid ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-white/60">
            Showing <span className="text-white/80 font-semibold">{totalCount}</span> creator{totalCount === 1 ? '' : 's'}.
          </div>
        </section>

        <main className="mt-8">
          {totalCount === 0 ? (
            <div className="rounded-2xl border border-surface-highlight bg-surface p-8 text-center text-white/70">
              No creators match your filters.
            </div>
          ) : viewMode === 'all' ? (
            <div className="space-y-4">
              {filteredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {PLATFORM_ORDER.map((platform) => {
                const platformCreators = creatorsByPlatform[platform];
                if (platformCreators.length === 0) return null;

                return (
                  <section key={platform} className="space-y-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{PLATFORM_LABEL[platform]}</h2>
                        <div className="text-sm text-white/60">
                          {platformCreators.length} creator{platformCreators.length === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {platformCreators.map((creator) => (
                        <CreatorCard key={`${platform}-${creator.id}`} creator={creator} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>

        <section className="mt-12 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
          <h2 className="text-2xl font-bold text-foreground">Know a creator we should add?</h2>
          <p className="mt-2 text-white/80">
            Send us a link and a short note on why they’re a great fit.
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-orange-400/50 bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-100 hover:bg-orange-500/25"
            >
              Contact us
            </Link>
          </div>
        </section>

        <section className="mt-6 text-xs text-white/50">
          <div className="font-semibold text-white/60 mb-2">Tag legend</div>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <TagPill key={`legend-${tag}`} tag={tag} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
