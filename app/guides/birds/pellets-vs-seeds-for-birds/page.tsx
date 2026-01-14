import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Pellets vs Seeds for Birds: What to Choose (and Why) | Pet Plates',
  description:
    'Pellets vs seeds: a practical bird-feeding comparison with pros/cons and a simple transition approach that avoids common mistakes.',
  alternates: {
    canonical: '/guides/birds/pellets-vs-seeds-for-birds',
  },
  openGraph: {
    title: 'Pellets vs Seeds for Birds: What to Choose (and Why) | Pet Plates',
    description:
      'Pellets vs seeds: a practical bird-feeding comparison with pros/cons and a simple transition approach that avoids common mistakes.',
    url: absoluteUrl('/guides/birds/pellets-vs-seeds-for-birds'),
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: BASE_URL,
  logo: `${BASE_URL}/images/emojis/Mascots/HeroPics/newLogo.png`,
};

const faqItems = [
  {
    question: 'Are pellets healthier than seeds for birds?',
    answer:
      'It depends on the bird and the product. Many owners use pellets as a consistent base while using seeds strategically. Use trusted species-specific resources when deciding what fits your bird.',
  },
  {
    question: 'Can birds live on seeds alone?',
    answer:
      'Many birds can develop problems on seed-heavy routines long-term. A safer approach is a consistent base plus planned variety, verified with trusted avian sources.',
  },
  {
    question: 'How do I switch my bird from seeds to pellets?',
    answer:
      'Transition slowly. Don’t panic-switch. Change one variable at a time and monitor appetite and weight. If your bird refuses food, seek professional guidance promptly.',
  },
  {
    question: 'What if my bird refuses pellets?',
    answer:
      'Don’t force sudden changes. Try gradual mixing, small steps, and consistent routine. If intake drops, seek professional guidance promptly.',
  },
  {
    question: 'Do different bird species need different diets?',
    answer:
      'Yes. “Bird diet” is not one-size-fits-all. Use species-specific guidance and conservative routines for the safest plan.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Birds', item: `${BASE_URL}/species/birds` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${BASE_URL}/guides/birds` },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Pellets vs seeds for pet birds: what to choose and why',
      item: `${BASE_URL}/guides/birds/pellets-vs-seeds-for-birds`,
    },
  ],
};

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function Page() {
  return (
    <div className="min-h-screen bg-transparent text-foreground py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }} />

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
                <Link href="/species/birds" className="text-orange-300 hover:text-orange-200">
                  Birds
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/guides/birds" className="text-orange-300 hover:text-orange-200">
                  Guides
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">Pellets vs seeds</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Pellets vs seeds for pet birds: what to choose and why
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: choose a consistent base routine first, then add planned variety. The best option is the one your bird will eat
            reliably while staying within safe, species-appropriate boundaries.
          </p>

          <div className="mt-6 bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <div className="flex items-start gap-4">
              <MascotAvatar mascot="professor-purrfessor" showLabel label="Professor Purfessor" />
              <div className="text-gray-200">
                <div className="font-semibold text-orange-300">Mascot owner: Professor Purfessor</div>
                <div className="mt-2">
                  For exotic pets, the internet is… enthusiast-heavy. We’ll stay conservative: aim for safe staples, introduce changes
                  slowly, and verify uncertain foods with a trusted species source.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: the simplest way to decide</h2>
            <p className="text-gray-200">
              Start with what your bird reliably eats, then move gradually toward a more consistent base. Sudden switches create risk.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What pellets do well (and what they don’t)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Pellets can support consistency when used as a stable base.</li>
              <li>Not every bird accepts pellets quickly—transition matters.</li>
              <li>They don’t eliminate the need for planned variety and routine care.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What seed-heavy diets do well (and common pitfalls)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Seeds can be high-reward and help maintain intake for picky birds.</li>
              <li>Seed-heavy routines can drift into imbalance over time.</li>
              <li>“Bird is eating” is not the same as “diet is complete.”</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">A practical transition approach (no panic switching)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Make changes slowly and monitor intake.</li>
              <li>Change one variable at a time.</li>
              <li>If appetite drops or your bird refuses food, seek professional guidance.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How to choose based on your bird’s preferences and routine</h2>
            <p className="text-gray-200">
              The goal is repeatable routine. Pick the base that you can maintain consistently, and then build variety carefully.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">FAQs</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="border border-green-800/40 rounded-xl p-4 bg-surface-lighter">
                  <div className="font-semibold text-orange-300">{item.question}</div>
                  <div className="mt-2 text-gray-200">{item.answer}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Next steps</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/guides/birds/is-avocado-toxic-to-birds"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Is avocado toxic to birds? →
                </Link>
              </li>
              <li>
                <Link href="/guides/birds" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse bird guides →
                </Link>
              </li>
              <li>
                <Link href="/species/birds" className="text-orange-300 hover:text-orange-200 font-medium">
                  Birds hub →
                </Link>
              </li>
              <li>
                <Link href="/nutrition-guide" className="text-orange-300 hover:text-orange-200 font-medium">
                  Nutrition guide →
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ (safety boundaries) →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Reputable avian care resources</li>
              <li>Species-specific care organizations</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
