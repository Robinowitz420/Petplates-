import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Can Rabbits Eat Iceberg Lettuce? Risks, Better Greens, and Safer Rotations | Pet Plates',
  description:
    'Can rabbits eat iceberg lettuce? Learn the risks, why it’s often discouraged, and better greens to use for safer variety.',
  alternates: {
    canonical: '/guides/pocket-pets/can-rabbits-eat-iceberg-lettuce',
  },
  openGraph: {
    title: 'Can Rabbits Eat Iceberg Lettuce? Risks, Better Greens, and Safer Rotations | Pet Plates',
    description:
      'Can rabbits eat iceberg lettuce? Learn the risks, why it’s often discouraged, and better greens to use for safer variety.',
    url: absoluteUrl('/guides/pocket-pets/can-rabbits-eat-iceberg-lettuce'),
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
    question: 'Is iceberg lettuce bad for rabbits?',
    answer:
      'Iceberg lettuce is often discouraged as a staple. If you use greens, choose better staple greens and introduce changes slowly so you can observe tolerance.',
  },
  {
    question: 'What lettuce is best for rabbits?',
    answer:
      'Rabbits often do better with a consistent base routine and carefully chosen greens. The best option is the one your rabbit tolerates well as part of a stable routine.',
  },
  {
    question: 'Can baby rabbits eat lettuce?',
    answer:
      'Baby rabbits can be more sensitive. Keep changes conservative and confirm your plan with trusted rabbit care resources or a rabbit-savvy veterinarian.',
  },
  {
    question: 'How much lettuce can rabbits eat?',
    answer:
      'Amounts depend on the rabbit and the rest of the diet. The safest move is slow introduction and consistency, rather than large swings in produce.',
  },
  {
    question: 'What should I do if my rabbit gets diarrhea?',
    answer:
      'Digestive upset in rabbits can become serious. Pause new foods and contact a rabbit-savvy veterinarian for guidance.',
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
      name: 'Can rabbits eat iceberg lettuce? (risks and better greens to use)',
      item: `${BASE_URL}/guides/pocket-pets/can-rabbits-eat-iceberg-lettuce`,
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
              <li className="text-white">Iceberg lettuce</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Can rabbits eat iceberg lettuce? (risks and better greens to use)
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: iceberg lettuce is often discouraged as a staple. If you use greens, use better staples and introduce changes
            slowly.
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
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: is iceberg lettuce safe for rabbits?</h2>
            <p className="text-gray-200">
              Iceberg lettuce is commonly treated as a poor staple choice. A safer plan is a hay-first routine with carefully chosen
              greens.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Why some lettuces are less ideal than others</h2>
            <p className="text-gray-200">Some greens offer less useful nutrition and can be harder on a sensitive digestive routine.</p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Better greens to prioritize</h2>
            <p className="text-gray-200">Pick a small set of tolerated staples and rotate variety intentionally.</p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How to introduce greens safely</h2>
            <p className="text-gray-200">
              Start small. Watch appetite and stool. If anything goes weird, pause the experiment and return to the last known-safe
              routine.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What to do if your rabbit gets digestive upset</h2>
            <p className="text-gray-200">
              Digestive upset can become serious in rabbits. Pause new foods and contact a rabbit-savvy veterinarian.
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
                  href="/guides/pocket-pets/budget-friendly-guinea-pig-grocery-list"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Budget-friendly guinea pig grocery list →
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
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Rabbit-savvy veterinary resources</li>
              <li>Species-specific care resources</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
