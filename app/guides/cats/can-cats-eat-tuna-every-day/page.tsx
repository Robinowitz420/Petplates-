import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Can Cats Eat Tuna Every Day? Risks, Safer Frequency, and Better Options | Pet Plates',
  description:
    'Can cats eat tuna daily? Learn the key risks, warning signs, and safer ways to use tuna as an occasional option.',
  alternates: {
    canonical: '/guides/cats/can-cats-eat-tuna-every-day',
  },
  openGraph: {
    title: 'Can Cats Eat Tuna Every Day? Risks, Safer Frequency, and Better Options | Pet Plates',
    description:
      'Can cats eat tuna daily? Learn the key risks, warning signs, and safer ways to use tuna as an occasional option.',
    url: absoluteUrl('/guides/cats/can-cats-eat-tuna-every-day'),
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
    question: 'Is canned tuna safe for cats?',
    answer:
      'Tuna is sometimes used as an occasional food, but it’s not a complete long-term diet. If you use tuna, treat it as a limited option and keep the rest of the routine nutritionally consistent.',
  },
  {
    question: 'Can kittens eat tuna?',
    answer:
      'Kittens have specific growth needs. If you’re considering tuna for a kitten, keep it occasional and confirm your kitten’s overall diet plan with a qualified animal health professional.',
  },
  {
    question: 'Is tuna in water better than tuna in oil for cats?',
    answer:
      'Oil-based preparations can add extra fat and are often less ideal. If you choose tuna, simpler preparations are typically safer than heavily seasoned or oily options.',
  },
  {
    question: 'What happens if a cat eats tuna every day?',
    answer:
      'Daily tuna can create imbalance and encourage picky eating. If tuna has become the default, transition slowly back to a consistent, complete routine.',
  },
  {
    question: 'What are safer alternatives to tuna for cats?',
    answer:
      'Use a rotation of complete, consistent protein options that your cat tolerates well. The key is repeatability and avoiding frequent chaos-switching.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Cats', item: `${BASE_URL}/species/cats` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${BASE_URL}/guides/cats` },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Can cats eat tuna every day? (risks, safer frequency, and what to choose instead)',
      item: `${BASE_URL}/guides/cats/can-cats-eat-tuna-every-day`,
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
                <Link href="/species/cats" className="text-orange-300 hover:text-orange-200">
                  Cats
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/guides/cats" className="text-orange-300 hover:text-orange-200">
                  Guides
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">Tuna</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Can cats eat tuna every day? (risks, safer frequency, and what to choose instead)
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: daily tuna is usually not a great plan. Risk depends on the form and what it displaces in the diet. Keep it
            occasional, not a default.
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
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: daily tuna and why it’s complicated</h2>
            <p className="text-gray-200">
              Tuna can be tempting because cats like it. The problem is that “likes it” is not the same as “balanced.” Use tuna as a
              limited tool, not the foundation.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">The main risks with frequent tuna</h2>
            <ul className="space-y-2 text-gray-200">
              <li>It can crowd out a consistent, complete routine.</li>
              <li>It can train picky eating (demanding the high-reward option).</li>
              <li>Preparation matters: oil, salt, and seasonings add complications.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Signs your cat isn’t tolerating it well</h2>
            <p className="text-gray-200">
              Watch for digestive upset or any unusual behavior. If your cat has a medical condition, confirm diet changes with your
              professional support team.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Safer ways to use tuna (if you choose to)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Use small amounts, occasionally, not daily.</li>
              <li>Prefer simple preparations over seasoned/oily products.</li>
              <li>Keep the rest of the routine consistent so tuna doesn’t become the only “accepted” food.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Better protein options to rotate</h2>
            <p className="text-gray-200">
              Rotation works when it’s planned. Pick a few tolerated staples and rotate intentionally, one variable at a time.
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
                  href="/guides/cats/homemade-cat-food-for-kidney-disease"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Homemade cat food for kidney disease (CKD) →
                </Link>
              </li>
              <li>
                <Link href="/guides/cats" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse cat guides →
                </Link>
              </li>
              <li>
                <Link href="/species/cats" className="text-orange-300 hover:text-orange-200 font-medium">
                  Cats hub →
                </Link>
              </li>
              <li>
                <Link href="/nutrition-guide" className="text-orange-300 hover:text-orange-200 font-medium">
                  Nutrition guide →
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ (boundaries & safety context) →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>VCA Animal Hospitals</li>
              <li>University hospital resources</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
