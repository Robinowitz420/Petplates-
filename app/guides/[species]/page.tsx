import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { guidesIndex } from '@/lib/guides/guidesIndex';
import { type GuideCategory } from '@/lib/guides/guidesTemplates';
import { TEN_PAGE_GUIDES } from '@/lib/seo/tenPageGuides';
import { absoluteUrl } from '@/lib/siteUrl';

const categories: GuideCategory[] = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'];

const categoryLabels: Record<GuideCategory, string> = {
  dogs: 'Dogs',
  cats: 'Cats',
  birds: 'Birds',
  reptiles: 'Reptiles',
  'pocket-pets': 'Pocket Pets',
};

export async function generateMetadata({ params }: { params: { species: string } }): Promise<Metadata> {
  const raw = String(params?.species || '').trim();
  const species = raw as GuideCategory;

  if (!categories.includes(species)) {
    return {};
  }

  const title = `${categoryLabels[species]} Guides - Paws & Plates`;
  const description = `Browse feeding and nutrition guides for ${categoryLabels[species]}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/guides/${species}`,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/guides/${species}`),
    },
  };
}

export default function GuidesSpeciesHubPage({ params }: { params: { species: string } }) {
  const raw = String(params?.species || '').trim();
  const species = raw as GuideCategory;

  if (!categories.includes(species)) {
    notFound();
  }

  const featured = TEN_PAGE_GUIDES.filter((g) => g.species === species);

  const guides = guidesIndex
    .filter((g) => g.category === species)
    .slice()
    .sort((a, b) => a.entityName.localeCompare(b.entityName, 'en'));

  return (
    <div className="min-h-screen bg-transparent text-foreground py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-300 mb-3">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="text-orange-300 hover:text-orange-200">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href={`/species/${species}`} className="text-orange-300 hover:text-orange-200">
                  {categoryLabels[species]}
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">Guides</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{categoryLabels[species]} guides</h1>
          <p className="mt-4 text-gray-300">Browse our feeding and nutrition guides for {categoryLabels[species]}.</p>
        </div>

        {featured.length > 0 ? (
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50 mb-6">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Featured guides</h2>
            <ul className="space-y-3">
              {featured.map((g) => (
                <li key={g.slug}>
                  <Link href={g.slug} className="text-orange-300 hover:text-orange-200 font-semibold">
                    {g.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {guides.length > 0 ? (
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <ul className="space-y-3">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={g.slug} className="text-orange-300 hover:text-orange-200 font-semibold">
                    {g.entityName} guide →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-white/70">Guides are coming soon.</p>
        )}
      </div>
    </div>
  );
}
