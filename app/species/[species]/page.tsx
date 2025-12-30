import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guidesIndex } from '@/lib/guides/guidesIndex';

const BASE_URL = 'https://paws-and-plates.vercel.app';

type SpeciesSlug = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

type SpeciesHub = {
  slug: SpeciesSlug;
  title: string;
  subtitle: string;
  intro: string;
  bullets: string[];
};

const speciesHubs: Record<SpeciesSlug, SpeciesHub> = {
  dogs: {
    slug: 'dogs',
    title: 'Fresh meal prep for dogs',
    subtitle: 'Balanced, practical, and built around AAFCO-aligned targets.',
    intro:
      'Learn how to build fresh meals for your dog using evidence-based nutrition principles, ingredient safety guardrails, and portioning that scales to real life.',
    bullets: [
      'What a balanced dog meal needs (protein, fat, fiber, calcium/phosphorus).',
      'Common mistakes (imbalanced minerals, over-supplementing, unsafe ingredients).',
      'How to transition safely and track stool/weight changes.',
    ],
  },
  cats: {
    slug: 'cats',
    title: 'Fresh meal prep for cats',
    subtitle: 'High-protein, moisture-forward, and built for obligate carnivores.',
    intro:
      'Cats have unique nutrition needs. This hub focuses on safe, complete feline meal prep principles and practical routines you can stick to.',
    bullets: [
      'Why protein quality + taurine matter for cats.',
      'Moisture and urinary health considerations.',
      'Safe transitions and how to avoid nutrient gaps.',
    ],
  },
  birds: {
    slug: 'birds',
    title: 'Fresh meal prep for birds',
    subtitle: 'Species-aware feeding routines for parrots and small birds.',
    intro:
      'Bird nutrition varies widely. Use this hub to understand safe foods, routine building, and how to avoid common deficiencies.',
    bullets: [
      'Pellets vs fresh foods: how to balance the routine.',
      'Safe produce and seed/fruit pitfalls.',
      'Calcium, vitamin A, and variety planning.',
    ],
  },
  reptiles: {
    slug: 'reptiles',
    title: 'Fresh meal prep for reptiles',
    subtitle: 'Feeding schedules, calcium/UVB basics, and safe staples.',
    intro:
      'Reptile diets depend on species, life stage, and husbandry. This hub focuses on safe feeding schedules and nutrition fundamentals.',
    bullets: [
      'Staple feeders and rotation planning.',
      'Calcium + vitamin D3 considerations (and the role of UVB).',
      'Common diet mistakes and red flags to watch for.',
    ],
  },
  'pocket-pets': {
    slug: 'pocket-pets',
    title: 'Fresh meal prep for pocket pets',
    subtitle: 'Hay-first fundamentals, safe produce lists, and routine planning.',
    intro:
      'Small mammals like rabbits, guinea pigs, hamsters, and chinchillas thrive on consistent, species-specific routines. This hub keeps it simple and safe.',
    bullets: [
      'Hay-first feeding (where relevant) and why fiber matters.',
      'Produce safety basics and portion control.',
      'Common pitfalls (sugary treats, seed-heavy mixes, mineral imbalance).',
    ],
  },
};

export function generateStaticParams() {
  return (Object.keys(speciesHubs) as SpeciesSlug[]).map((slug) => ({ species: slug }));
}

export const dynamic = 'force-static';

export const revalidate = 3600;

export default async function SpeciesHubPage(props: { params: Promise<{ species: string }> }) {
  const params = await props.params;
  const raw = String(params?.species || '').trim();
  const species = raw as SpeciesSlug;

  const hub = speciesHubs[species];
  if (!hub) notFound();

  const guides = guidesIndex
    .filter((g) => g.category === hub.slug)
    .slice(0, 10);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Paws & Plates',
    url: BASE_URL,
    logo: `${BASE_URL}/images/emojis/Mascots/HeroPics/newLogo.png`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Species',
        item: `${BASE_URL}/species/${hub.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="bg-gradient-to-r from-green-800 to-green-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm text-orange-200 mb-3">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{hub.slug}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{hub.title}</h1>
          <p className="mt-4 text-lg text-orange-200">{hub.subtitle}</p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/?demo=1"
              className="btn btn-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-3 border-orange-400 shadow-xl hover:shadow-2xl transition-all"
            >
              See Example Meals
            </Link>
            <Link href="/sign-up" className="btn btn-lg btn-success">
              Create Free Account
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <section className="bg-surface border border-surface-highlight rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">What you’ll learn</h2>
          <p className="text-white/80 leading-relaxed mb-6">{hub.intro}</p>
          <ul className="space-y-3">
            {hub.bullets.map((b) => (
              <li key={b} className="text-white/80">
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 bg-surface border border-surface-highlight rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Explore guides</h2>
          <p className="text-white/80 mb-6">
            Browse breed/species guides built for this category.
          </p>
          {guides.length > 0 ? (
            <ul className="space-y-2">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={g.slug} className="text-orange-300 hover:text-orange-200 font-semibold">
                    {g.entityName} guide →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70">Guides are coming soon.</p>
          )}
        </section>
      </main>
    </div>
  );
}
