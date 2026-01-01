import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Budget-Friendly Guinea Pig Grocery List: Staples, Value Swaps, and Where to Buy | Pet Plates',
  description:
    'A budget-friendly guinea pig grocery list with staples, value swaps, and smart pack-size tips to keep costs predictable.',
  alternates: {
    canonical: '/guides/pocket-pets/budget-friendly-guinea-pig-grocery-list',
  },
  openGraph: {
    title: 'Budget-Friendly Guinea Pig Grocery List: Staples, Value Swaps, and Where to Buy | Pet Plates',
    description:
      'A budget-friendly guinea pig grocery list with staples, value swaps, and smart pack-size tips to keep costs predictable.',
    url: absoluteUrl('/guides/pocket-pets/budget-friendly-guinea-pig-grocery-list'),
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
    question: 'What are the cheapest staples to buy for guinea pigs?',
    answer:
      'Staples are the items you buy consistently without overpaying: predictable hay, a consistent pellet base if used, and a repeatable produce routine. The cheapest staple is the one you can restock reliably.',
  },
  {
    question: 'How do I save money on guinea pig supplies?',
    answer:
      'Compare price per unit, choose pack sizes you’ll finish, and avoid expensive “premium” branding when the ingredient category is the same. Keep the routine stable so you don’t waste food.',
  },
  {
    question: 'Are bulk packs worth it?',
    answer:
      'Sometimes. Bulk saves money only if you actually finish it before it goes stale or gets wasted. Storage space is part of the math.',
  },
  {
    question: 'What should I avoid buying because it’s overpriced?',
    answer:
      'Avoid impulse “treat-style” extras that don’t support the base routine. If it’s expensive and inconsistent, it usually isn’t a staple.',
  },
  {
    question: 'Do I need to buy special “guinea pig produce”?',
    answer:
      'No. You need consistency and safe categories. Choose fresh, affordable options and rotate one variable at a time.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Pocket Pets', item: `${BASE_URL}/species/pocket-pets` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${BASE_URL}/guides/pocket-pets` },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Budget-friendly guinea pig grocery list: staples, value swaps, and where to buy',
      item: `${BASE_URL}/guides/pocket-pets/budget-friendly-guinea-pig-grocery-list`,
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
                <Link href="/species/pocket-pets" className="text-orange-300 hover:text-orange-200">
                  Pocket Pets
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/guides/pocket-pets" className="text-orange-300 hover:text-orange-200">
                  Guides
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">Budget grocery list</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Budget-friendly guinea pig grocery list: staples, value swaps, and where to buy
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: the lowest-friction weekly list is the one you can actually restock. Compare price per unit, buy the size you’ll
            finish, and stop paying for hype.
          </p>

          <div className="mt-5 rounded-xl border border-green-800/40 p-4 bg-surface-lighter text-sm text-gray-200">
            Some links may earn Pet Plates a small commission at no extra cost to you. It helps keep the lights on.
          </div>

          <div className="mt-6 bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <div className="flex items-start gap-4">
              <MascotAvatar mascot="robin-redroute" showLabel label="Robin RedRoute" />
              <div className="text-gray-200">
                <div className="font-semibold text-orange-300">Mascot owner: Robin RedRoute</div>
                <div className="mt-2">
                  Price per unit beats sticker price. Always. Compare per-ounce/per-pound, then pick the size you’ll actually finish
                  before it goes stale.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: the lowest-friction weekly shopping list</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Pick staples you can buy consistently.</li>
              <li>Compare price per unit, not sticker price.</li>
              <li>Buy pack sizes you’ll actually finish.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">The “always buy” staples (price-stable picks)</h2>
            <p className="text-gray-200">A stable routine reduces waste. Waste is the silent budget killer.</p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Value swaps when prices spike (same category, cheaper cart)</h2>
            <p className="text-gray-200">
              Out of stock. Happens. Swap within the same category so your cart still clears today—same category, similar value, fewer
              headaches.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How to compare pack sizes and avoid wasted spend</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Compare $/oz or $/lb.</li>
              <li>Account for storage space.</li>
              <li>Don’t buy bulk if it becomes stale or wasted.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What this list is (and is not)</h2>
            <p className="text-gray-200">
              This is a shopping/logistics guide. It is not medical advice. For diet questions, consult a veterinarian and use trusted
              species resources.
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
            <h2 className="text-xl font-bold text-orange-400 mb-4">Related resources</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-orange-300 hover:text-orange-200 font-medium">
                  Privacy policy (closest available disclosure page) →
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/pocket-pets/can-rabbits-eat-iceberg-lettuce"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Can rabbits eat iceberg lettuce? →
                </Link>
              </li>
              <li>
                <Link href="/guides/pocket-pets" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse pocket pet guides →
                </Link>
              </li>
              <li>
                <Link href="/species/pocket-pets" className="text-orange-300 hover:text-orange-200 font-medium">
                  Pocket pets hub →
                </Link>
              </li>
              <li>
                <Link href="/nutrition-guide" className="text-orange-300 hover:text-orange-200 font-medium">
                  Nutrition guide →
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
