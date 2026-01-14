import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Is Avocado Toxic to Birds? Why It’s Dangerous and What To Do | Pet Plates',
  description:
    'Avocado is widely considered dangerous for many birds. Learn why, what to do if ingested, and safer alternatives.',
  alternates: {
    canonical: '/guides/birds/is-avocado-toxic-to-birds',
  },
  openGraph: {
    title: 'Is Avocado Toxic to Birds? Why It’s Dangerous and What To Do | Pet Plates',
    description:
      'Avocado is widely considered dangerous for many birds. Learn why, what to do if ingested, and safer alternatives.',
    url: absoluteUrl('/guides/birds/is-avocado-toxic-to-birds'),
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
    question: 'Can parrots eat avocado?',
    answer:
      'Avocado is commonly considered unsafe for many birds, including parrots. If exposure happens, contact an emergency clinic for guidance.',
  },
  {
    question: 'Are small amounts of avocado safe for birds?',
    answer:
      'Don’t assume small amounts are safe. When the food is widely considered high-risk, treat it as unsafe and seek professional guidance if ingested.',
  },
  {
    question: 'What are signs of avocado toxicity in birds?',
    answer:
      'If your bird seems unwell after ingestion, treat it as urgent. Contact an emergency clinic immediately.',
  },
  {
    question: 'What should I do if my bird ate guacamole?',
    answer:
      'Guacamole adds extra variables (salt, onion-family ingredients, spices). Contact an emergency clinic and share the ingredient list.',
  },
  {
    question: 'Are avocado oils or skins also dangerous?',
    answer:
      'Avoid exposure to avocado in all forms unless a trusted avian source explicitly states otherwise. If ingestion occurred, seek professional guidance.',
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
      name: 'Is avocado toxic to birds? (why it’s dangerous and what to do)',
      item: `${BASE_URL}/guides/birds/is-avocado-toxic-to-birds`,
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
              <li className="text-white">Avocado</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Is avocado toxic to birds? (why it’s dangerous and what to do)
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: avocado is widely considered dangerous for many birds. If ingestion happened, treat it as urgent and contact an
            emergency clinic.
          </p>

          <div className="mt-6 bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <div className="flex items-start gap-4">
              <MascotAvatar mascot="sherlock-shells" showLabel label="Sherlock Shells" />
              <div className="text-gray-200">
                <div className="font-semibold text-orange-300">Mascot owner: Sherlock Shells</div>
                <div className="mt-2">
                  Quick answer: if you’re unsure, treat it as unsafe until confirmed. Risk isn’t only the ingredient—it’s dose, form,
                  and what else it’s paired with.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: is avocado safe for pet birds?</h2>
            <p className="text-gray-200">No. Avocado is commonly treated as unsafe for many birds.</p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Why avocado is considered dangerous for birds</h2>
            <p className="text-gray-200">
              Avocado is treated as a high-risk food in many avian care references. When a food is widely considered dangerous, the
              conservative move is to avoid it entirely.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What to do if your bird ate avocado</h2>
            <div className="text-gray-200 space-y-3">
              <p>
                If you suspect toxicity or a severe reaction, contact an emergency clinic immediately. Online lists are not faster than
                professional care.
              </p>
              <div className="rounded-xl border border-green-800/40 p-4 bg-surface-lighter text-sm text-gray-200">
                This page is educational and not medical advice. If your pet has symptoms or a condition, seek professional guidance.
              </div>
              <ul className="space-y-2">
                <li>Estimate the amount and timing.</li>
                <li>Share the form (fresh avocado, guacamole, oil) and any other ingredients.</li>
                <li>Do not delay if symptoms appear.</li>
              </ul>
            </div>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Cross-contamination risks (guacamole, oils, shared cutting boards)</h2>
            <p className="text-gray-200">
              Safety isn’t just the bowl. It’s the cutting board, the oils, the powders, and the shared utensils. If it can transfer,
              assume it will.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Safer fruit/veg options for bird variety</h2>
            <p className="text-gray-200">
              Variety is good—but only if it’s planned. Rotate one item at a time, keep notes, and verify uncertain foods with a trusted
              avian source.
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
                  href="/guides/birds/pellets-vs-seeds-for-birds"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Pellets vs seeds for pet birds →
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
                  Nutrition guide (context) →
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ (what Pet Plates is and isn’t) →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Reputable avian care resources</li>
              <li>University exotic animal resources</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
